#!/usr/bin/env bash
# inbox_ack.sh — 收信歸檔一步做完：印摘要＋REPORT 路徑 → 併進 done/<日期>/messages.json
# 並重寫 messages.md 索引 → 原檔移到 .state/acked/ → ack-log.md 記一行（--state）。預設 dry-run。
# 移植自 moddings/skyrim agentctl/tools/agent_inbox/inbox_ack.sh（2026-10-23）：放信處改成
# 本檔旁的 ../inbox（＝wf/inbox），STATE 預設改 wf/workflows/dispatch/handoffs/STATE.md。
set -uo pipefail

readonly TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly INBOX_ROOT="${WF_INBOX_ROOT:-${AGENT_INBOX_ROOT:-$TOOLS_DIR/../inbox}}"
readonly DEFAULT_STATE_FILE="$INBOX_ROOT/done/ack-log.md"

usage() {
    cat <<'EOF'
Usage: inbox_ack.sh (<message>... | --all | --from <line>) [--state '一行'] [--state-file PATH] [--apply]

  <message>        path or bare file name of a message in new/ or mail/<x>/
  --all            every message in new/
  --from <line>    every message in new/ and mail/*/ whose `from:` is <line>
  --state '一行'   append "- HH:MM <from> <STATUS>：一行" to the ack log (once per run)
  --state-file P   log file to append to; default $AGENT_STATE_FILE, else
                   <inbox>/done/ack-log.md (wf/inbox/done/ack-log.md)
  --apply          actually archive; without it only print what would happen

For each message: print summary + any REPORT.md paths named in the body, add a
row to inbox/done/<message date>/messages.json (wf-table/1; same columns as
existing days), regenerate that day's messages.md index, then move the original
to inbox/.state/acked/ (gitignored, recoverable). Committing done/ is still the
dispatcher's job (git add wf/inbox/done/<日期>/messages.*).
Exit: 0 ok, 1 error, 2 usage.
EOF
}

messages=()
all=0
from_line=''
state_text=''
state_file="${AGENT_STATE_FILE:-}"
apply=0

while (( $# > 0 )); do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        --all) all=1; shift ;;
        --from) (( $# >= 2 )) || { usage >&2; exit 2; }; from_line=$2; shift 2 ;;
        --state) (( $# >= 2 )) || { usage >&2; exit 2; }; state_text=$2; shift 2 ;;
        --state-file) (( $# >= 2 )) || { usage >&2; exit 2; }; state_file=$2; shift 2 ;;
        --apply) apply=1; shift ;;
        -*) usage >&2; exit 2 ;;
        *) messages+=("$1"); shift ;;
    esac
done

if (( ${#messages[@]} == 0 && all == 0 )) && [[ -z $from_line ]]; then
    usage >&2
    exit 2
fi
[[ -n $state_file ]] || state_file="$DEFAULT_STATE_FILE"

exec python3 - "$INBOX_ROOT" "$state_file" "$state_text" "$apply" "$all" "$from_line" \
    "${messages[@]+"${messages[@]}"}" <<'PY'
import json, os, re, sys, time
from pathlib import Path

root, state_file, state_text, apply, all_new, from_line, *wanted = sys.argv[1:]
root = Path(os.path.realpath(root)); apply = apply == '1'   # 正規化：INBOX_ROOT 含 ../ 或 symlink 時，glob 出來的路徑才比得上
COLUMNS = ['file', 'from', 'status', 'at', 'source', 'body', 'title']
NAME_RE = re.compile(r'^(\d{8})T\d{4}-.+-[A-Z-]+\.md$')

def die(msg):
    print(f'inbox_ack: {msg}', file=sys.stderr); sys.exit(1)

def parse(path):
    text = path.read_text(encoding='utf-8')
    meta, body = {}, text
    lines = text.splitlines()
    if lines and lines[0] == '---':
        for i, line in enumerate(lines[1:], 1):
            if line == '---':
                body = '\n'.join(lines[i + 1:]).lstrip('\n'); break
            k, _, v = line.partition(': ')
            meta[k] = v
    title = next((l[2:].strip() for l in body.splitlines() if l.startswith('# ')), '')
    return meta, body, title

def locate(name):
    p = Path(name)
    if p.is_file():
        return p.resolve()
    for cand in [root / 'new' / name, *sorted((root / 'mail').glob(f'*/{name}'))]:
        if cand.is_file():
            return cand.resolve()
    die(f'message not found: {name}')

targets = [locate(n) for n in wanted]
if all_new == '1':
    targets += sorted((root / 'new').glob('*.md'))
if from_line:
    for d in [root / 'new', *sorted((root / 'mail').glob('*/'))]:
        for p in sorted(d.glob('*.md')):
            if parse(p)[0].get('from') == from_line:
                targets.append(p)
seen, uniq = set(), []
for t in targets:
    t = t.resolve()
    if t not in seen and t.name != 'README.md':
        seen.add(t); uniq.append(t)
if not uniq:
    print('inbox_ack: nothing to ack', file=sys.stderr); sys.exit(0)

def regen_md(day_dir, day, rows):
    md = day_dir / 'messages.md'
    if md.exists() and not md.read_text(encoding='utf-8').startswith(f'# {day} 已辦訊息索引'):
        print(f'  ! {md} 不是自動產生的格式，不重寫（json 已更新）', file=sys.stderr); return
    src, st = {}, {}
    for r in rows:
        src[r.get('source', '?')] = src.get(r.get('source', '?'), 0) + 1
        st[r.get('status', '?')] = st.get(r.get('status', '?'), 0) + 1
    head = [f'# {day} 已辦訊息索引', '',
            f'本日共 {len(rows)} 則；正文在 [messages.json](messages.json)（{len(rows)} 列）。',
            '來源：' + '、'.join(f'{k} {v} 則' for k, v in src.items()) + '。',
            '欄位：file＝原檔名；from＝發信者；status＝狀態；at＝時刻；source＝來源；body＝正文；title＝標題；original＝原件路徑。',
            '', '## 統計', '', '、'.join(f'{k} {v} 則' for k, v in sorted(st.items())), '']
    table = ['<!-- wf-nav -->', '', '| # | from | status | 一句話 |', '|---:|---|---|---|']
    for i, r in enumerate(rows, 1):
        t = r.get('title', '').replace('|', '｜')
        t = t if len(t) <= 32 else t[:32] + '…'
        table.append(f"| {i} | {r.get('from', '')} | {r.get('status', '')} | {t} |")
    out = '\n'.join(head + table) + '\n'
    if len(out.encode()) > 8192:      # 放得下才附逐則一句話（done/README）
        out = '\n'.join(head) + '\n'
    md.write_text(out, encoding='utf-8')

acked = []
for path in uniq:
    meta, body, title = parse(path)
    m = NAME_RE.match(path.name)
    if not m:
        die(f'not an inbox message file name: {path.name}')
    day = f'{m.group(1)[:4]}-{m.group(1)[4:6]}-{m.group(1)[6:]}'
    try:
        rel = path.resolve().parent.relative_to(root).as_posix() + '/'
    except ValueError:
        die(f'message is outside the inbox: {path}')
    reports = sorted(set(re.findall(r'[\w./~-]*REPORT\.md', body)))
    print(f"[ACK] {meta.get('from', 'UNKNOWN')} {meta.get('status', 'UNKNOWN')} — {title or '（缺少標題）'}")
    print(f'  file: {path}')
    for r in reports:
        print(f'  report: {r}')
    day_dir = root / 'done' / day
    print(f'  → done/{day}/messages.json；原檔 → .state/acked/{path.name}')
    acked.append(meta)
    if not apply:
        continue
    day_dir.mkdir(parents=True, exist_ok=True)
    jf = day_dir / 'messages.json'
    if jf.exists():
        data = json.loads(jf.read_text(encoding='utf-8'))
    else:
        data = {'contract': 'wf-table/1', 'source': 'messages.md',
                'extracted': time.strftime('%Y-%m-%d'), 'columns': COLUMNS, 'rows': []}
    if any(r.get('file') == path.name for r in data['rows']):
        print(f'  ! done/{day} 已有 {path.name}，不重複加列', file=sys.stderr)
    else:
        data['rows'].append({'file': path.name, 'from': meta.get('from', ''),
                             'status': meta.get('status', ''), 'at': meta.get('at', ''),
                             'source': rel, 'body': body, 'title': title})
        data['rows'].sort(key=lambda r: r.get('file', ''))
        tmp = jf.with_suffix('.json.tmp')
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        os.replace(tmp, jf)
    regen_md(day_dir, day, data['rows'])
    dest = root / '.state' / 'acked'
    dest.mkdir(parents=True, exist_ok=True)
    os.replace(path, dest / path.name)

if state_text:
    who = sorted({f"{a.get('from', '?')} {a.get('status', '?')}" for a in acked})
    line = f"- {time.strftime('%H:%M')} {'、'.join(who)}：{state_text}"
    print(f'  STATE += {line}  ({state_file})')
    if apply:
        sf = Path(state_file)
        sf.parent.mkdir(parents=True, exist_ok=True)
        new = not sf.exists()
        with sf.open('a', encoding='utf-8') as fh:
            if new:
                fh.write(f"# {time.strftime('%Y-%m-%d')} 現況\n\n")
            fh.write(line + '\n')
if not apply:
    print('（dry-run：加 --apply 才會歸檔）')
PY
