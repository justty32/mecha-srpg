#!/usr/bin/env bash
# cx_launch.sh — 開一條互動式 codex 線（tmux）。移植自 moddings/skyrim agentctl（2026-10-03 版），
# 2026-10-23 改成本專案路徑：把 wf/workflows/dispatch/driving-cli-agents.md 的啟動步驟與
# dispatch/lessons「送 Enter 要驗證」寫成一支：文字與 Enter 分開送、4 秒後看畫面有沒有 Working，
# 沒有就補 Enter。只開 tmux＋codex，不取鎖、不開 GUI。非互動式派線改用 codex exec（dispatch/codex-exec.md）。
set -uo pipefail

TMUX_BIN=${TMUX_BIN:-tmux}
CX_SLEEP=${CX_SLEEP:-sleep}      # 測試用：設成 true 跳過等待
TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_INBOX="$(cd "$TOOLS_DIR/../inbox" 2>/dev/null && pwd)" || DEFAULT_INBOX=''

usage() {
    cat <<'EOF'
Usage: cx_launch.sh <session> <handoff.md> [options]

Open tmux session <session>, start codex in it, send one instruction that points
at <handoff.md>, then verify the line actually started working.

  --dir DIR         working directory (default: current directory)
  --model M         pass `-m M` to codex. Default: none — plain `codex` uses its
                    configured default (~/.codex/config.toml: gpt-6-astra). gpt-6-sol
                    also works. Do NOT pass `gpt-sol`: that alias errors on a ChatGPT
                    account.
  --sandbox MODE    pass `-s MODE` (default workspace-write; config default is
                    danger-full-access, so this is always passed). `none` = omit.
  --add-dir DIR     extra writable dir, repeatable. Default: this project's
                    wf/inbox (so the line can report). Passing any --add-dir
                    replaces the default; add wf/inbox yourself if needed.
  --prompt TEXT     instruction to send (default: 讀交接書並照做，見下)
  --boot-timeout N  seconds to wait for codex's composer / trust prompt (default 40)
  --verify-wait N   seconds between Enter and the Working check (default 4)
  --tries N         Enter attempts before giving up (default 3)
  --dry-run         print the tmux commands, run nothing
  -h, --help        this help

Steps: refuse if <session> exists → `tmux new-session -d -s <session> -x 200 -y 50
-c DIR` → send `codex [-m M] -s MODE --add-dir …` + Enter → poll capture-pane: trust prompt → Enter;
composer (›) → ready → send text with `send-keys -l` → Enter in a separate call →
sleep 4 → capture-pane must show `Working`/`esc to interrupt`, else Enter again.

Exit: 0 started; 1 tmux/env error; 2 usage; 3 never showed Working (text is
probably stuck in the composer — attach and look); 4 session already exists;
5 codex did not come up within --boot-timeout.
Watch it afterwards with cx_watch.sh <session>.
EOF
}

session='' handoff='' dir=$PWD model='' prompt='' boot_timeout=40 verify_wait=4 tries=3 dry=0
sandbox=workspace-write add_dirs=() add_set=0
positional=()
while (( $# > 0 )); do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        --dir) dir=${2:?}; shift 2 ;;
        --model) model=${2:?}; shift 2 ;;
        --sandbox) sandbox=${2:?}; shift 2 ;;
        --add-dir) add_dirs+=("${2:?}"); add_set=1; shift 2 ;;
        --prompt) prompt=${2:?}; shift 2 ;;
        --boot-timeout) boot_timeout=${2:?}; shift 2 ;;
        --verify-wait) verify_wait=${2:?}; shift 2 ;;
        --tries) tries=${2:?}; shift 2 ;;
        --dry-run) dry=1; shift ;;
        -*) usage >&2; exit 2 ;;
        *) positional+=("$1"); shift ;;
    esac
done
(( ${#positional[@]} == 2 )) || { usage >&2; exit 2; }
session=${positional[0]} handoff=${positional[1]}
case "$session" in ''|*[!A-Za-z0-9._-]*) echo "cx_launch: bad session name: $session" >&2; exit 2 ;; esac
for n in "$boot_timeout" "$verify_wait" "$tries"; do
    case "$n" in ''|*[!0-9]*) echo "cx_launch: numeric option expected: $n" >&2; exit 2 ;; esac
done
[[ -f $handoff ]] || { echo "cx_launch: handoff not found: $handoff" >&2; exit 2; }
[[ -d $dir ]] || { echo "cx_launch: dir not found: $dir" >&2; exit 2; }
handoff=$(cd "$(dirname "$handoff")" && pwd)/$(basename "$handoff")
[[ -n $prompt ]] || prompt="請讀 $handoff ，照裡面的交接書執行（先讀它點名的 AGENTS.md 與 wf 規矩）；驗收條數以交接書為準，REPORT 是交付物、直接寫檔。"
(( add_set )) || { [[ -z $DEFAULT_INBOX ]] || add_dirs=("$DEFAULT_INBOX"); }

codex_cmd='codex'
[[ -z $model ]] || codex_cmd+=" -m $model"
[[ $sandbox == none ]] || codex_cmd+=" -s $sandbox"
for a in "${add_dirs[@]+"${add_dirs[@]}"}"; do codex_cmd+=" --add-dir $(printf '%q' "$a")"; done

log() { printf 'cx_launch: %s\n' "$*" >&2; }
t() {
    if (( dry )); then printf '[dry-run] %s' "$TMUX_BIN"; printf ' %q' "$@"; printf '\n'; return 0; fi
    "$TMUX_BIN" "$@"
}
screen() { "$TMUX_BIN" capture-pane -t "$session" -p 2>/dev/null; }   # 不加 -S：alt-screen 抓不到

if (( dry )); then
    t new-session -d -s "$session" -x 200 -y 50 -c "$dir"
    t send-keys -t "$session" -l "$codex_cmd"; t send-keys -t "$session" Enter
    echo "[dry-run] poll capture-pane ≤${boot_timeout}s: trust prompt → Enter; › composer → ready"
    t send-keys -t "$session" -l "$prompt"; t send-keys -t "$session" Enter
    echo "[dry-run] sleep $verify_wait; capture-pane must show Working, else Enter (≤$tries tries)"
    exit 0
fi

if "$TMUX_BIN" has-session -t "=$session" 2>/dev/null; then
    log "session $session already exists; refusing (kill it or pick another name)"
    exit 4
fi
"$TMUX_BIN" new-session -d -s "$session" -x 200 -y 50 -c "$dir" || { log 'tmux new-session failed'; exit 1; }
"$TMUX_BIN" send-keys -t "$session" -l "$codex_cmd" || exit 1
"$TMUX_BIN" send-keys -t "$session" Enter || exit 1

# 等 codex 起來：trust 提示要先 Enter；看到 › 輸入框才算可以送字。
ready=0 trusted=0 waited=0
while (( waited < boot_timeout )); do
    $CX_SLEEP 1; (( waited += 1 ))
    s=$(screen)
    if (( !trusted )) && grep -q 'Do you trust' <<< "$s"; then
        log 'trust prompt → Enter'; "$TMUX_BIN" send-keys -t "$session" Enter; trusted=1; continue
    fi
    if grep -q '›' <<< "$s"; then ready=1; break; fi
done
(( ready )) || { log "codex composer not seen within ${boot_timeout}s"; screen | tail -8 >&2; exit 5; }
$CX_SLEEP 3   # 剛起來的 15～20 秒第一個 Enter 常被吃掉；多等一下再送

"$TMUX_BIN" send-keys -t "$session" -l "$prompt" || exit 1
attempt=0
while (( attempt < tries )); do
    "$TMUX_BIN" send-keys -t "$session" Enter || exit 1   # 與文字分開的一次呼叫
    (( attempt += 1 ))
    $CX_SLEEP "$verify_wait"
    if screen | grep -Eq 'Working|esc to interrupt'; then
        log "started (Enter x$attempt)"
        printf '%s\n' "$session"
        exit 0
    fi
    log "no Working after Enter #$attempt; retrying"
done
log "never showed Working after $tries Enter; text likely stuck in the composer"
screen | tail -8 >&2
exit 3
