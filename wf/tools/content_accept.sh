#!/usr/bin/env bash
# content_accept.sh — 一個內容批次的驗收鏈（閘門 → check → lore → typecheck → test → probe → 試玩 → 已讀清單）。
#
# 用法：bash wf/tools/content_accept.sh <worktree> <batch manifest> [--record]
#   <worktree>  codex 寫入的隔離 git worktree（scratchpad/codex-pilot/wt-<batch>）
#   <manifest>  content/batches/<YYYY-MM>/<batch>.json（主 repo 內，見 wf/workflows/content/README.md）
#   --record    把驗收摘要寫回 manifest 的 acceptance／rounds 欄
# 產物寫到 manifest.reportDir/accept/（gate.json、check.txt、test.tap、probe.json、verdict.json…）。
# 只在 worktree 內跑指令，不碰主工作樹（--record 只寫 manifest）。全部通過 exit 0，否則 exit 1。
# 步驟由 manifest.checks 選（預設全跑）：check lore typecheck test probe playtest readlist；閘門永遠先跑；
# 通過檔含 content/base/world/ 時自動加跑 ops 內容檢查。
set -uo pipefail
WT=$(cd "$1" && pwd); MAN=$(cd "$(dirname "$2")" && pwd)/$(basename "$2"); RECORD=${3:-}
REPO=$(cd "$(dirname "$0")/../.." && pwd)
TOOLS="$REPO/wf/tools"
py() { python3 -I "$@"; }
jget() { py -c 'import json,sys;d=json.load(open(sys.argv[1]));v=eval(sys.argv[2],{"d":d});print(v if isinstance(v,str) else json.dumps(v))' "$MAN" "$1"; }
BASE=$(jget 'd["base"]'); BATCH=$(jget 'd["id"]')
OUT="$REPO/$(jget 'd.get("reportDir","wf/workflows/dispatch/handoffs/_batches/"+d["id"])')/accept"
CHECKS=$(jget '" ".join(d.get("checks",["check","lore","typecheck","test","probe","playtest","readlist"]))')
N=$(jget 'str(d.get("probe",{}).get("n",5))')
mkdir -p "$OUT"
declare -A RES
fail=0
step() { RES[$1]=$2; [ "$2" = ok ] || [ "$2" = skip ] || fail=1; echo "== $1: $2"; }
want() { [[ " $CHECKS " == *" $1 "* ]]; }

# 1. 閘門（不過就停，不跑後面）
py "$TOOLS/content_gate.py" "$WT" "$MAN" --json > "$OUT/gate.json"; rc=$?
if [ $rc -ne 0 ]; then
  step gate fail
  py -c 'import json,sys;[print("VIOLATION",v["path"],v["code"],v["message"]) for v in json.load(open(sys.argv[1]))["violations"]]' "$OUT/gate.json"
else step gate ok; fi

if [ $fail -eq 0 ]; then
  # 索引一致性測試讀 git 索引／HEAD，worktree 的未追蹤新檔不影響它；新檔入索引在帶回 main 後做。

  if want check; then
    BWT="$WT-base"
    [ -d "$BWT" ] || { git -C "$REPO" worktree add -q --detach "$BWT" "$BASE" && ln -s "$REPO/node_modules" "$BWT/node_modules"; }
    (cd "$BWT" && npm run -s check > "$OUT/check-base.txt" 2>&1)
    (cd "$WT" && npm run -s check > "$OUT/check.txt" 2>&1)
    py "$TOOLS/content_accept_eval.py" check-warn "$OUT/check-base.txt" "$OUT/check.txt" > "$OUT/check-new-warnings.txt"
    tail -1 "$OUT/check.txt" | grep -q '^OK 0 errors' && step check ok || step check fail
    echo "   新警告 $(wc -l < "$OUT/check-new-warnings.txt") 條（$OUT/check-new-warnings.txt）"
  fi
  if want lore; then
    (cd "$WT" && node content/lore/check.ts > "$OUT/lore.txt" 2>&1) && step lore ok || step lore fail
  fi
  if grep -q '"content/base/world/' "$OUT/gate.json"; then   # 動到營運內容就加跑 ops 檢查
    (cd "$WT" && node src/ops/content/check.ts content/base > "$OUT/ops-check.txt" 2>&1)
    tail -1 "$OUT/ops-check.txt" | grep -q '^OK 0 errors' && step ops ok || step ops fail
  fi
  if want typecheck; then
    (cd "$WT" && npm run -s typecheck > "$OUT/typecheck.txt" 2>&1) && step typecheck ok || step typecheck fail
  fi
  if want test; then
    (cd "$WT" && npm test > "$OUT/test.tap" 2>&1)
    f=$(grep -E '^# fail ' "$OUT/test.tap" | awk '{print $3}'); p=$(grep -E '^# pass ' "$OUT/test.tap" | awk '{print $3}')
    echo "   pass=${p:-?} fail=${f:-?}"
    { grep -E '^# (tests|pass|fail)' "$OUT/test.tap"; grep -E '^not ok' "$OUT/test.tap"; } > "$OUT/test-summary.txt"
    [ "${f:-1}" = 0 ] && { step test ok; rm -f "$OUT/test.tap"; } || step test fail   # 全綠只留摘要，紅了留完整 tap
    [ -z "$(git -C "$WT" status --short test/golden src/ops/sim/fixtures)" ] && step golden ok || step golden fail
  fi
  if want probe; then
    IDS=$(py "$TOOLS/content_accept_eval.py" probe-ids "$OUT/gate.json")
    REF=$(jget '" ".join(d.get("probe",{}).get("reference",[]))')
    if [ -z "$IDS" ]; then step probe skip; else
      # shellcheck disable=SC2086
      (cd "$WT" && npm run -s content:probe -- $IDS --n "$N" --json "$OUT/probe.json" > "$OUT/probe.txt" 2>&1)
      [ -n "$REF" ] && (cd "$WT" && npm run -s content:probe -- $REF --n "$N" --json "$OUT/probe-ref.json" > "$OUT/probe-ref.txt" 2>&1)
      py "$TOOLS/content_accept_eval.py" probe "$OUT/probe.json" "$MAN" "$OUT/probe-ref.json" > "$OUT/probe-verdict.json" \
        && step probe ok || step probe fail
    fi
  fi
  if want playtest; then
    py "$TOOLS/content_accept_eval.py" playtest "$MAN" "$REPO" > "$OUT/playtest.json" && step playtest ok || step playtest fail
  fi
  if want readlist; then
    py "$TOOLS/content_accept_eval.py" readlist "$MAN" "$REPO" > "$OUT/readlist.json" && step readlist ok || step readlist fail
  fi
fi

ROUND=$(ls "$OUT"/verdict-*.json 2>/dev/null | wc -l); ROUND=$((ROUND + 1))
STEPS=$(for k in "${!RES[@]}"; do printf '%s=%s\n' "$k" "${RES[$k]}"; done)
py - "$OUT" "$ROUND" "$fail" "$BATCH" <<PYEOF > "$OUT/verdict-$ROUND.json"
import json, sys, datetime, pathlib
out, rnd, fail, batch = pathlib.Path(sys.argv[1]), int(sys.argv[2]), sys.argv[3] == '1', sys.argv[4]
steps = dict(l.split('=', 1) for l in """$STEPS""".split('\n') if '=' in l)
gate = json.loads((out / 'gate.json').read_text())
v = {'batch': batch, 'round': rnd, 'at': datetime.datetime.now().isoformat(timespec='seconds'), 'ok': not fail,
     'steps': steps, 'approved': gate['approved'],
     'gateViolations': gate['violations']}
for name in ('probe-verdict', 'playtest', 'readlist'):
    p = out / f'{name}.json'
    if p.exists():
        v[name] = json.loads(p.read_text())
w = out / 'check-new-warnings.txt'
if w.exists():
    v['newWarnings'] = w.read_text().splitlines()
print(json.dumps(v, ensure_ascii=False, indent=1))
PYEOF
cp "$OUT/verdict-$ROUND.json" "$OUT/verdict.json"
[ "$RECORD" = --record ] && py "$TOOLS/content_accept_eval.py" record "$MAN" "$OUT/verdict.json"
echo "$([ $fail -eq 0 ] && echo ACCEPT || echo REJECT) batch=$BATCH round=$ROUND verdict=$OUT/verdict-$ROUND.json"
exit $fail
