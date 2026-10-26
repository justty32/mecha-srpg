# lead-rename REPORT — 全庫用語改名＋翻譯腔重審（codex-batches 第 1 批）

[handoffs](../README.md)｜定案表 [terms-rename.json](../../../planning/design-notes/terms-rename.json)｜原文 [terms](../../../planning/design-notes/terms.md)

> 由頂層代存（harness 擋子 agent 寫報告檔，lead-wrapup 有前例）。

## 做了什麼

1. **定案詞表**：依 terms.md 授權，原鞘系作廢詞、潮信會等照「先英文帶拉丁意涵再意譯」擬版，`agy --model gemini-4-argon-high` 兩輪純文字審查，取推薦版定案；收件中又補 2 列（殼矛→骸矛、逆潮之息→逆蝕之息）。全表 69 列寫進 `design-notes/terms-rename.json`，terms.md 末段加摘要。頂層兩次更正（先撤回蝕盛／蝕歇，再定大潮／小潮照用）都已照辦；沒有任何批次交出蝕盛／蝕歇，lead-content 新檔裡的 7 處蝕盛已在 rename-18 改回大潮。
2. **領導親改**：`glossary.json`、`style.md`（「用語過渡」改成「用語（定案）」）、`lore/README.md`、`registries/attrs.json`（殼緣→古緣）、`world/lineages` 8 檔、名表 11 檔（之殼→之軀）、`aiprofiles/tide-cultist`、`templates/default.json` 九句（用暫存 index 提交，lead-grid 工作樹裡未提交的鍵改名沒動到，已發信通知）、`world/wterrains` 五句、constraints-ops.json 五處錨點、頂層 README／PROJECT 工作名改成《蝕潮獵團》、codex-handover／codex-batches 第 1 批標完成。
3. **codex 批次**（全部 `gpt-6-astra`、reasoning high，隔離 worktree）：content 18 批 polish（rename-01…18，共 307 檔，最多 4 批並行），每批都過 `content_gate`＋`content_accept` 才帶回；wf 文件 3 批（docs-1 specs/ops 32 檔、docs-2 specs/world＋core 19 檔、docs-3 content 工作流等 27 檔），收件前領導核對 diff，並確認 base 之後主線沒改過這些檔。
4. **閘門擴充**：`content_gate.py` 加 `allow.proseFields`。lore 的 consequences、doctrine、ideology、role、scale、tags 等敘述欄要在 manifest 明列才放行，可選欄位限內建清單；`test_content_gate.py` 加 2 個案例，共 39 綠。

**退件與修正**：rename-03 的工人把異能名「殼矛」改寫成描述句，領導在 worktree 補回為「骸矛」後重驗（第 2 輪）；其餘 17 批一輪就過。另有 6 批的 `npm test` 失敗與它們的 base 完全相同，都是別線造成的（lead-grid 的 worldgen 測試讀未進版控的檔、短暫的索引不一致、bands probe），已在 base worktree 重跑確認，manifest 記 `testWaiver` 後放行。

## 定案詞表（骨幹，完整版看 json）

殼（本體）→古代機（不縮寫成「古機」）｜殼（外層）→裝甲｜遺跡黑話殼→墟｜殼學會→稽古學會｜殼守→守寢人｜殼訊→夢召｜殼緣→古緣｜殼帶→墟帶｜殼陵→古陵｜殼片→骸片｜挖殼→掘墟｜殼室→內殿｜殼釘→鎮釘｜摹殼→衍甲｜殼刃→骨刃｜潮刃→流刃｜源潮→源流｜潮信會→沐蝕會｜潮訊→蝕訊｜渡潮船→渡月船｜前潮文明→先蝕文明｜殼矛→骸矛｜逆潮之息→逆蝕之息｜X殼（古代機稱呼）→X｜摹機→衍型機。專有名詞：守殼者→鎮墟衛、殼心→樞心、有翼古殼→垂翼古軀、殼光之槍→源光貫槍、冰下殼→冰下古墟、潮線逃生者→蝕線流民、殘殼拳→古骸拳等 22 條。**照用**：大潮／小潮／平潮／退潮。

## 驗收（領導在乾淨 worktree 對 HEAD 重跑）

`npm test` 858／858；`npm run check` 0 錯 8 警告；`npm run typecheck` 0；`node content/lore/check.ts` 0 錯 2 警告；黃金與營運 hash 沒動。`wf-lint --strict`：broken 2（`legacy/docs` 指向 repo 外的舊連結，本來就有）、oversize 1（`inbox/ROSTER.md` 14 KB，四線共用）、biglist 2（CLAIMS 現役表、legacy）。本線新增的違規是 0。

## 殘留（都有理由）

- **content**：殼／摹 剩 31 檔，都是本義或照用：甲殼、地殼、鹽殼、船殼、蟲族部位與招式（闔殼封闕、聖殼崩紋、褪殼天災）、軀殼、「機魂是沒有肉的殼」這句比喻、「打殼不打獸」（打獸甲），以及 style 裡講規則時引用的舊字。「潮」只剩海洋意象：潮汐、潮鷗、潮鰭、潮衣、潮狼、潮脊、潮神、萬潮葬王、碼頭酒艙「第二潮」，加上照用的大潮／小潮／退潮。
- **wf**：design-notes 其他子檔、decisions、handoffs 歷史、inbox 歷史照規矩保留原話；`numeric-bands.json` 的 `類別:"摹機"` 與 `playtest-baselines.json` 的欄名「基準摹機」是程式在讀的鍵，故意保留（docs-3 曾改成衍型機，害 probe.test 失敗，已還原）；lead-content 的交接書與 faction-drafts 還寫著舊詞。
- **src**：一個字都沒改，見下節。

## 需要決定

1. **src 顯示字串**（引擎線改）：「潮月」出現在 `ui-adapter/ops/vm/snapshot.ts`、`dom/tabs.ts`、`mcp/campaign-view.ts`、`mcp/campaign.ts`、`ops/sim/cli.ts` 與 `e2e/ops-campaign.spec.ts`，建議改「蝕月」；「潮相」「潮壓」在 `dom/render.ts`，建議改「蝕相」「蝕壓」；「潮曆」在 `vm/labels.ts`、`keymap-ui.json`，建議改「蝕曆」；「摹機系列」在 `vm/wiki/cards.ts`，建議改「衍型機系列」；「摹機總層 HP」在 `sim/probe.ts`，要連 numeric-bands 的鍵一起改；layer 名「共鳴殼」在 `ui-adapter/vm/labels.ts`，建議改「共鳴裝甲」，「駕駛艙殼」可留。大潮／小潮／平潮照用，不必動。這些多半在 lead-grid 的領地。
2. **刪檔（要頂層同意）**：docs-3 的 `residuals.json`（7.5 MB）與 docs-2 的 `residuals.json`（1 MB）是工人寫的全文命中傾印，已經 commit。建議 `git rm`；歷史裡的那份去不掉。
3. **lead-content**：`lc-field-01` 還在跑，它的新檔進來後要再掃一次舊詞，可以給下一條線或 lead-content 自己處理；faction-drafts 併進勢力檔時請改用新名（守寢人、稽古學會…）。
4. **翻譯腔重審的範圍**：本批只在換詞的句子裡順手修，沒有舊詞的檔沒有全面審過；全庫逐句重審要不要另開批次，請頂層決定。

## 註記

- 頂層 commit `ed53137` 一併收了我暫存區裡的改動（terms-rename.json、glossary、style、lineages、attrs、content_gate 等），內容完整，已照頂層指示不回滾。
- 我的 `f657342`（rename-03 收件）在重產索引時讀到共用 git index，順帶把別線已暫存、還沒 commit 的檔寫進索引分片，造成短暫不一致，後來由 lc-lore-01 的 commit 修回。之後收件一律用暫存 index（從 HEAD 讀樹）重產索引。
- 子 agent：沒開 Claude 子 agent。codex 21 條線都在 1–8 分鐘內交件，沒有 BLOCKED。

## 以後交接書該點名的工具

- 收件重產索引要用暫存 index：`GIT_INDEX_FILE=<tmp> git read-tree HEAD; GIT_INDEX_FILE=<tmp> git add <files>; GIT_INDEX_FILE=<tmp> npm run content:index`，免得把別線的暫存帶進來。
- docs 類的 codex 線要寫明「不要在報告目錄寫全文傾印」，並給報告目錄設容量 gate。
