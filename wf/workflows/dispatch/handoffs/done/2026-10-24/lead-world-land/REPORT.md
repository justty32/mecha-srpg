# lead-world-land 收線報告（2026-10-24）

[handoffs](../README.md)｜來源 [talk-world REPORT](../talk-world/REPORT.md)

> 由頂層代存（harness 擋子 agent 寫報告檔）。

## 一句話

talk-world 裁示第 1–14 條已全部落地到 design-notes、spec、守則、style／terms 和 116 個內容檔。第 15 條數字只寫成「提案，待使用者確認」。引擎要改的寫成 engine-backlog 第 28–35 列，`src/` 一行沒改。

## 做了什麼

**design-notes**
- 新增 `world/essence.md`：廢十分律改抵抗性、精粹、夢召分工、機魂不能獨駕也不可複製、白手套、凡鐵；暫值第 14 條；未定事項。
- 新增 `world/scale.md`：群像、地球尺度與勢力三層、人口大量損失、各洲一把傘、大潮改讀、產能與時代；第 15 條寫成提案；未定事項。
- 兩檔都照錄使用者原話。
- `world/rules.md` 兩段十分律原話保留，加註「已廢」；`world.md` 和 `design-notes.md` 分檔表同步。
- tide-sky 全目錄潮候改名：每月兩次的朔望改叫「漲潮日」，原來的「漲潮三日」改叫「潮前三日」；怒潮併入大潮，潮勢順序變成 枯潮＜漲潮＜大潮＜連珠潮；第四題改叫「大潮抬級」。
- intrigue motives 裡白手套和殘翼兩列跟著改。

**spec**
- specs/world 新增 `resistance.md`，由 setting 的十分律節改寫後拆出，setting 只留指標。
- setting、README、rifts、ruins、monsters、bio-mechs、opening、mech-lifecycles 跟著改；operations「十分律空援」改成「凡鐵空援：破甲不收命」；machine-souls 座艙關係改成協作／接手／爭奪，「死亡、搬家、複本」節改成「不可複製」；factions 加勢力三層、各洲一把傘、白手套鐵偶。
- specs/core 與 ops：十分律段改寫成「抵抗性；引擎現行的 0.1 是近似，改版見 backlog」。
- ops 的「大潮日」全部改成漲潮日，共 67 處；識別字 `spring` 不動。
- constraints 改了 core 1 列、ops 12 列，含錨點失效的列。

**守則與用語**
- W2 改寫成「抵抗性與夢召」；新增 W10「群像，不指定臉孔」，守則從 31 條變 32 條。
- W5 加入勢力三層和各洲一把傘；M4 加上不寫獨駕、不寫複本；ancient.md 改一處。
- style.md 加入抵抗性／精粹／凡鐵、漲潮／大潮、機魂不可複製、群像。
- terms.md 加一段；terms-rename.json 新增 4 列（十分律→抵抗性、精粹、大潮日→漲潮、怒潮→大潮）。
- content 工作流文件同步：numeric-bands.md、engine-facts EF-16、templates、ancient-people、lore-text、mechs、README。numeric-bands.json 的類別鍵沒動。

**內容（codex gpt-6-astra，reasoning high，9 批平行）**
- grep 盤點出 135 個命中檔，扣掉 lead-grid 的 wterrains。每檔只歸一批。
- wl-01…09 共帶回 116 檔，閘門 0 違規；check、lore、typecheck 綠，黃金不變。
- `npm test` 每批唯一的 fail 是 base 本來就過時的 content/index（`_summary`、`base-place`），已在 base worktree 重跑確認，寫進各批 manifest 的 `testWaiver`；帶回後重產索引時一併修好。
- 定版的改法：事件 `tenth-law` 改名「抗性之證」；獵牌法第一條改成「抵抗性已被證實，精粹煉法學自夸父」；殘翼口號統一換成「甲歸我們破，命歸你們收。」（9 檔）；七號回港按「唯一例外、無解」處理；阿鏽的複本傳聞改成「魂核來自七號守過的殘骸」，七號那邊改成「聽過七號的回港紀錄」；手套改成塞勒涅唯一的催收機魂，不是複本；例行的「每個大潮」改成漲潮，單一的歷史大夜保留「大潮」。
- 頂層轉交的情境簡報同步：siege-beetle-convoy 改成群喉＋吐棘者；shell-excavation-escort 改成菌柱；mirror-choir-vigil 改成守 10 輪；tide-unshacklers 沒有文字欄，不需改。
- 帶回後手改一處：a-xiu.json 的 `born` 欄不在白名單，「塞勒涅租賃複本」改成「塞勒涅租賃」，manifest 記了 `leadFix`。

## commit

`1e9ac44`、`fb576a6`、`b2c802d`、`5931185`（polish 116 檔＋manifest＋索引，用暫存 index 提交）、`b5831ab`、`f412ecf`、`e8a9c75`（收線）。全部用 `git commit -- <路徑>`。

## 驗收（乾淨 worktree，HEAD）

`npm test` 886/886；`npm run check` 0 errors；`node content/lore/check.ts` errors=0；`npm run typecheck` 綠；`node src/ops/content/check.ts content/base` OK；`wf-lint --strict` 只剩 CLAIMS 表的 BIGLIST（本線之前就有）。

## 「十分律／十分之一」殘留（都有理由保留）

- **使用者原話與歷史紀錄**：design-notes 的 `world/rules.md`（已加註廢止）、`world/essence.md`、`world.md`、`design-notes.md`；talk-world 的 HANDOVER／REPORT；`decisions/`、`STATE.md`；lead-wrapup 與 pilot 的 REPORT；done/ 與 inbox 歸檔；lead-rename 和 lead-tune 的舊交接書與 log。
- **說明改名的註記**（「原十分律」「取代十分律」「十分律已廢」）：terms／terms-rename、style、world-pillars W2、numeric-bands、engine-facts、content README、lore-text，以及 spec 各處。
- **無關的「十分之一」**：ops world-grid 的「一格＝船一天航程的十分之一」。
- **程式**：`src/core/types-def.ts` 的註解、`src/rules/attack.test.ts` 的測試名，留給 backlog 28。
- **本線自己的 guide、交接書、manifest**。
- **`dist/`**：沒進版控的舊建置產物。
- **內容檔（content/lore、content/base）**：0 處。

## 需要決定的事

1. **七號 2104 回港**：年表錨點（駕駛員死了，機魂自己把機甲開回港）與「機魂不能獨駕」衝突；暫按「有紀錄以來唯一一次、至今無解」處理，請使用者確認；另一個選項是改成駕駛員其實還活著。
2. **白手套單位**：仍是衍型機 frame 加 `glove-line` AI，三方戰裡會打怪獸。建議等 backlog 28 落地後給它們加凡鐵標記（見 backlog 35），或先用 `conventional-arms` 過渡。
3. **認主在漲潮之夜還是只在大潮之夜**：spec 暫照引擎寫「漲潮之夜（大潮夜也算）」，lore 的歷史認主夜保留大潮。
4. **未定事項照舊只標「未定」**：殘聯歸哪把傘、精粹與源流／裂晶的關係、魂核等級、祕法三形狀、裏側的聲音。
5. **第 15 條數字**（40 億人口、約 300 座城邦、18,000–20,000 台機甲等）：請頂層向使用者確認一次。
6. **scratchpad 殘留 worktree**：`scratchpad/wl/` 下的 `wt-wl-01`…`09`、`wt-wl-01-base`、`wt-wl-02-base`、`wt-verify`。移除算刪檔，等頂層同意後再跑 `git worktree remove`。
7. **阿鏽與七號的小出入**：阿鏽保留「開了很多節點、一個都沒練熟」，已改成「一個真的人」的讀法；兩檔傳聞版本不同，都是傳聞，不衝突。

## 以後交接書該點名的工具

- **分批**：盤點命中檔後按檔分批，一檔只進一批；polish 帶回會檢查目的地是否等於 base，同一檔進兩批會被拒。
- **base 本來就壞的測試**：先在 base worktree 跑 `node --test test/content/index.test.ts`，確認同樣失敗就記進 `testWaiver`。
- **重產索引**：`GIT_INDEX_FILE=<tmp> git read-tree HEAD` → add 自己的檔 → `npm run content:index` → `GIT_INDEX_FILE=<tmp> git commit`；提交後對自己的路徑跑 `git reset -q -- <路徑>`，把真 index 同步回 HEAD，否則 `git status` 會出現 MM。
