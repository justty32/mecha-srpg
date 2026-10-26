# fg-gm-03 收線報告

## 已讀清單

親自讀過交接書點名的下列檔案；資料表以指定工具查本批／相關列。

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/polish.md`
- `content/lore/style.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-resist/REPORT.md`
- `wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md`
- `wf/workflows/planning/specs/core/data-model-abilities-effects.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/plan.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/new-items.json`

另讀 WORKFLOWS、templates 的部件／能力／效果列及所選範本、acceptance-playtest、lore-text、data-files、conventions、code-map、dev-env、testing，以及 world-pillars 的機械命名、人機關係與世界鐵律細則。

## 交付與四條驗收

本批恰 **14 個新內容檔：10 部件、3 能力、1 效果**。只潤順 `etymology`；逐檔比對 payload，名稱、英文原名、欄位、數值、引用、tags 與來源 id 全部保留。六廠與裝備名仍是提案。沒有修改既有 content、市場、服務、原始碼、測試或其他軌，未提交。

1. **通過**：14 檔及 14 id 與 manifest／規格一致。閘門通過 14 個內容檔、0 內容越界；未改既有檔，載入器無未知 registry 值。原始閘門把領導預放的未追蹤 manifest 當成內容越界：清單暫置 scratch 後，用原工具驗內容，再還原清單。此 metadata 限制及原文完整記在 manifest.gateRejections，沒有放寬 allow。見 [gate.json](gate.json)。
2. **通過（依使用者覆蓋）**：`npm run check` 與 `npm run typecheck` 均 exit 0；只跑 `node --test src/content/content.test.ts`，單檔通過、fail 0。check 為 0 errors、10 個既有怪獸警告；未動這些檔案。舊 `content_accept` 的 test 全套及建立基底 worktree 步驟未執行；其 gate／readlist 子鏈另驗。未跑 npm test、test:e2e、sim 或 fuzz 全套；全套由領導收件後跑。見 [check.txt](check.txt)、[typecheck.txt](typecheck.txt)、[content-test.tap](content-test.tap)。
3. **通過**：10 件各用規格指定既有機體／骨架／部位／槽，保留其他配裝，5 seeds 共50場 runBattle，0例外、均以 eliminate 結束。8×6平地，受測機＋既有友機對1敵機、12回合上限；實際均8回合。AI 實用：定羽一吼28次、並肩列陣20次、凡鐵守口6次。列陣實際套用後 accuracy 0→6、resolve 0→5；重掛不疊加，兩次 ownerTurns 後回0。配裝、池存在、外掛層與每場 hash、效果事件及數值證據存 [smoke.json](smoke.json)；[smoke-runner.mjs](smoke-runner.mjs) 從隔離工作樹根執行可重現。未使用 MCP／網路。本批無研究。
4. **通過**：本報告已讀清單與 manifest 的19項逐項對應；[review.json](review.json)、[naming.json](naming.json) 各14列，白話逐列≤60字；[inserts.json](inserts.json) 為空表。新檔之外只寫本批 manifest 與交接報告資料，未改市場／服務／其他軌。

## 接線未決與既有差異

正式上架仍待領導依計畫 R1／R2／R5 接六市場及製造勢力聲望。歐洲、韓國缺獨立營運勢力，不能借別家聲望。其餘門檻照 naming 表保留 D10／C20／B35，不宣稱現有購買端已鎖部件。有限矢池只在武器自帶池，不加 stock 或補給 ammo。

R4 維持回報：現行 resistance.ts 凡鐵分支只使用 conventionalFactor 與外甲 reach；每低一級減半只在精粹分支。沒有修改規則，也不宣稱凡鐵級差已生效。定羽能力明填 B 精粹；凡鐵部件與能力雙方保留 conventional-arms。

外掛層只保證表列骨架與部位，不宣稱全骨架通配；poolMods 只修改原已存在的池。守口傷害12按計畫凡鐵例外，為D精粹上緣9的1.33倍，未調數字。B級非武器 size1 依計畫與既有同槽範本；列陣偏保守的加成照提案保留，未自行平衡。
