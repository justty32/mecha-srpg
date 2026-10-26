# fg-gl-03 — FAILED

## 已讀清單

以下路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根，均親讀：

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

另親讀 WORKFLOWS、SESSION-LOG、WAIT_USER、資料檔規則、testing、dev-env、conventions／code-map、生物與異系部件支柱；以 tabledb 讀 new-items 本批 20–29 列、materials／hook-proposals 10–14 列、engine-facts；整檔讀 mx-burst-scale、mx-relic-halo、research/restraint 三個範本。開場 inbox 無信。

## 十檔成果

五個部件與五份配對拆存研究已備齊，均逐值等於 new-items 的「逐檔規格」，未調名稱、數值或加欄位。空帆片、偏鏡甲、暮帷掛、燈苔氈、蘆網襯各有一份拆存法；完整十檔路徑、名稱、白話與掛點見 [review.json](review.json)（10 列，白話均 ≤60 字）。既有五個暫存部件已核對後沿用，新增五個研究。正式 manifest 保留英文原名、意涵與「全為提案名」標記，status=rejected，沒有帶回 main 或發佈。

## 固定四條驗收

1. **未通過**。十個 content 新檔、零既有檔修改，id／名稱／數值／引用全符合規格；[gate.json](gate.json) approved=10。工具 exit=1：領導預置且本線獲准編寫的 `content/batches/2026-10/fg-gl-03.json` 被判 PATH。未擴 allow.kinds、隱藏 manifest 或改工具繞過。
2. **未全過**。依使用者覆蓋：`npm run check` exit=0（core 0 errors／0 warnings；ops 0 errors／10 warnings）、`npm run typecheck` exit=0；僅相關單檔 `node --test --test-isolation=none --test-reporter=tap /tmp/cx-fg-gl-03/acceptance.test.mjs` 為 9 pass／1 fail，失敗僅偏鏡甲相容性。五份研究實測扣指定材料、scrap、幣，完成只設 unlocked、庫存不增加；不是自動發貨。[check.txt](check.txt)、[typecheck.txt](typecheck.txt)、[test.tap](test.tap) 留原始輸出。`content_accept.sh` 已實跑，gate 擋下後 REJECT，見 [verdict](accept/verdict-1.json)。為遵守禁止自建 worktree，check 直接執行；manifest.checks 僅留 typecheck／readlist，覆蓋來源與實跑指令存 resourceOverride。黃金與 ops fixtures 無變動。未跑 npm test、test:e2e、sim、fuzz；全套交領導。
3. **未通過**。五件各 seeds 1–5，25 列存 [playtest.json](playtest.json)：其餘四件 20/20 通過；偏鏡甲 5/5 在裝配前拒絕，沒有強塞不相容槽。逐件核對 layersAdd 的完整層宣告與初始 HP、部件 HP、pools 的 max／regen／initial、burdenOf；空帆片＋燈苔氈承擔相加為 2+1=3。暮帷掛合併既有 charge 池後 max／regen 相加，自己的 initial=0；機體原有 initial 仍沿引擎第一宣告。驗收的是 burdenOf 合計，未宣稱既有人物已自帶承擔池或執行回合累積。無新能力、不要求 AbilityUsed。
4. **通過**。本報告、review 十列、playtest 25 列、manifest.naming 英文原名與提案標記均齊。

## 需領導處理的原有衝突

偏鏡甲規格要求 armorMount size=2；本基準所有既有 armorMount 的 size 都是 1，沒有相容機體。makeUnit 本身不檢查槽容量，故不能把它硬塞入既有槽後宣稱合格。依交接禁區保留 size=2、不改骨架；請領導另案修訂規格或提供合法槽。

content_gate 沒有排除正式 manifest，也要求 HEAD 等於 base；交接同時要求先 commit component，兩者互相衝突。本次 commit 實際先被沙箱阻止：`fatal: Unable to create '/home/lorkhan/repo/game_dev/mecha-srpg/.git/worktrees/wt-fg-gl-03/index.lock': Read-only file system`。因此未產生 commit，五個部件維持原有 staged，五個研究與 manifest 為未追蹤；只繼續完成可寫檔與證據。此為 Git 工具 BLOCKED，整批因驗收不符回 FAILED。

## 未接線狀態

本批無古代件；G5 共鳴門檻未阻擋效果的限制仍照計畫保留，其他批古代件須暫緩投放，未修改引擎求綠。本批 G1 掉落、G2 一次拘束取樣／整屍拆解、G3 科研到實物、G4 材料中文標籤、G6 等級／貨艙一致性仍未落地；stock 帳戶不等於掉落來源。菌絲只採收，不拘束或養殖。市場掛接僅提案：D/C 材料 singapore、B 小量寄售、A 回售／任務，不上架補貨；交 gm／引擎線協調。本線未碰 markets、rules、registries、src、test、specs、lore 或主樹索引。
