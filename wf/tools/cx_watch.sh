#!/usr/bin/env bash
# cx_watch.sh — 監看一或多條 tmux 裡的 codex 線直到有事。移植自 moddings/skyrim agentctl
# （2026-10-03 版），2026-10-23 改成本專案路徑。判活看 pane_pid 的子行程樹（dispatch/lessons：
# 畫面上的 Working 可能是死 scrollback）。新信：唯讀掃 wf/inbox 裡 from: 為該線的信（不標已讀、
# 不搬檔；本專案的 inbox_poll.sh 沒有 --from）。前景跑，領隊不要用結束回合當等待。
set -uo pipefail

TMUX_BIN=${TMUX_BIN:-tmux}
PROC_ROOT=${CX_PROC_ROOT:-/proc}
readonly TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INBOX_ROOT=${WF_INBOX_ROOT:-${AGENT_INBOX_ROOT:-$TOOLS_DIR/../inbox}}

usage() {
    cat <<'EOF'
Usage: cx_watch.sh <session>... [--recipient R] [--timeout N] [--interval N] [--stall N] [--once]

Block until one of the watched codex lines needs attention, then print one
event line per finding and exit with its code.

  --recipient R  whose inbox the lines report to (default: dispatcher, i.e.
                 wf/inbox/new/; a lead passes its own session = mail/<R>/).
                 Messages whose frontmatter `from:` is <session> are reported;
                 nothing is marked read or moved. A terminal message still
                 sitting there from an earlier run with the same line name
                 fires at once — archive old mail or use a fresh line name.
  --timeout N    give up after N seconds (exit 3; default: wait forever)
  --interval N   seconds between rounds (default 20)
  --stall N      report STALL when the screen hash is unchanged for N seconds
                 while codex is still alive (default 900; 0 = off)
  --once         one round: print ALIVE/EXITED/GONE per session, exit 0 if all alive

Events (first round that has any wins; exit code = highest priority seen):
  MSG <s> <STATUS> …     terminal inbox message (DONE/FAILED/BLOCKED/NEEDS-USER) → 0
  PROGRESS lines are printed and watching continues.
  GONE <s>               tmux session no longer exists                         → 4
  EXITED <s>             pane_pid has no child processes (codex quit)          → 4
  APPROVAL <s> …         approval prompt on screen (Would you like to run, …)  → 5
  STALL <s>              alive but screen unchanged for --stall seconds        → 6
Liveness reads PPid from /proc/*/status (never ps/pgrep -f, which can match
itself). Exit 2 = usage, 3 = timeout.
EOF
}

sessions=() recipient=dispatcher timeout='' interval=20 stall=900 once=0
while (( $# > 0 )); do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        --recipient) recipient=${2:?}; shift 2 ;;
        --timeout) timeout=${2:?}; shift 2 ;;
        --interval) interval=${2:?}; shift 2 ;;
        --stall) stall=${2:?}; shift 2 ;;
        --once) once=1; shift ;;
        -*) usage >&2; exit 2 ;;
        *) sessions+=("$1"); shift ;;
    esac
done
(( ${#sessions[@]} > 0 )) || { usage >&2; exit 2; }
for n in "$interval" "$stall" ${timeout:+"$timeout"}; do
    case "$n" in ''|*[!0-9]*) echo "cx_watch: numeric option expected: $n" >&2; exit 2 ;; esac
done

APPROVAL_RE='Would you like to run|Press enter to confirm|Yes, proceed'

# 直接子行程（讀 /proc/<pid>/status 的 PPid:，不解析 ps 的 stat 欄）
children_of() {
    local want=$1 st pid ppid
    for st in "$PROC_ROOT"/[0-9]*/status; do
        [[ -r $st ]] || continue
        ppid=$(sed -n 's/^PPid:[[:space:]]*//p' "$st" 2>/dev/null)
        [[ $ppid == "$want" ]] || continue
        pid=${st%/status}; pid=${pid##*/}
        printf '%s\n' "$pid"
    done
}

declare -A last_hash=() last_change=()

check_session() {      # 印事件；回傳 0=活著沒事
    local s=$1 pane_pid screen h now
    if ! "$TMUX_BIN" has-session -t "=$s" 2>/dev/null; then
        printf 'GONE %s\n' "$s"; return 4
    fi
    pane_pid=$("$TMUX_BIN" display-message -p -t "$s" '#{pane_pid}' 2>/dev/null)
    if [[ -z $pane_pid || -z $(children_of "$pane_pid") ]]; then
        printf 'EXITED %s (pane_pid=%s has no children)\n' "$s" "${pane_pid:-?}"; return 4
    fi
    screen=$("$TMUX_BIN" capture-pane -t "$s" -p 2>/dev/null)
    if grep -Eq "$APPROVAL_RE" <<< "$screen"; then
        printf 'APPROVAL %s — %s\n' "$s" "$(grep -Em1 "$APPROVAL_RE" <<< "$screen")"; return 5
    fi
    if (( stall > 0 )); then
        h=$(printf '%s' "$screen" | sha1sum | cut -c1-12); now=$(date +%s)
        if [[ ${last_hash[$s]:-} != "$h" ]]; then
            last_hash[$s]=$h; last_change[$s]=$now
        elif (( now - ${last_change[$s]} >= stall )); then
            printf 'STALL %s (screen unchanged %ss)\n' "$s" "$(( now - ${last_change[$s]} ))"; return 6
        fi
    fi
    return 0
}

declare -A noted=()

mail_dirs() {
    if [[ $recipient == dispatcher ]]; then printf '%s\n' "$INBOX_ROOT/new" "$INBOX_ROOT/mail/dispatcher"
    else printf '%s\n' "$INBOX_ROOT/mail/$recipient"; fi
}

check_mail() {         # 終局信回 0，否則 1；只讀，不標已讀、不搬檔
    local s=$1 dir f from status title hit=1
    while IFS= read -r dir; do
        [[ -d $dir ]] || continue
        for f in "$dir"/*.md; do
            [[ -f $f ]] || continue
            from=$(sed -n '1,12s/^from: //p' "$f" | head -1)
            [[ $from == "$s" ]] || continue
            status=$(sed -n '1,12s/^status: //p' "$f" | head -1)
            title=$(grep -m1 '^# ' "$f" | cut -c3-)
            case "$status" in
                DONE|FAILED|BLOCKED|NEEDS-USER) printf 'MSG %s %s — %s — %s\n' "$s" "$status" "$title" "$f"; hit=0 ;;
                *) [[ -n ${noted[$f]:-} ]] || { printf 'NOTE %s %s — %s — %s\n' "$s" "$status" "$title" "$f"; noted[$f]=1; } ;;
            esac
        done
    done < <(mail_dirs)
    return $hit
}

if (( once )); then
    rc=0
    for s in "${sessions[@]}"; do
        out=$(check_session "$s"); r=$?
        if (( r == 0 )); then printf 'ALIVE %s\n' "$s"; else printf '%s\n' "$out"; rc=4; fi
    done
    exit $rc
fi

start=$(date +%s)
while true; do
    best=0 any=0
    for s in "${sessions[@]}"; do
        check_mail "$s" && any=1
        check_session "$s"; r=$?
        if (( r != 0 )); then any=1; (( r > best )) && best=$r; fi
    done
    if (( any )); then exit "$best"; fi
    if [[ -n $timeout ]] && (( $(date +%s) - start >= timeout )); then
        echo "cx_watch: timeout after ${timeout}s; still alive: ${sessions[*]}" >&2
        exit 3
    fi
    sleep "$interval"
done
