# 任務：依 plan-02 計畫在隔離 worktree 新增 6 件舊軍工非核心件 components（batch mf-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/polish.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/history-lines/c-essence.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-mech/plan-02/PLAN.md`、`wf/workflows/content/mechs.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-mech/cx-mf-02.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同；`plan-02/PLAN.md` 在主 repo，用絕對路徑讀。

## 背景與唯一目標

計畫線 plan-02 已寫好 mf-02 六件清單（PLAN.md 第三節 02-01～02-06），領導已審過。本批唯一目標：照第三節逐件產出 `content/base/components/oa-*.json` 六檔，名稱、slot、數值比照、取捨照計畫；你負責落檔與文筆微調（name、desc 等文字欄的口吻）。

## 方法與禁忌（每條都適用）

- **節點優先、不暴力產**：每件照計畫掛到勢力、主線、年表或崩年底色；不新增計畫以外的具名人物、地名、事件、機體名、公司名。
- **中文命名避免直譯**（兩步命名，`polish.md`「首要標準」）；用語照 style.md 與 `wf/workflows/planning/design-notes/terms-rename.json`：古代機本體叫古代機、外層叫裝甲；衍型機、鎧甲、靈目、矢、燼、蝕潮。新名詞標「提案名」。
- **不拿其他作品類比**；不寫真實公司、真實武器型號、真實人名。
- **國家、塞勒涅、巨頭只削弱不萬能**：舊軍工「沒有一家死，沒有一家還是原來的樣子」；凡鐵對獸只刮外甲。
- **已裁示不推翻**：公刻只給 D 級地板；C 級精粹與量產件須向國家型傘或塞勒涅買；計畫第五節的建議讀法照用。
- **數值**照計畫比照的既有件暫填，不做平衡（使用者：最後統一調）。

## 範圍（排除法寫死）

- 新增只限 `content/base/components/` 下 PLAN 第三節列的 6 個 `oa-*.json`（id 照計畫）。
- 不做：計畫外的任何新檔、既有任何檔的修改、`content/index/`、`content/batches/`、`src/`、`wf/`（報告目錄除外）；不刪檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-mf-02/`）。
- 件數 gate：新檔超過 6 個就停下回報；容量 gate：任一新檔超過 12 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check`（worktree 根，末行 `OK 0 errors`） | 每寫完一檔跑 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 寫 naming.json、review-rows.json（先手建 wf-table/1 空表再 `add`） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-mf-02 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-mech/wt-mf-02/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-mech/mf-02/`；**不 commit**（沙箱下 `.git` 唯讀）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網；不用 MCP。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-mf-02 --up PROGRESS '已讀完先讀清單，開始寫 mf-02' < /dev/null`）。
2. 照計畫逐件寫六件 components，每檔後跑檢查。
3. 寫 naming.json、review-rows.json。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-mech/mf-02/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-mech/wt-mf-02/content/…` |
| REPORT、naming.json、review-rows.json | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-mech/mf-02/` |

REPORT：開頭「已讀清單」；再四段（做了什麼：逐檔一句＋掛點＋和計畫有出入處；產出；沒做到或證據不足的；需要決定的事：與既有 lore 或設定筆記矛盾處）；末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內 `npm run check` 末行含 `OK 0 errors`。
2. 6 個 `content/base/components/oa-*.json` 存在、檔名＝id name 段。
3. `naming.json`（欄位 `id`、`nameEn`、`meaning`、`nameZh`、`method`、`status`）與 `review-rows.json`（欄位 `檔`、`類別`、`名稱`、`白話`、`掛到`；以 plan-02 的 `review-draft.json` 對應列為底稿，依實際產出修正）各有與新檔數相同的列數，`白話` 每列 ≤60 字。
4. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西；`npm test` 由領導驗收時跑。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好就發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-mf-02`。本線團隊：`teams/mech`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-mf-02 --up DONE 'mf-02 新增 N 檔，檢查 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-mech/mf-02/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
