#!/bin/bash
# 平行跑戰鬥 sweep（lead-playtest sweep.ts）：$1=repo 目錄 $2=輸出 jsonl [$3=seeds，預設 1,2,3,4,5]；每情境一行程，8 並行。彙總：python3 <本目錄>/../../done/2026-10-24/lead-tune-battle/sweep-sum.py 輸出.jsonl
cd "$1" || exit 1
seeds=${3:-1,2,3,4,5}
ids=$(node --input-type=module -e "const {loadContentDirs}=await import('./src/content/loader.ts');const {db}=loadContentDirs(['content/base']);console.log(db.all('scenario').map(s=>s.id).sort().join(' '))")
tmp=$(mktemp -d)
printf '%s\n' $ids | xargs -P 8 -I{} sh -c 'node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/sweep.ts --seeds '"$seeds"' {} > '"$tmp"'/$(echo {} | tr ":/" "__").jsonl 2>&1'
cat $tmp/*.jsonl > "$2"
