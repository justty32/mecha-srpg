已讀清單（cx-wc-01 親自讀；規矩與計畫均從主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 讀取，以下路徑相對該根目錄）：

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/plan-wanchao/plan.md`
- `content/lore/events/wreck-crown.json`
- `content/lore/events/aegir-wakes.json`
- `wf/workflows/dispatch/handoffs/lead-wanchao/plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-wanchao/plan/new-events.json`
- `wf/workflows/dispatch/handoffs/lead-wanchao/plan/inserts.json`
- `wf/workflows/dispatch/handoffs/lead-wanchao/plan/timeline-ops.json`
- `wf/workflows/dispatch/handoffs/lead-wanchao/plan/base-drafts.json`
- `wf/workflows/dispatch/handoffs/lead-wanchao/plan/review-draft.json`
- `wf/workflows/dispatch/handoffs/lead-wanchao/cx-wc-01.md`

件數：worktree 只新增 `content/lore/events/wanchao-northward.json`（黑脊北行）、`content/lore/events/wanchao-at-gate.json`（城門未開）。報告目錄五檔：inserts 7 列、timeline-ops 2 列、base-drafts 14 列、review 25 列及本報告。處置共 25 件，四表合計 48 列。十四列「文案大綱」均已換成可上屏定稿，欄名與依賴保留。未改任何既有檔，未 commit。

自查結果（固定三條）：

1. worktree 根 `node content/lore/check.ts`：errors=0；`git status --short` 僅兩個新事件檔與預置 node_modules symlink。兩個新事件的未列年表警告由領導套用年表處理；另兩個警告來自既有事件。兩事件均無根 visibility、occurs=possible、tags=["tide"]。
2. 報告目錄五檔齊全，四份 wf-table/1 JSON 與兩個事件 JSON 可解析。七列原錨在主 repo 與 worktree 對應 body 均恰好一次，含法蒂瑪、茉莉；錨未改。base 文案各不超過 200 字，review 白話各不超過 60 字，報告檔總容量低於 60 KB。
3. 兩事件與四表文字對 style.md 禁用詞 grep 0 命中；錯誤姓名與中文長年份寫法 0 命中。事件本文無交接書所列設計字眼，事件引用 id 均存在。

需要決定的事：無新增待答問題。沿用計畫的既有落差說明：沉船加冕的既有交戰與在場勢力不在本線重寫範圍。法蒂瑪、茉莉的錨以目前主 repo 驗為唯一；領導若先合入其他潤飾，再依 inserts 備註確認後插入。河口文案保留向哨兵問訊的入口，封口／未封口的條件報訊放在 base-drafts 執行說明，待既定引擎依賴接入；未將互斥結果一同寫成已發生。

終局：DONE。cx-wc-01／teams/wanchao。驗收僅依交接書固定三條，完成即停。
