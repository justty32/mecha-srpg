# cx-fp-east-plan 固定四條驗收證據

1. **通過**：plan.md 具1–11段；13650 bytes，低於45KB；24組；五歲直方圖齊。16–19歲1/24＝4.17%，邱寧嵐的存活理由與非駕駛職能已列。
2. **通過**：people.json與review-draft.json合法wf-table/1，24／76列；白話最長41字。新姓名（含去空格形）、id、背景中英名及新池名全庫grep為exit 1、0命中；僅排除.git、node_modules及本線east-plan自身成果。原始命令與stdout／stderr：[names-final-grep.log](/tmp/cx-fp-east-plan/names-final-grep.log)。跨區claims重讀無交集：[cross-region-claims.log](/tmp/cx-fp-east-plan/cross-region-claims.log)；本線24名已寫names-claimed.json。
3. **通過**：兩份交接書已實跑 `python3 wf/tools/brief_lint.py wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/cx-fp-east-01.md wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/cx-fp-east-02.md --strict`，exit 0，輸出 `brief_lint: 0 違規／2 檔`。兩份manifest合法JSON，每批38檔、兩批無交集，mode add、status draft、base TBD、maxFiles42、checks指定五項。
4. **通過**：24人的lore地方／勢力／事件／關係id均存在，4池皆掛既有base地點，所有trait指向既有effect，0個萬潮葬王／AI／新effect產出。每人的person↔character↔背景↔池對應有資料；兩批各自包含池所需所有新背景。

此處只驗計畫線原定四條，沒有執行遊戲check、test、probe或playtest。產出線尚未啟動，沒有把草稿驗收冒稱遊戲資料已落地。
