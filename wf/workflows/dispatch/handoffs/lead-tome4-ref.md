# 任務：把 Tales of Maj'Eyal（ToME4）的資源／天賦／效果／AI 系統拆解成「機甲 SRPG 可選機制表」第二卷

> 你是 Opus **領導**線 `lead-tome4-ref`，由頂層（主 session Fable）用 Agent tool 派出：自己拆工、派 codex 工人、監看、驗收、收線、回傳。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/codex-exec.md`、`wf/workflows/investigation.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/planning/design-notes.md`、`wf/workflows/decisions.md`、`wf/workflows/team-model/model-quirks.json`（gpt-6-astra 的癖好與對策）——親自讀，不靠本交接書的摘要。前一條同類線的成品當格式範本：`wf/workflows/dispatch/handoffs/lead-combat-ref/REPORT.md` 與 `mechanics.json`（唯讀）。

## 背景與唯一目標

本作戰鬥系統走 Battle Brothers 式（已有 107 列機制表），但使用者的裁示把核心推向「一切資料驅動、可擴充」：部位是多層序列、機甲有**零到多個資源池**（熱量／電能／生物酸／轉速／本能……）、部位壞掉的後果與傳到駕駛員的方式都是**效果清單**、古代機甲有逐台獨一無二的能力、要有 AI。ToME4 正是這類設計的成熟範本：`defineResource` 的多資源、天賦（talent）宣告成本／冷卻／需求／`tactical` 權重讓 AI 選招、時效效果（timed effects）的疊加與合併、傷害類型與抗性／親和、持續技（sustains）、神器（artifacts）與 ego 詞綴。唯一目標：**產出第二卷可選機制表 `mechanics-tome4.json`**，每列寫 ToME 原版怎麼做（附 `檔案:行號`）、搬到機甲設定怎麼改寫、對應哪條裁示、採用／改造／不採用與理由，讓頂層寫 spec 時和 BB 卷合併取用。你不寫 spec、不定數值。

來源在 `/home/lorkhan/repo/moddings/tome4/`（唯讀）：真相層 `docs/knowledge/`（先讀 `README.md`、`class-and-talents.md`、`class-parts/02-resources-i18n-inscriptions.md`、`items-and-egos.md`、`npc-and-chats.md`）；原始碼 `vendor/t-engine4/engines/te4-1.7.6/engine/`（`interface/ActorTalents.lua`、`ActorTemporaryEffects.lua`、`ActorResource.lua`、`ActorAI.lua`、`ai/`）與 `vendor/t-engine4/modules/tome/`（`class/interface/Combat.lua`、`class/Actor.lua`、`data/damage_types.lua`、`data/timed_effects/`、`data/talents/`、`data/resources.lua`、`ai/tactical.lua`、`data/general/objects/`）。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做五組：(A) 資源系統——定義、上限、再生、消耗、閾值、持續技佔用；(B) 天賦定義 schema——成本／冷卻／需求／範圍／目標／`tactical` 權重／on_pre_use／sustain；(C) 時效效果——疊加、合併、持續時間、on_gain／on_lose／on_timeout、效果參數化；(D) 傷害類型與抗性／親和／穿透、命中與暴擊結算流程；(E) 物品、ego 詞綴與神器——資料驅動修飾與「獨一無二且自帶特殊能力」的物件（對應古代機甲）。另加一條：ToME 的戰術 AI 怎麼讀天賦的 `tactical` 表選招（屬 B）。
- 不做：ToME 的種族／職業內容、地城／任務／大地圖、UI、粒子、addon 開發流程；BB 已涵蓋的營運層；數值平衡；程式碼；修改 tome4 repo 任何檔；codex 工人不查網。
- 件數 gate：機制表以 **60 列為目標**（不是上限；gpt-6-astra 會把上限當目標，所以給目標數），超過 80 停下精簡；容量 gate：產物總量超過 2 MB 就停下回報；時間 gate：開工起 120 分鐘內收線。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_team.sh` | 開工 `create tome4ref lead-tome4-ref`；之後 `add` 每條工人 |
| `codex exec -m gpt-6-astra -s workspace-write …`（配方見 `wf/workflows/dispatch/codex-exec.md`） | 派工人各做一組；`-C` 指它的 REPORT 目錄，`--add-dir` 加 `wf/inbox`；tome4 repo 沙箱本來就唯讀 |
| `wf/tools/inbox_poll.sh lead-tome4-ref --wait --timeout 540` | 前景等工人；逾時再跑一輪 |
| `python3 wf/tools/brief_lint.py` | 子線交接書送出前 `--strict` 要 0 違規 |
| `python3 wf/tools/tabledb.py` | 寫與驗 mechanics-tome4.json（契約 wf-table/1） |
| `wf/tools/inbox_ack.sh` | 終局信歸檔並記一行 STATE |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完 REPORT 後跑，要 exit 0 |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫自己的 REPORT 與 `wf/workflows/dispatch/handoffs/lead-tome4-ref/` 底下的附件（子線交接書 `cx-tome-GROUP.md`、工人 REPORT、`mechanics-tome4.json`）；codex 工人 `-C` 指它在該目錄下的 `cx-tome-GROUP/`。工人的 ROSTER 格由你代登記。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；本線不 commit（頂層收線時統一 commit）；不 `rm -rf`（暫存搬 `/tmp/lead-tome4-ref-trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不改專案內任何既有檔（ROSTER 自己與工人那格除外）；不改 `/home/lorkhan/repo/moddings/` 任何檔；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）；子代理上限 5 條 codex 工人＋1 個 Claude 子 agent，只准為推進正事開。分清錯誤來源：工具或環境出錯（沙箱拒寫、檔案讀不到）→ 停下發 `BLOCKED`；自己寫的臨時腳本出錯 → 自己修。

## 工作

1. 讀完先讀清單；在 `wf/workflows/inbox/ROSTER.md` 追加自己那格；開團隊。
2. 讀 tome4 真相層索引與上列知識檔建立全貌；五組各一份子線交接書 `cx-tome-GROUP.md`（照 `wf/workflows/TEMPLATE.handoff.md`、brief_lint 過），給每組**目標列數**（合計約 60），要求 `design_note_ref` 最多兩個且第一個是主對應，`source` 必須是 `檔案:行號`（相對 tome4 repo 根）；派出。
3. 前景等信；收到終局信逐條核證據（抽列開檔對行號），`inbox_ack.sh` 歸檔。
4. 合併成 `mechanics-tome4.json`（欄位見下），用 `tabledb.py` 驗；對照 BB 卷標出「兩卷互補／衝突」的列（放在 `note` 欄）。
5. REPORT：全貌一段、對 design-notes「資源／層／效果／古代能力／AI」五條裁示各一段對應、最該先拍板的 8 個 `open_question`；關團隊；回傳。

`mechanics-tome4.json` 契約 wf-table/1，欄位固定（與 BB 卷對齊以便合併）：`id`（`TM-xx`）、`domain`（資源／天賦／效果／傷害／物品／AI）、`ref_game`（固定 `tome4`）、`ref_mechanic`（ToME 原版一句）、`source`（`檔案:行號`）、`mecha_adaptation`、`design_note_ref`、`recommendation`（採用／改造／不採用）、`why`、`open_question`、`note`。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 領導 REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/REPORT.md` |
| 可選機制表第二卷 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/mechanics-tome4.json` |
| 子線交接書與 REPORT | 同目錄 `cx-tome-GROUP.md`、`cx-tome-GROUP/REPORT.md` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」與「gpt-6-astra 這次觀察到的癖好」。

## 驗收（固定 6 條，一條不多，做完就停）

1. 上述 REPORT.md 存在且四段齊全。
2. `mechanics-tome4.json` 存在、`python3 wf/tools/tabledb.py` 讀得出、列數在 40–80 之間、每列 `source` 符合 `檔案:行號` 且 `recommendation` 非空。
3. 隨機抽 10 列，`source` 的檔案存在於 `/home/lorkhan/repo/moddings/tome4/` 且該行號附近 ±5 行能看到 `ref_mechanic` 提到的識別字；10 列全中。
4. 五組（A–E）每組至少 6 列；`design_note_ref` 覆蓋「資源、層、效果、古代能力、AI」五條裁示。
5. `bash wf/tools/wf-lint.sh --strict .` 的輸出中 broken=0、residue=0、local=0。
6. `tmux ls` 無 `cx-` session、`pgrep -af 'codex exec'` 無本線行程、`wf/inbox/teams/tome4ref` 已 close。

## 失敗怎麼處置（兩種要分開）

- 測出來是壞的（工人交的行號對不上）→ 退回重做或自己補查；整線只有達不到 40 列才發 `FAILED`。
- 測不出來（原始碼讀不到、沙箱擋住）→ 不回滾，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

我是 `lead-tome4-ref`，團隊 `teams/tome4ref` 的領導。你是 Claude 子 agent，不走 inbox 向上回報：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。工人（codex）走 inbox 回報給你。等工人時用前景 `wf/tools/inbox_poll.sh lead-tome4-ref --wait --timeout 540`，不要用結束回合當等待。
