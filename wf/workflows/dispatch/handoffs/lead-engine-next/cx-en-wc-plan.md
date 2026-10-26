# 任務：寫「萬潮葬王副線引擎」（王跡欄、腳本式世界移動、不可交戰在場單位、事件改區、守牆情境）的實作計畫，不改任何既有檔（cx-en-wc-plan）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀下列每份（**親自讀，不靠本交接書的摘要**；PLAN 開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（ops／rules／sim／ui-ops／mcp 列在 `wf/workflows/common/code-map.json`，用 tabledb 查）、`wf/workflows/testing.md`（驗證表 `wf/workflows/testing-checks.json` 第 1、2 列用 tabledb 查）、`wf/workflows/dispatch/handoffs/plan-wanchao/plan.md`（全文，含文末使用者裁示；第三節守則是硬約束）、`wf/workflows/dispatch/handoffs/lead-wanchao/report.md`、`wf/workflows/dispatch/handoffs/lead-wanchao/base-drafts.json`（全文，含「執行說明」）、`wf/workflows/dispatch/handoffs/lead-tide-cal/REPORT.md`（大潮曆與連珠潮的現成函式）、`wf/workflows/planning/specs/ops/README.md` 與它指到的 time-and-tick、world-grid、data-model-world-map、content-format-ops、battle-interface 相關檔、`wf/workflows/planning/specs/world/monsters.md`（S 領主捕捉一次）、`content/lore/events/wanchao-northward.json`、`content/lore/events/wanchao-at-gate.json`、`content/lore/places/chittagong.json`、`content/base/monsters/tidespine-chittagong.json`、`content/lore/style.md`、本檔。engine-backlog 第 57–61 列用 `python3 wf/tools/tabledb.py wf/workflows/dispatch/handoffs/engine-backlog.json find 序=57`（58…61 同法）讀。程式碼從 `src/ops/time/`、`src/ops/world/`（rifts、blight、places）、`src/ops/sortie/`（scenario、encounter、run）、`src/ops/content/`（load、check、opseffect）、`src/ops/state/`、`src/ops/text/`、`src/rules/`（單位、目標合法性、行動序）、`src/sim/`、`src/ui-adapter/ops/vm/` 讀起。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

萬潮葬王（`monster/tidespine-chittagong`，全遊戲唯一的 S 級個體）的副線 lore 已落地（lead-wanchao），但營運層沒有它：沒有「牠在哪」、牠不會走、戰場沒有「在場但打不到」、事件改不了蝕區、第 40 蝕月沒有守牆入口。使用者裁示：拍二北上（吉大港外灘→鹽灘外海→第七哨外海→達卡北郊河口，開局後第 8–24 蝕月某次大潮夜，落點由引擎依大潮表擲、不定死）；拍三允許正面打（可選不必選、capture-once）；蝕線重畫孟加拉灣北岸一區轉淺蝕；欄名「王跡」。唯一目標：**寫一份產出線照做就能落地 E1–E5 與 base-drafts 14 列文案的計畫**，規模控制在「最小可行版」。你不改任何既有檔。

## 硬約束（plan.md 第三節守則，計畫與將來的文案都要守）

牠不給意圖（文案沒有「牠要、牠找、牠記得」）；拍一、拍二不交戰（戰場上牠只能是不可選取、不可瞄準的在場，或不在場）；不綁蝕壓源頭、不補蝕域名字或核心；不新增人物；不寫 SS／SSS；不動 `tidespine-chittagong` 既有數值與 `wreck-crown` 一字；不拿其他作品類比。另外：**世界北行不由玩家接約觸發**（base-drafts 執行說明「觸發」）；「不見了」不推定死亡；改區只改第七哨外海／北岸那一區為淺蝕，不解封外灘、不改第二區。

## PLAN.md 要寫的內容（八節）

1. **現況與接點**：大潮曆（`tide`／`omens`／連珠潮第 40 蝕月）、蝕區（patch、sinceDay、深淺、`rebuildBlightIndex`）、ops 事件 effect（`applyOpsEffect` 有哪些 kind）、路線事件與 news 怎麼投放、契約模板怎麼進板、戰鬥情境部署怎麼從營運生成、營運 UI 有哪些面板可以加一行——每項給函式／型別名（不用行號）。孟加拉灣四個地點（吉大港外灘、鹽灘外海、第七哨外海、達卡北郊河口）在世界資料裡的實際 id 或最近的格／地點；沒有的寫明用哪個最近的既有 id 代替（不新增地點，除非沒有替代且寫理由）。
2. **E1 王跡**：state 形狀（例 `namedLords[id]={loc,heading,sinceDay,status:"present"|"northward"|"gone"}`）、開局值（吉大港外灘：在）、在哪顯示（營運 UI 哪個 vm／面板、DaySummary 或蝕訊行、MCP campaign view 要不要帶）；engine-backlog 43 的四來源尚未實作——給**最小版**（例：玩家永遠看得到最新狀態一行，或只在吉大港市場／有殘聯關係時看得到），並把四來源列為 SPEC-GAP 後續。顯示文案用 base-drafts F1 三句原文。
3. **E2 腳本移動**：資料檔放哪（例 `content/base/world/lords/*.json` 或 rifts 擴欄；要新 kind 就寫載入器與 check）、欄位（lord、窗口 8–24 蝕月、觸發＝大潮夜、路徑序列、沿途抬級量）、怎麼「依大潮表擲」決定是哪一次大潮（用既有 RNG 流，不吃掉別的流的亂數以免無謂改黃金；若必改黃金說明原因）、每一步怎麼移旗標與對沿途區抬一級（一夜走完或分夜走，選最小的）、達卡北郊裂縫封／未封的分支（未封則當夜寬度抬一級）、走完觸發 E4 與 F2 路線事件／news／契約投放。
4. **E3 不可交戰在場單位**：戰鬥側最小版——scenario 部署怎麼標 presence（不進行動序、不可選取、不可被瞄準、佔一個邊緣格且不可進入或不佔格、掛光環 effect 敵我皆受「潮懼」：用既有 effect 或新增一個 effect 檔），要改的 rules 檔與函式；**AI 目標選擇怎麼排除**：優先在 rules 的合法目標／可見單位查詢層排除，讓 `src/ai/` 不用改（`src/ai/` 由另一條線同時在改）；若非改 `src/ai/` 不可，寫出最小 diff 片段，標「交領導合併」。UI 戰鬥面（`src/ui-adapter/vm`）怎麼顯示成不可選。勝負判定、fuzz 不變量（`test/fuzz/invariants.ts`）、存讀檔、replay 要不要排除它。拍二跟蹤偵察契約生成戰場時掛牠。
5. **E4 事件改區**：ops effect 新 kind（例 `blightShift{patch|cells,to:"shallow"|"clear"}`）的語意與實作點、check 驗證、E2 走完時呼叫一次；spec 補段位置。
6. **E5 守牆情境＋capture-once**：連珠潮夜（第 40 蝕月）玩家在孟加拉灣圖時推一則可接可拒的守牆情境（不接＝牠轉身回海，王跡改「不見了」或回到外灘，選一個並說明）；情境內牠是 boss、**只有玩家主動選擇開打才可被瞄準**（預設也是 presence，玩家下令「迎戰」後轉為可交戰——給最小實作）；capture 走一次性旗標（例 `lordCaptured`），用過即鎖；吉大港守住／失守不預寫結果（最小版可以只記戰果旗標，不改城市歸屬，並寫 SPEC-GAP）。守牆情境文案用 base-drafts F3。
7. **文案落地表**：base-drafts 14 列逐列：落到哪個 `content/base/...` 檔（新檔路徑或既有檔哪個欄位）、觸發條件、依賴哪個 E；文案原文照抄不改寫（只允許為格式切段）。
8. **產出線工作清單與影響面**：分步驟（建議順序 E4→E1→E2→E3→E5→文案，或你認為更好的），每步改哪些檔（明列路徑）、新增哪些單元測試（至少：開局王跡為「在」；固定 seed 下北行發生在 8–24 蝕月某大潮日且沿途旗標正確；北行後北岸一區轉淺蝕；presence 單位不可被選為目標、不進行動序、光環生效；守牆拒絕＝無戰鬥、接受且主動迎戰才可瞄準、capture 第二次被拒）；spec 要補哪幾段（標 SPEC-GAP 補）；哪些黃金會變（戰鬥黃金、戰役黃金、`src/ops/sim/fixtures/`）與重錄方法（`node test/campaigns/rerecord.ts`、`GOLDEN_UPDATE=1`、寫死合約 id 的戰役要手動對應）；預估新增＋修改檔數；哪一項若比預期大，給「最小可行版」與砍掉什麼。

## 範圍（排除法寫死）

- 只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-plan/PLAN.md`。
- 不做：任何 `src/`、`content/`、`test/`、`wf/`（上述檔除外）的寫入；不 commit；不刪檔；不設計 AI 評分改動（另一條線）；不改 `content/lore/`（別線持有，需要的 lore 改動列在 PLAN「需要決定的事」）。
- 件數 gate：計畫的產出線預估改動超過 60 檔就停下回報並給砍法；容量 gate：`PLAN.md` 超過 50 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查 code-map.json、testing-checks.json、engine-backlog.json、base-drafts.json |
| `grep`／`git log -p -- 路徑` | 查函式、資料檔、地點 id |
| `npm run sim:campaign -- --months 30 --policy idle --continue-after-end --seed 1`（repo 根，唯讀可跑） | 確認大潮日分布與第 40 蝕月可達 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-en-wc-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫上面一個檔；其他一律唯讀。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網；不用 MCP。
- **子代理上限 2 個**，模型隨意；做實質工作也要親自讀「先讀」全部。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-en-wc-plan --up PROGRESS '已讀完先讀清單，開始寫萬潮葬王引擎計畫' < /dev/null`）。
2. 第 1 節現況盤點。
3. 第 2–6 節設計。
4. 第 7–8 節。
5. 回報。

## 交付

**PLAN 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-plan/PLAN.md`**，回覆只要 5 行摘要＋PLAN 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-plan/PLAN.md` |

PLAN 末尾加「沒做到或證據不足的」「需要決定的事」「以後交接書該點名的工具」三小段。

## 驗收（固定 4 條，一條不多，做完就停）

1. `PLAN.md` 存在，開頭有「已讀清單」，八節齊全。
2. 第 1 節給出四個路線地點的實際 id（或替代 id 與理由）。
3. 第 7 節 base-drafts 14 列逐列有落點路徑與觸發條件。
4. 第 8 節有明列路徑的檔案清單、單元測試清單與黃金影響。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **查出來做不到**（某 E 在現有架構下需要超出 gate 的改動）→ 在 PLAN 寫最小可行版與砍法，照常發 `DONE`。
- **測不出來**（指令沒跑成、讀不到檔）→ 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-en-wc-plan`。本線團隊：`teams/engnext`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-en-wc-plan --up DONE '萬潮葬王引擎計畫完成' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-plan/PLAN.md`（STATUS 與標題依實況換成 DONE／BLOCKED／NEEDS-USER／FAILED 與一句自足結論）。
- 結束時必發終局 STATUS 之一；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

codex 工人的 ROSTER 格已由領導代登記。
