#!/usr/bin/env bash
# wf-lint-local.sh — project-owned hook（wf-lint.sh 自動呼叫：bash <本檔> <掃描根> <strict 0/1>）。
# 本專案的在地檢查：現役交接書（dispatch/handoffs/*.md，不含 README/STATE、不下鑽 done/ superseded/）
# 要過 brief_lint。只印 finding 行；非 0 結束碼由 wf-lint 計入 local=N（--strict 才算失敗）。
set -u
root=${1:-.}; strict=${2:-0}
dir="$root/wf/workflows/dispatch/handoffs"
[[ -d $dir ]] || exit 0
files=()
for f in "$dir"/*.md; do
  [[ -f $f ]] || continue
  case "$(basename "$f")" in README.md|STATE.md|TEMPLATE*) continue ;; esac
  files+=("$f")
done
[[ ${#files[@]} -eq 0 ]] && exit 0
args=(); [[ $strict -eq 1 ]] && args+=(--strict)
python3 "$root/wf/tools/brief_lint.py" --root "$root" "${args[@]}" "${files[@]}" | sed 's/^/LOCAL brief_lint: /'
exit "${PIPESTATUS[0]}"
