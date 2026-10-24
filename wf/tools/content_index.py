#!/usr/bin/env python3
"""content_index — 產生／驗證分片內容索引 `content/index/`（wf-table/1，不手寫）。

用法：
    python3 -I wf/tools/content_index.py            # 重產索引（只重寫有變動的分片）
    python3 -I wf/tools/content_index.py --check    # 逐分片與實際檔案比對，過時 exit 1（npm test 會跑）
    python3 -I wf/tools/content_index.py refs <id>  # 即時算誰引用它（引用數會頻繁變動，不進分片）
    python3 -I wf/tools/content_index.py --root <repo> [--dir DIR]

掃 `content/base/**`、`content/lore/**` 在 git 索引（staged 版本）中、有字串 `id` 的 JSON（registries、rules、timeline、
glossary 這類無 id 的表不列）。**按類別分片**：`content/index/<pack>-<kind>.json`（例 base-frame、
base-monster、lore-character）；單片超過 SHARD_MAX_ROWS 列或 SHARD_MAX_BYTES 位元組時，按 grade
二次分片 `<pack>-<kind>-<grade>.json`（無等級者 `-x`）。每列只放查詢必要欄：
  id、kind、grade（grade／tier／soulGrade／gradeRange）、name、faction／family／lineage
  （取自欄位與 `faction-*`／`lineage-*` tags；怪獸 family 由 species 推）、tags（空白分隔）、
  path（相對 content/）、batch（`content/batches/<YYYY-MM>/*.json` 帳本，舊內容空白）、
  status（active／draft／deprecated）。不放描述長文。
單片不足 1 KB 的小類併進 `<pack>-misc.json`（照 wf/STRUCTURE.md 小檔合併）。另寫
`content/index/_summary.json`（wf-table/1，≤ 8 KB）：各分片的類別、件數、各級分布，header 帶 batch 件數。
`content/index/README.md` 是手寫的導航入口（不由本工具產生）。
查詢一律 `wf/tools/tabledb.py <分片> find k=v`／`grep RE`，不整份讀。
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

COLUMNS = ['id', 'kind', 'grade', 'name', 'faction', 'family', 'lineage', 'tags', 'path',
           'batch', 'status']
SHARD_MAX_ROWS = 2000
SHARD_MAX_BYTES = 512 * 1024
SUMMARY_MAX_BYTES = 8 * 1024
SMALL_BYTES = 1024
PACKS = ('base', 'lore')


def walk_strings(v):
    if isinstance(v, str):
        yield v
    elif isinstance(v, dict):
        for x in v.values():
            yield from walk_strings(x)
    elif isinstance(v, list):
        for x in v:
            yield from walk_strings(x)


def grade_of(d):
    for k in ('grade', 'tier', 'soulGrade'):
        if isinstance(d.get(k), str):
            return d[k]
    gr = d.get('gradeRange')
    if isinstance(gr, list) and gr and all(isinstance(g, str) for g in gr):
        return gr[0] if len(gr) == 1 else f'{gr[0]}–{gr[-1]}'
    if isinstance(gr, dict):
        lo, hi = gr.get('min') or gr.get('from'), gr.get('max') or gr.get('to')
        if isinstance(lo, str) and isinstance(hi, str):
            return f'{lo}–{hi}'
    return ''


def short(ref):
    return ref.split(':', 1)[-1].rsplit('/', 1)[-1] if isinstance(ref, str) else ''


def joined(values):
    out = []
    for v in values:
        if v and v not in out:
            out.append(v)
    return ','.join(out)


def load_batches(root, ref=None):
    """`content/batches/<YYYY-MM>/<id>.json`（也接受直接放在 batches/ 下）；與內容同一來源（git 索引或 ref）。"""
    by_path, deprecated, counts = {}, set(), {}
    files = staged_files(root, ref, ['content/batches'])
    if files is None:
        files = [(f.as_posix(), f.read_bytes()) for f in sorted((root / 'content' / 'batches').rglob('*.json'))]
    for name, raw in files:
        try:
            m = json.loads(raw.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            raise SystemExit(f'{name}: batch 帳本不是合法 JSON：{e}')
        bid = m.get('id', Path(name).stem)
        status = 'active' if m.get('status') == 'accepted' else 'draft'
        files = m.get('files', [])
        counts[bid] = {'status': m.get('status', ''), 'date': m.get('date', ''), 'files': len(files)}
        for p in files:
            by_path[p] = (bid, status)
        deprecated.update(m.get('deprecated', []))
    return by_path, deprecated, counts


def staged_files(root, ref=None, dirs=None):
    """git 索引（staged）裡 content/base、content/lore 的 JSON：[(path, bytes)]。讀的是索引版本，
    不是工作樹——別線還沒 `git add` 的改動與新檔不影響索引檢查，`git add` 之後再重產即可。
    不是 git repo 時回傳 None。"""
    cmd = ['ls-tree', '-r', '-z', ref] if ref else ['ls-files', '-s', '-z']
    ls = subprocess.run(['git', '-C', str(root), *cmd, '--', *(dirs or [f'content/{p}' for p in PACKS])],
                        capture_output=True)
    if ls.returncode != 0:
        return None
    items = []
    for rec in ls.stdout.decode('utf-8').split('\0'):
        if not rec:
            continue
        meta, path = rec.split('\t', 1)
        if path.endswith('.json'):
            items.append((path, meta.split()[2] if ref else meta.split()[1]))
    if not items:
        return []
    cat = subprocess.run(['git', '-C', str(root), 'cat-file', '--batch'],
                         input=''.join(f'{sha}\n' for _, sha in items).encode(), capture_output=True, check=True)
    out, buf, pos = [], cat.stdout, 0
    for path, _ in items:
        nl = buf.index(b'\n', pos)
        size = int(buf[pos:nl].split()[2])
        out.append((path, buf[nl + 1:nl + 1 + size]))
        pos = nl + 1 + size + 1
    return sorted(out)


def scan(root, ref=None):
    files = staged_files(root, ref)
    if files is None:
        files = [(f.relative_to(root).as_posix(), f.read_bytes())
                 for pack in PACKS for f in sorted((root / 'content' / pack).rglob('*.json'))]
    entries = []
    for rel, raw in files:
        pack = rel.split('/')[1]
        try:
            d = json.loads(raw.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            continue  # 壞檔交給 npm run check／lore check 報
        if isinstance(d, dict) and isinstance(d.get('id'), str) and '/' in d['id']:
            entries.append((pack, rel, d))
    return entries


def refs_to(root, target):
    """即時算引用：base 檔的 `kind/name`／`base:kind/name` 指 base；lore 檔的 `base:` 指 base、裸值指 lore。"""
    pack_t, id_t = ('lore', target[5:]) if target.startswith('lore:') else ('base', target.split(':', 1)[-1])
    hits = []
    for pack, rel, d in scan(root):
        for s in walk_strings({k: v for k, v in d.items() if k != 'id'}):
            key = ('base', s[5:]) if s.startswith('base:') else None if ':' in s else (pack, s)
            if key == (pack_t, id_t):
                hits.append(rel)
                break
    return hits


def build(root, ref=None):
    root = Path(root)
    entries = scan(root, ref)
    species = {d['id']: d for pack, _, d in entries if pack == 'base' and d['id'].startswith('species/')}
    species_family = {k: d.get('family', '') for k, d in species.items()}
    batches, deprecated, counts = load_batches(root, ref)
    rows = []
    for pack, rel, d in entries:
        tags = [t for t in d.get('tags', []) if isinstance(t, str)] if isinstance(d.get('tags'), list) else []
        faction = [t[len('faction-'):] for t in tags if t.startswith('faction-')]
        for k in ('faction', 'holder', 'maker', 'owner'):
            v = d.get(k)
            if isinstance(v, str) and v.startswith('faction'):
                faction.append(short(v))
        if pack == 'lore' and isinstance(d.get('factions'), list):
            faction += [short(x) for x in d['factions'] if isinstance(x, str)]
        family = d.get('family') if isinstance(d.get('family'), str) else ''
        if not family and isinstance(d.get('species'), str):
            family = species_family.get(d['species'].split(':', 1)[-1], '')
        lineage = [t[len('lineage-'):] for t in tags if t.startswith('lineage-')]
        if isinstance(d.get('lineage'), str):
            lineage.append(short(d['lineage']))
        name = next((d[k] for k in ('name', 'title', 'epithet') if isinstance(d.get(k), str)), '')
        if not name and isinstance(d.get('species'), str):  # 怪獸個體沒名字時取族名
            name = str(species.get(d['species'].split(':', 1)[-1], {}).get('name', ''))
        batch, status = batches.get(rel, ('', 'active'))
        if rel in deprecated or 'deprecated' in tags:
            status = 'deprecated'
        rows.append((pack, {
            'id': d['id'], 'kind': d['id'].rsplit('/', 1)[0], 'grade': grade_of(d), 'name': name,
            'faction': joined(faction), 'family': family, 'lineage': joined(lineage),
            'tags': ' '.join(tags), 'path': rel[len('content/'):], 'batch': batch, 'status': status,
        }))
    rows.sort(key=lambda pr: (pr[0], pr[1]['kind'], pr[1]['id'], pr[1]['path']))
    return rows, counts


def render(rows, source):
    head = {'contract': 'wf-table/1', 'source': source, 'extracted': 'generated',
            'generator': 'wf/tools/content_index.py', 'columns': COLUMNS, 'link_columns': ['path']}
    out = json.dumps(head, ensure_ascii=False)[:-1] + ',\n "rows": [\n'
    out += ',\n'.join(' ' + json.dumps(r, ensure_ascii=False) for r in rows)
    return out + '\n ]}\n'


def shards(rows):
    """回傳 ({分片檔名: 文字}, {分片檔名: [kind…]})。分法照 wf/STRUCTURE.md「結構整理原則」：
    按語意（pack＋kind）分；單片 < SMALL_BYTES 的小類併進 `<pack>-misc.json`（觸發 A-5 小檔太多→合併）；
    單片超過 SHARD_MAX_ROWS／SHARD_MAX_BYTES 再按 grade 二次分（暫定門檻，STRUCTURE 未涵蓋資料檔上限）。
    path 欄相對 content/，分片在 content/index/，連結要加 ../。"""
    groups = {}
    for pack, r in rows:
        groups.setdefault((pack, r['kind']), []).append(dict(r, path='../' + r['path']))
    out, kinds_of, misc = {}, {}, {}
    for (pack, kind), rs in groups.items():
        name = f'{pack}-{kind.replace("/", "-")}'
        text = render(rs, 'README.md')
        size = len(text.encode())
        if size < SMALL_BYTES:
            misc.setdefault(pack, []).extend(rs)
            kinds_of.setdefault(f'{pack}-misc.json', []).append(kind)
        elif len(rs) > SHARD_MAX_ROWS or size > SHARD_MAX_BYTES:
            by_grade = {}
            for r in rs:
                by_grade.setdefault((r['grade'] or 'x').replace('–', '-'), []).append(r)
            for g, part in by_grade.items():
                out[f'{name}-{g}.json'] = render(part, 'README.md')
                kinds_of[f'{name}-{g}.json'] = [kind]
        else:
            out[f'{name}.json'] = text
            kinds_of[f'{name}.json'] = [kind]
    for pack, rs in misc.items():
        rs.sort(key=lambda r: (r['kind'], r['id']))
        out[f'{pack}-misc.json'] = render(rs, 'README.md')
    return out, kinds_of


def summary(rows, counts, files, kinds_of):
    """`_summary.json`：wf-table/1，一片一列（shard 連結、kinds、count、grades），header 帶 batch 件數。"""
    table = []
    for name in sorted(files):
        rs = json.loads(files[name])['rows']
        grades = {}
        for r in rs:
            grades[r['grade'] or '-'] = grades.get(r['grade'] or '-', 0) + 1
        table.append({'shard': name, 'kinds': ' '.join(sorted(kinds_of[name])), 'count': str(len(rs)),
                      'grades': ' '.join(f'{g}:{n}' for g, n in sorted(grades.items()))})
    head = {'contract': 'wf-table/1', 'source': 'README.md', 'extracted': 'generated',
            'generator': 'wf/tools/content_index.py', 'total': len(rows), 'batches': counts,
            'columns': ['shard', 'kinds', 'count', 'grades'], 'link_columns': ['shard']}
    out = json.dumps(head, ensure_ascii=False)[:-1] + ',\n "rows": [\n'
    out += ',\n'.join(' ' + json.dumps(r, ensure_ascii=False) for r in table)
    text = out + '\n ]}\n'
    if len(text.encode()) > SUMMARY_MAX_BYTES:
        raise SystemExit(f'_summary.json {len(text.encode())} B > {SUMMARY_MAX_BYTES} B：分片太多，先合併小類')
    return text


def expected(root, ref=None):
    rows, counts = build(root, ref)
    files, kinds_of = shards(rows)
    files['_summary.json'] = summary(rows, counts, files, kinds_of)
    return files


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('cmd', nargs='*', help='refs <id>')
    ap.add_argument('--root', default=str(Path(__file__).resolve().parents[2]))
    ap.add_argument('--dir')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args(argv)
    root = Path(a.root)
    if a.cmd:
        if a.cmd[0] != 'refs' or len(a.cmd) != 2:
            raise SystemExit('子指令只有 refs <id>')
        hits = refs_to(root, a.cmd[1])
        print(json.dumps({'id': a.cmd[1], 'refs': len(hits), 'files': hits}, ensure_ascii=False))
        return 0
    out = Path(a.dir) if a.dir else root / 'content' / 'index'
    want = expected(root)
    have = {f.name: f.read_text(encoding='utf-8') for f in out.glob('*.json')} if out.is_dir() else {}
    stale = sorted(n for n in set(want) | set(have) if want.get(n) != have.get(n))
    if a.check:
        if not stale:
            print(f'OK {out} {len(want)} 分片與內容一致')
            return 0
        # 別線已 `git add` 未 commit 的改動不該讓所有人變紅：索引若與 HEAD 一致也算過。
        head = expected(root, 'HEAD') if staged_files(root) is not None else None
        if head is not None and all(head.get(n) == have.get(n) for n in set(head) | set(have)):
            print(f'OK {out} 與 HEAD 一致（staged 改動 {len(stale)} 片待重產，commit 前跑 npm run content:index）')
            return 0
        for n in stale:
            what = '缺' if n not in have else '多餘' if n not in want else '過時'
            print(f'STALE {what} {n}')
        print(f'FAIL {out} 過時 {len(stale)} 片：跑 `npm run content:index` 重產後一起 commit')
        return 1
    out.mkdir(parents=True, exist_ok=True)
    for n in stale:
        if n in want:
            (out / n).write_text(want[n], encoding='utf-8')
        else:
            (out / n).unlink()  # 自己產生的分片，類別消失才會走到
    print(f'{out}：{len(want)} 片，重寫 {len([n for n in stale if n in want])}、移除 {len([n for n in stale if n not in want])}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
