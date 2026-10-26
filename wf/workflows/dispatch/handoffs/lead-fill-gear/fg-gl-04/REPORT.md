# fg-gl-04 — FAILED（缺件已補齊）

## 已讀清單

以下路徑均以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根，逐檔親讀；本輪依主樹實檔閱讀。

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

另讀指定交接書、SESSION-LOG／WAIT_USER、WORKFLOWS、data-files。以 tabledb 讀 new-items.json 本批第 30–39 列、materials.json 與 hook-proposals.json 第 15–19 對應列、engine-facts.json 全 21 列；親讀 component 範本 mx-burst-scale.json、mx-relic-halo.json 與 world/research/restraint.json。

## 固定四條驗收

1. **本輪缺件已補齊，原 gate 未通過。** 依使用者補做指示，僅新增 `content/base/world/research/fl-{vault-ply,grove-shroud,fallen-step,tomb-chime,lake-votive}-study.json` 五檔；id、名稱、數值、引用逐值等於骨架。既有五個 component 的 SHA-256 全不變，保留原暫存狀態。十檔名稱為拱根疊甲、白林菌帷、墟階殘片、古陵空鈴、湖殿殘燈及各自拆存法。正式 manifest.files／ids／maxFiles 依缺件改為五份研究，舊部件另記 supplement.preservedFiles；naming 十列英文與提案標記保留。[補件核對](accept/supplement-scope.json)記錄五檔新增與零舊件改動。原 content_gate.py 回傳 1：它按舊 base 把五個既有暫存部件與研究合計成 10，超過本輪上限 5；並把領導預置正式 manifest 判 PATH 越界。未擴充允許目錄或改工具求綠，見 [原始 gate](accept/supplement-gate.json)。

2. **使用者覆蓋的輕量驗收通過。** npm run check 含 ops check：0 errors、10 warnings；npm run typecheck exit 0；相關單檔 node --test /tmp/cx-fg-gl-04/research.test.mjs exit 0，另跑既有科研流程單檔 src/ops/crew/crew.test.ts exit 0。新件單檔檢查五份研究缺標本時不扣幣／拆料、補料後扣指定數量、工時未滿不解鎖、完成只設旗標不發貨、不能重複研究；直接執行同檔確認五例通過。證據：[check](accept/supplement-check.txt)、[typecheck](accept/supplement-typecheck.txt)、[研究測試](accept/supplement-research.tap)、[五例明細](accept/supplement-research-direct.txt)、[科研流程](accept/supplement-crew.tap)；[測試稿](accept/supplement-research.test.mjs)留供重現。正式 manifest.checks 保留 typecheck/readlist，另記 resourceOverride；check 與單檔測試直接執行，避免原腳本自建 base worktree 或跑全套。指定 content_accept 已執行，因 gate 停在 REJECT；readlist 另以原判定器確認 14/14。未執行 npm test／test:e2e／sim／fuzz 全套，留領導收件後跑；黃金與營運 fixture 無修改。

3. **裝配驗收未通過。** 本輪重跑五件各 seeds 1–5、共 25 次 headless 裝配煙霧：墟階殘片與湖殿殘燈共 10 次通過 instantiateMech 合法槽位檢查與 createBattle，附層／池符合規格、零例外；另 15 次無法執行。現有可改裝機體沒有 size≥2 armorMount（拱根疊甲、白林菌帷）或 size≥2 systemMount（古陵空鈴）；未改骨架或縮件。兩件生物件不能合法合裝，burden 4+6 的實機相加仍未驗證。[playtest.json](playtest.json)記錄完整結果。古代共鳴僅列 G5 限制，不修改引擎；無新能力，不要求 AbilityUsed。

4. **報告與審核資料齊全。** [review.json](review.json)維持十列，各列白話≤60 字；本輪新增五份研究，沿用五個部件。報告列出已讀、十檔成果、驗收證據與未接線狀態，容量≤8 KB。整批仍為 FAILED／rejected，未標 accepted，未發布或帶回 main。

## 未接線與接續

G1 掉落／戰損來源、G3 科研到實物取得閉環仍未接；stock:fl-* 為自由帳戶，沒有新增材料 registry 或掉落目錄。研究會扣料，完成只設 unlocked 旗標，不自動發件。G4 材料中文標籤、遺跡投放與市場寄售／回售仍是掛接請求。G5 尚未阻擋部件附層／池，三件古代遺物全部暫緩投放。新詞、材料與價格維持提案。

領導需處理原 gate 與本輪補件範圍／預置帳本的相容性，並決定三件既有部件與槽位尺寸的規格矛盾。本線依「只補缺件」指示保留現有部件，未改引擎、骨架、索引或主樹內容。前輪 Git 沙箱拒寫紀錄仍留在 accept/commit.txt；本輪不再以提交既有 component 作為補研究的前置。
