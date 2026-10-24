#!/usr/bin/env python3
"""content_accept_eval — content_accept.sh 的判定器（零依賴；被 shell 腳本呼叫，也可單獨跑）。

子指令：
  probe-ids <gate.json>                         由閘門通過檔推出要 probe 的 id（frame／monster／ability／scenario）
  probe <probe.json> <manifest> [<ref.json>]    照 acceptance-playtest 失衡門檻判定，印 JSON，失衡未豁免 exit 1
  playtest <manifest> <repo>                    驗 codex 的 MCP 試玩紀錄（wf-table/1）齊全且有原始 log 佐證
  readlist <manifest> <repo>                    驗 codex REPORT 開頭「已讀清單」列出 manifest report.mustRead 每個檔
  check-warn <base.txt> <new.txt>               列 `npm run check` 新增的警告行
  record <manifest> <verdict.json>              把驗收摘要寫回 manifest 的 acceptance／rounds 欄

失衡門檻（wf/workflows/content/acceptance-playtest.md 第三節）：例外 >0 ＝硬失敗；勝率 <30% 或 >90%、
平手率 >40%、新能力主角 0 使用、新 id 超出數值帶＝旗標。旗標若在參照組（manifest probe.reference，
同級既有單位）對同一對手也出現，視為引擎現況（標 `matchesReference`）不算失敗；其餘要 manifest
`probe.waivers`（{id, flag, reason}）明列才放行。
"""

import json
import sys
from pathlib import Path

PROBE_DIRS = {'base/frames': 'frame', 'base/monsters': 'monster', 'base/abilities': 'ability',
              'base/scenarios': 'scenario'}
PLAY_COLUMNS = ('scenario', 'seed', 'rounds', 'winner', 'reason', 'mode', 'log')


def load(p):
    return json.loads(Path(p).read_text(encoding='utf-8'))


def probe_ids(gate):
    ids = []
    for path in gate.get('approved', []):
        parts = path.split('/')
        if len(parts) == 4 and parts[0] == 'content' and '/'.join(parts[1:3]) in PROBE_DIRS:
            ids.append(f'{PROBE_DIRS["/".join(parts[1:3])]}/{parts[3][:-5]}')
    return ids


def flags_of(result, new_ids):
    out = []
    for b in result.get('bands', []):
        if b['id'].split(':', 1)[-1] in new_ids:
            out.append({'flag': 'band', 'detail': b['message'], 'key': f'band:{b["id"]}:{b["field"]}'})
    for p in result.get('pairings', []):
        name = p['name']
        if p.get('exceptions'):
            out.append({'flag': 'exception', 'hard': True, 'detail': f'{name} 例外 {p["exceptions"]}',
                        'key': f'exception:{name}'})
        if p['winRate'] < 0.30 or p['winRate'] > 0.90:
            out.append({'flag': 'winrate', 'detail': f'{name} 勝率 {p["winRate"]:.0%}', 'key': f'winrate:{name}',
                        'side': 'low' if p['winRate'] < 0.30 else 'high'})
        if p['drawRate'] > 0.40:
            out.append({'flag': 'draw', 'detail': f'{name} 平手率 {p["drawRate"]:.0%}', 'key': f'draw:{name}'})
        for ab in p.get('neverUsedAbilities', []):
            if ab.split(':', 1)[-1] in new_ids:
                out.append({'flag': 'unused-ability', 'detail': f'{name} 主角從未用 {ab}', 'key': f'unused:{ab}'})
    return out


def eval_probe(probe, manifest, ref=None):
    new_ids = set(manifest.get('ids') or [])
    if not new_ids:
        new_ids = {r['id'] for r in probe.get('results', [])}
    ref_keys = set()
    for r in (ref or {}).get('results', []):
        for f in flags_of(r, {r['id']}):
            if f['flag'] in ('winrate', 'draw'):
                ref_keys.add((f['key'], f.get('side')))
    waivers = {(w['id'], w['flag']): w.get('reason', '') for w in manifest.get('probe', {}).get('waivers', [])}
    rows, failed = [], False
    for r in probe.get('results', []):
        for f in flags_of(r, new_ids | {r['id']}):
            f['id'] = r['id']
            if f['flag'] in ('winrate', 'draw') and (f['key'], f.get('side')) in ref_keys:
                f['matchesReference'] = True
            elif (r['id'], f['flag']) in waivers and not f.get('hard'):
                f['waived'] = waivers[(r['id'], f['flag'])]
            else:
                failed = True
            rows.append(f)
        for p in r.get('pairings', []):
            rows.append({'id': r['id'], 'flag': 'stat', 'detail':
                         f'{p["name"]} n={p["n"]} 勝 {p["winRate"]:.0%} 敗 {p["lossRate"]:.0%} 平 {p["drawRate"]:.0%} '
                         f'輪 {p["averageRounds"]:.1f} 原因 {json.dumps(p.get("reasons", {}), ensure_ascii=False)}'})
    return {'ok': not failed, 'rows': rows}


def eval_playtest(manifest, repo):
    spec = manifest.get('playtest') or {}
    need = int(spec.get('required', 0))
    if not need:
        return {'ok': True, 'skipped': True}
    f = Path(repo) / spec['file']
    if not f.exists():
        return {'ok': False, 'problems': [f'缺試玩紀錄 {spec["file"]}']}
    table = load(f)
    rows, problems = table.get('rows', []), []
    if table.get('contract') != 'wf-table/1':
        problems.append('試玩紀錄不是 wf-table/1')
    mcp = []
    for i, r in enumerate(rows):
        miss = [c for c in PLAY_COLUMNS if str(r.get(c, '')).strip() == '']
        if miss:
            problems.append(f'第 {i} 列缺欄 {miss}')
            continue
        if not str(r['mode']).startswith('mcp'):
            continue
        log = (f.parent / r['log']) if not Path(r['log']).is_absolute() else Path(r['log'])
        if not log.exists():
            problems.append(f'第 {i} 列 log 不存在：{r["log"]}')
            continue
        text = log.read_text(encoding='utf-8', errors='replace')
        if str(r['scenario']).split(':', 1)[-1] not in text or 'outcome' not in text:
            problems.append(f'第 {i} 列 log 找不到情境 {r["scenario"]} 或 outcome 字樣')
            continue
        mcp.append(i)
    if len(mcp) < need:
        problems.append(f'有佐證的 MCP 試玩 {len(mcp)} 場 < 要求 {need}')
    return {'ok': not problems, 'mcpRows': len(mcp), 'rows': len(rows), 'problems': problems}


def eval_readlist(manifest, repo):
    spec = manifest.get('report') or {}
    f = Path(repo) / spec.get('file', '')
    if not spec.get('file') or not f.is_file():
        return {'ok': False, 'problems': [f'缺 REPORT {spec.get("file")}']}
    text = f.read_text(encoding='utf-8')
    head = text[:text.find('\n## ', text.find('已讀清單') + 1)] if '已讀清單' in text else ''
    if not head:
        return {'ok': False, 'problems': ['REPORT 沒有「已讀清單」段']}
    missing = [p for p in spec.get('mustRead', []) if p not in head]
    return {'ok': not missing, 'listed': len(spec.get('mustRead', [])) - len(missing),
            'problems': [f'已讀清單沒列 {p}' for p in missing]}


def check_warn(base_txt, new_txt):
    base = set(Path(base_txt).read_text(encoding='utf-8').splitlines())
    return [l for l in Path(new_txt).read_text(encoding='utf-8').splitlines()
            if l not in base and l.startswith('WARNING')]


def record(manifest_path, verdict_path):
    m, v = load(manifest_path), load(verdict_path)
    m.setdefault('rounds', []).append({k: v.get(k) for k in ('round', 'at', 'ok', 'steps')})
    m['acceptance'] = v
    Path(manifest_path).write_text(json.dumps(m, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    cmd, args = argv[0], argv[1:]
    if cmd == 'probe-ids':
        print(' '.join(probe_ids(load(args[0]))))
        return 0
    if cmd == 'probe':
        res = eval_probe(load(args[0]), load(args[1]), load(args[2]) if len(args) > 2 and Path(args[2]).exists() else None)
        print(json.dumps(res, ensure_ascii=False, indent=1))
        return 0 if res['ok'] else 1
    if cmd == 'playtest':
        res = eval_playtest(load(args[0]), args[1])
        print(json.dumps(res, ensure_ascii=False, indent=1))
        return 0 if res['ok'] else 1
    if cmd == 'readlist':
        res = eval_readlist(load(args[0]), args[1])
        print(json.dumps(res, ensure_ascii=False, indent=1))
        return 0 if res['ok'] else 1
    if cmd == 'check-warn':
        for l in check_warn(args[0], args[1]):
            print(l)
        return 0
    if cmd == 'record':
        record(args[0], args[1])
        return 0
    print(f'未知子指令 {cmd}', file=sys.stderr)
    return 2


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
