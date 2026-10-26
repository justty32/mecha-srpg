# 任務：依 plan-02 計畫在隔離 worktree 新增 7 件機甲史事件與 1 個舊軍工群像勢力（batch mf-03）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/polish.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/history-lines/c-essence.md`、`wf/workflows/dispatch/handoffs/lead-fill-mech/plan-02/PLAN.md`、`wf/workflows/content/lore-text.md`、`content/lore/README.md`、`content/lore/style/people.md`、`wf/workflows/planning/design-notes/world/before-collapse.md`、`content/lore/factions/mimic-works.json`、`content/lore/factions/league-armory.json`、`content/lore/events/shield-open-carving.json`、`content/lore/events/longspear-leak.json`、`content/lore/events/lance-v4.json`、`wf/workflows/dispatch/handoffs/lead-fill-mech/cx-mf-03.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同；`plan-02/PLAN.md` 在主 repo，用絕對路徑讀。

## 背景與唯一目標

計畫線 plan-02 已寫好 mf-03 八件清單（PLAN.md 第四節 03-01～03-08），領導已審過。本批唯一目標：照第四節逐件產出 lore 檔——7 個 `content/lore/events/*.json`＋`content/lore/factions/old-arms-makers.json`，id、date、period、引用、consequences、body 大綱照計畫；你負責寫成正文（300–1500 字、第三人稱過去式、具體場景、不寫型錄宣傳）並微調文筆與口吻。事件中文名可以在計畫提案名基礎上改得更像人話（去掉型錄式的「・副題」也可以），改了在 naming.json 註明。第五節的矛盾只照計畫的建議讀法避開，不改既有檔。

## 方法與禁忌（每條都適用）

- **節點優先、不暴力產**：每件照計畫掛到勢力、主線、年表或崩年底色；不新增計畫以外的具名人物、地名、事件、機體名、公司名。
- **中文命名避免直譯**（兩步命名，`polish.md`「首要標準」）；用語照 style.md 與 `wf/workflows/planning/design-notes/terms-rename.json`：古代機本體叫古代機、外層叫裝甲；衍型機、鎧甲、靈目、矢、燼、蝕潮。新名詞標「提案名」。
- **不拿其他作品類比**；不寫真實公司、真實武器型號、真實人名。
- **國家、塞勒涅、巨頭只削弱不萬能**：舊軍工「沒有一家死，沒有一家還是原來的樣子」；凡鐵對獸只刮外甲。
- **已裁示不推翻**：公刻只給 D 級地板；C 級精粹與量產件須向國家型傘或塞勒涅買；計畫第五節的建議讀法照用。
- **數值**照計畫比照的既有件暫填，不做平衡（使用者：最後統一調）。

## 範圍（排除法寫死）

- 新增只限 PLAN 第四節列的 8 檔：`content/lore/events/{bulwark-first-workshops,silverring-g1-catalogue,bulwark-ii-standard,longspear-v4-standard,tern-rollout,fr7-at12-public-issue,hound-ii-license}.json`、`content/lore/factions/old-arms-makers.json`。不改 `timeline.json`（年表回連由領導做）。
- 不做：計畫外的任何新檔、既有任何檔的修改、`content/index/`、`content/batches/`、`src/`、`wf/`（報告目錄除外）；不刪檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-mf-03/`）。
- 件數 gate：新檔超過 8 個就停下回報；容量 gate：任一新檔超過 12 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（worktree 根，errors=0；新事件不在年表造成的警告可接受，REPORT 註明數量）與 `npm run check`（末行 `OK 0 errors`） | 每寫完一檔跑 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 寫 naming.json、review-rows.json（先手建 wf-table/1 空表再 `add`） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-mf-03 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-mech/wt-mf-03/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/mf-03/`；**不 commit**（沙箱下 `.git` 唯讀）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網；不用 MCP。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-mf-03 --up PROGRESS '已讀完先讀清單，開始寫 mf-03' < /dev/null`）。
2. 照計畫逐件寫八件 lore，每檔後跑檢查。
3. 寫 naming.json、review-rows.json。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/mf-03/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-mech/wt-mf-03/content/…` |
| REPORT、naming.json、review-rows.json | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/mf-03/` |

REPORT：開頭「已讀清單」；再四段（做了什麼：逐檔一句＋掛點＋和計畫有出入處；產出；沒做到或證據不足的；需要決定的事：與既有 lore 或設定筆記矛盾處）；末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 末行 errors=0。
2. 8 個新檔存在、檔名＝id name 段，每件 body 300–1500 字。
3. `naming.json`（欄位 `id`、`nameEn`、`meaning`、`nameZh`、`method`、`status`）與 `review-rows.json`（欄位 `檔`、`類別`、`名稱`、`白話`、`掛到`；以 plan-02 的 `review-draft.json` 對應列為底稿，依實際產出修正）各有與新檔數相同的列數，`白話` 每列 ≤60 字。
4. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西；`npm test` 由領導驗收時跑。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好就發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-mf-03`。本線團隊：`teams/mech`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-mf-03 --up DONE 'mf-03 新增 N 檔，檢查 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/mf-03/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
