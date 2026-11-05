#!/usr/bin/env bash
# wf-lint-local.sh — project-owned hook（wf-lint.sh 自動呼叫：bash <本檔> <掃描根> <strict 0/1>）。
# 本專案的在地檢查：
#   1. 現役交接書（dispatch/handoffs/*.md，不含 README/STATE、不下鑽 done/ superseded/）要過 brief_lint；
#      非 0 結束碼由 wf-lint 計入 local=N（--strict 才算失敗）。
#   2. 只印 warning、永不影響結束碼（2026-11-05 slim-1105）：
#      STALE  handoffs 頂層的檔或目錄超過 14 天沒有 commit（該收線、該刪報告了）
#      HEAVY  wf/ 底下單檔 > 512 KB，或某條線的附件夾合計 > 1 MB（原始證據該放不進版控的 raw/）
set -u
root=${1:-.}; strict=${2:-0}
dir="$root/wf/workflows/dispatch/handoffs"

warn_stale_heavy() {
  git -C "$root" rev-parse --is-inside-work-tree >/dev/null 2>&1 || return 0
  local now cutoff e ts rel
  now=$(date +%s); cutoff=$((now - 14 * 86400))
  if [[ -d $dir ]]; then
    for e in "$dir"/*; do
      [[ -e $e ]] || continue
      case "$(basename "$e")" in README.md) continue ;; esac
      rel=${e#"$root"/}
      ts=$(git -C "$root" log -1 --format=%ct -- "$rel" 2>/dev/null)
      [[ -n $ts && $ts -lt $cutoff ]] && echo "STALE $rel（$(( (now - ts) / 86400 )) 天沒有 commit）"
    done
  fi
  git -C "$root" ls-files -z -- wf | while IFS= read -r -d '' f; do
    [[ -f "$root/$f" ]] || continue
    local sz; sz=$(wc -c <"$root/$f")
    [[ $sz -gt 524288 ]] && echo "HEAVY $f（$((sz / 1024)) KB > 512 KB）"
  done
  if [[ -d $dir ]]; then
    for e in "$dir"/*/; do
      [[ -d $e ]] || continue
      rel=${e#"$root"/}; rel=${rel%/}
      local tot
      tot=$(git -C "$root" ls-files -z -- "$rel" | (cd "$root" && xargs -0 -r cat 2>/dev/null) | wc -c)
      [[ $tot -gt 1048576 ]] && echo "HEAVY $rel/（附件夾 $((tot / 1024)) KB > 1 MB）"
    done
  fi
  return 0
}
warn_stale_heavy

[[ -d $dir ]] || exit 0
files=()
# 頂層＝調度者派的線；第二層 <線名>/cx-*.md＝領導派的子線。REPORT／README／STATE 不是交接書。
while IFS= read -r f; do
  base=$(basename "$f"); rel=${f#"$dir"/}
  case "$base" in README.md|STATE.md|REPORT.md|*-REPORT.md|TEMPLATE*|engine-backlog.md) continue ;; esac
  # 第二層只認 cx-*.md（領導派的子線）；contract.md、附件之類不是交接書
  case "$rel" in */*)
    case "$base" in cx-*.md) ;; *) continue ;; esac
    [[ -f "$dir/${rel%%/*}.md" ]] || continue   # 領導已收線（頂層交接書不在）→ 子線不再掃
  ;; esac
  files+=("$f")
done < <(find "$dir" -maxdepth 2 -name '*.md' -not -path '*/trash/*' -not -path '*/raw/*' | sort)
[[ ${#files[@]} -eq 0 ]] && exit 0
args=(); [[ $strict -eq 1 ]] && args+=(--strict)
python3 "$root/wf/tools/brief_lint.py" --root "$root" "${args[@]}" "${files[@]}" | sed 's/^/LOCAL brief_lint: /'
exit "${PIPESTATUS[0]}"
