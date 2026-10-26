# fg-gl-01 — FAILED（補缺件已完成）

## 已讀清單

以下均親讀，路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根：

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/ops-content.md`
- `content/lore/style.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/plan.md`

另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、common/data-files、conventions、code-map、dev-env、testing；以 tabledb 親讀本批 new-items 十列、materials 五列、hook-proposals 五列與 engine-facts 全 21 列；親讀 mx-burst-scale、mx-relic-halo、research/restraint 範本、異系部件與怪獸支柱導航。開場 inbox 無信。

## 固定四條驗收

1. **缺件已補齊，gate 未過**：依使用者補做指示，只新增五個 research，不重寫已入庫的五個 component。十檔內容逐值比對 new-items 規格相等；所有研究解鎖引用指向 HEAD 已入庫部件。正式 manifest 的 base 更新為本次 worktree HEAD `bd6a34d9057d1bf2c7ca4a565f181f00bd75d62f`；files／ids／maxFiles 均以五缺件為準，naming 留全部十個英文原名與提案標記。content_gate 核准恰五個研究，但 exit 1：正式 manifest 自身是未追蹤檔，被判 PATH 越界。未擴張 allow 或繞過工具。詳 [gate.json](gate.json)。
2. **使用者覆蓋後的輕量驗收通過**：`npm run check` exit 0（OK 0 errors、10 warnings，含 ops-check）；`npm run typecheck` exit 0；`node --test src/ops/crew/crew.test.ts` exit 0（1 個測試檔通過、0 失敗）。該檔涵蓋科研工時、付款、解鎖及材料不足不開工。原始輸出見 [check](accept/resume-check.txt)、[typecheck](accept/resume-typecheck.txt)、[科研單檔](accept/resume-crew-test.tap)。content_accept 實跑 round 2，在 gate 即 REJECT，未跑後續鏈，見 [verdict-2.json](accept/verdict-2.json)。未跑 npm test、test:e2e、sim、fuzz 全套；全套交領導收件後執行。黃金與 ops fixture 無變更。
3. **15 次通過、10 次受規格限制**：重新執行既有 headless 裝配腳本，每件 seeds 1–5，共 25 列，見 [playtest.json](playtest.json)。節甲襯、燈髓囊、蹄墊甲共 15 次通過：層／池與規格一致、無例外，同裝另一件生物件後 burdenOf 相加正確。櫛骨襯、闕甲裙各五次 blocked：現有機體無 size≥2 的 armorMount，無法完成「相容既有機體」裝配。未改骨架、未縮件；既有人物未宣告 burden 池，只驗算承擔相加，不宣稱逐回合扣算已驗。本批無古代件，G5 不適用；無新能力，不要求 AbilityUsed。
4. **報告與審核資料完成**：[review.json](review.json) 十列皆對應實際檔，每列白話≤60 字；保留既有五部件與新增五研究的區別。manifest.naming 保留原英文與意涵，均標提案。本報告≤8 KB。

## 十檔成果

已入庫、完全未改：節甲襯（fl-scale-leaf）、燈髓囊（fl-lantern-pith）、櫛骨襯（fl-rack-rib）、闕甲裙（fl-gate-flap）、蹄墊甲（fl-heel-cushion），位於 content/base/components/。

本次新增：上述五件各自的拆存法，路徑為 content/base/world/research/ 下同名加 `-study.json`。逐檔名稱、白話與掛點見 review；五研究 consumes 依序為指定材料各 1 份＋scrap 1／2／3／4／1，成本 600／750／1000／1250／600 幣、40／60／80／100／40 工時，均照完整骨架，未增欄位。

## 未接線與收件事項

G1 戰鬥掉落／來源戰損、G2 屍拆與一次取樣、G3 科研到實物、G4 材料中文及取得來源仍待引擎／領導線。consumes 扣自由 stock 帳戶，unlocks 只設旗標，不發貨、不量產；市場 salt-flat、供體材料與掉落仍只是計畫建議。本線未動市場、怪獸、規則、src、test、spec、lore、主樹索引。其他批古代件於 G5 完成前仍暫緩投放。

驗收不全過，狀態 FAILED；需領導處理 manifest 自身被 gate 拒絕的流程衝突，以及兩件 size 2 甲件與既有槽位不相容的規格矛盾。五缺件與報告已交付，未自行調數值、接引擎、commit、push 或帶回 main。既有追蹤檔 diff 為空，五部件 SHA-256 均與開工時一致；雜項僅原有 node_modules symlink 與正式 manifest。
