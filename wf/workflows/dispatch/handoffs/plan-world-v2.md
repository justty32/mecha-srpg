# 任務：依使用者今晚的推翻與補充，把《潮獵》世界觀提案修訂成第二版

> 你是 **Fable 規劃**線 `plan-world-v2`，由頂層（主 session Fable）用 Agent tool 派出。第一版是 `plan-world` 線寫的，使用者讀後推翻了幾條、補了很多；你要**原地修訂**那個資料夾，不是重寫。使用者裁示「未裁示的都隨意，想看 AI 的創造力」——被推翻的地方要**換上新的提案**並說明理由，不是只刪掉。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/planning.md`、`wf/workflows/planning/design-notes.md` 與其兩個子檔（**`design-notes/world.md` 的「深夜」段與其後各段就是這次要套的推翻與補充，全部為準**）、`wf/workflows/decisions.md`、`wf/workflows/common/user.md`、`wf/STRUCTURE.md`、`wf/workflows/common/data-files.md`；然後讀第一版全部：`wf/workflows/planning/specs/world/README.md`（開頭的覆蓋註記就是待辦清單）與 8 個子檔、`monsters.json`，以及 `wf/workflows/dispatch/handoffs/done/2026-10-23/plan-world-REPORT.md`——親自讀。

## 背景與唯一目標

第一版提案的骨架（獵團與浮船、潮月節拍、蝕域、意志軸、冷硬捕鯨船基調、開場樣稿）使用者沒有反對；但以下被推翻或補充：相位說不要（飛機與戰鬥機可傷怪獸、傷害十分之一、世界規則不解釋）；為何用機甲＝古代遺跡洗腦所有人＋世界規則讓大家喜歡機甲，最初機甲是遺跡挖出的古代機甲、機械系以其為藍本；**古代遺跡與怪獸同時出現**（簡史時序要改）；怪獸多族（蟲族、獸族、異形、菌絲等）；「B 級是 C 蛻皮而來」不要，但母體／子體與蛻皮可保留為**某些族**的設定；古代機甲不限十二台；勢力大大小小、很多；機械系 AI＝**機魂**，是另一個駕駛員（人物實體，科研選方向像點天賦樹、陪伴花時間），不是「副腦部件」。唯一目標：**交出一份與全部裁示一致、內部自洽的第二版世界觀資料夾**，使用者讀完能說「就這樣」。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(1) 逐檔套用上述推翻與補充（README 簡史重排、setting 的裂縫起源與「為何機甲」改寫、factions 改成「大小勢力很多」的開放結構＋幾個代表性樣本、monsters 加「族」的分類與各族的拘束／駕駛艙方案、rifts 的母體子體改為某族設定、ruins 的數量放開、mech-lifecycles 的機魂改為人物實體與副腦段重寫、operations 加傳統兵器十分之一的輔助火力、opening 校對一致）；(2) `monsters.json` 加 `family` 欄（蟲族／獸族／異形／菌絲…）並讓 10–12 列 D–A 怪獸覆蓋至少四族，可選行為（spawner／molt）只掛在該族；(3) 套完後**刪掉 README 開頭的覆蓋註記**（已套用就不該留）；(4) 每檔維持「使用者裁示／我的提案／理由／放棄的替代案」標記，新提案也要標；(5) REPORT 含逐檔變更清單。
- 不做：戰鬥數值；技術棧；`specs/core/`（另一條線正在寫，**不得碰**）；改 design-notes／decisions／SPEC.md；SS／SSS 的設計（仍留白）；新增子檔超過 2 個。
- 件數 gate：怪獸列超過 12 停下；容量 gate：資料夾總量超過 250 KB 停下回報。時間 gate：開工起 60 分鐘內收線。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py` | 改 monsters.json；任何超過 1 KB 的表進 wf-table/1 json |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完後跑，要 exit 0（單檔 8 KB 內、條列 1 KB 內） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑——`wf/workflows/planning/specs/world/` 底下全部（原地修訂）與自己的 REPORT（`wf/workflows/dispatch/handoffs/plan-world-v2/REPORT.md`）；不跑任何程式碼或測試。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；本線不 commit（頂層收線時統一 commit）；不 `rm -rf`（要淘汰的段落直接改寫，整檔改寫用單一 Update 操作）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不改領地以外任何檔；不查網；子代理上限 1 個 Sonnet（只准校對一致性，不准代寫）。分清錯誤來源：工具出錯→發 `BLOCKED`；自己的草稿不滿意→自己改。

## 工作

1. 讀完先讀清單；把 `design-notes/world.md` 的每個粗體段列成待辦，對照 README 覆蓋註記，確認沒漏。
2. 逐檔修訂（順序：setting → README 簡史 → factions → monsters＋json → rifts → ruins → mech-lifecycles → operations → opening），每檔改完 `wc -c` 守 8 KB。
3. 刪 README 覆蓋註記；跑 `wf-lint.sh --strict .` 修到 0。
4. 寫 REPORT：四段＋「逐檔變更清單」＋「這版新增的提案（最想請使用者看的 5 個）」＋「替使用者做掉的決定清單」。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-world-v2/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 世界觀第二版（原地修訂） | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/world/` |
| 怪獸表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/world/monsters.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-world-v2/REPORT.md` |

## 驗收（固定 6 條，一條不多，做完就停）

1. `grep -rn '相位' wf/workflows/planning/specs/world/` 0 筆；`grep -rn '十二台' …` 0 筆；`grep -rn '蛻皮而來\|蛻皮即升級' …` 0 筆；`grep -rn '副腦部件' …` 0 筆。
2. `grep -rln '機魂' wf/workflows/planning/specs/world/` 至少含 mech-lifecycles.md；`grep -rn '十分之一' …` 至少 1 筆（setting 或 operations）。
3. `monsters.json` tabledb 讀得出、10–12 列、全部 D–A、`family` 欄非空且至少四個不同值。
4. README 無覆蓋註記（`grep -c '覆蓋本提案' README.md` 為 0），簡史裡遺跡與怪獸出現在同一年；每個子檔仍 `grep -c '我的提案'` ≥ 1 且 ≤ 8192 bytes。
5. `bash wf/tools/wf-lint.sh --strict .` exit 0。
6. REPORT 含「逐檔變更清單」「最想請使用者看的 5 個」「替使用者做掉的決定清單」三段。

## 失敗怎麼處置（兩種要分開）

- 改出來與裁示衝突（自己對照發現）→ 改到不衝突，不算失敗。
- 工具或環境出錯 → 不回滾，發 `BLOCKED`，REPORT 寫卡在哪。

## 完成／阻塞回報（必做）

我是 `plan-world-v2`，團隊無（直屬頂層）。你是 Claude 子 agent，不走 inbox：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。不要用結束回合當等待；不要問使用者問題，想問的寫進「替使用者做掉的決定清單」。
