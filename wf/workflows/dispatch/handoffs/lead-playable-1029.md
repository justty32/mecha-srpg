# 任務：整合可玩的營運戰鬥循環與豐富戰場

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，親自通讀適用的 wf 規矩：WORKFLOWS、dispatch、team-model、planning、feature-dev、testing、common/user 及其子頁、conventions、code-map、dev-env、data-files、resources；依路由補讀，不靠本摘要。所有實質子代理同樣先讀，簡單雜活例外。

## 背景與唯一目標

使用者 2026-10-29 要停止只填內容、把遊戲整個做好，特別指出 miss 過高、戰場太空，以及營運頁面一直不能存取。目標是交付可進入營運、出戰、結算繼續遊玩的完整循環，並實作降低 miss 挫折、可破壞掩體、地面輔助部隊、廢墟碎石、可拾取碎石、殘骸與怪獸屍體。先查現況，由 astra 設計可驗收方案，sol 實作，不把無限內容擴充當完成條件。你是 sol 隊長，主線只交流與裁決。

## 最新介面要求

修正營運地圖顯示；由astra重新設計戰鬥頁戰場、行動、狀態、部位與log的布局層次，再由sol落地。旗子格內顯誠實整體結構完整度條，血量另標；敵方霧中僅最後所見或未知。獨立常駐部位panel顯裝甲／結構／失能／持續傷勢並連動瞄準。精確鎖檔後實作，維持162產品件gate及單runner。

## 最新節奏目標（取代舊20回合）

使用者最新要求原預設4v4正面交戰，10回合內至少一方全滅或剩餘存活者全員重傷；死亡與首次重傷達標分開記錄，不把重傷改成遊戲勝利。固定判準見 [demo-severity](../../planning/specs/demo-severity-1029.md)：核心結構或vital生命池≤30%，或至少兩個不同重要部位破壞且造成永久功能失能。外甲傷、暫效、資源不足、退場不算。初始每台必須非重傷，陰陽性反例先驗；未調整cleave36先量1/7/13，再按證據調真數值，最後20固定加5保留。保留原編組、地圖、部署、初始資源及五級2/3/4/5/6整回合移動。每seed列首次達標方與每名存活者理由，另記真全殲回合及勝方。

## 範圍（排除法寫死）

2026-10-29主線最新裁示：產品gate162僅容納已授權戰鬥布局／格內條／部位panel、營運區域標籤、必要回歸及有證據黃金／索引更新，不授權額外新機制；容量25MB不變。

- 另經主線核准精確擴檔 `schemas/content.schema.json`，僅 MapDef.objects、本輪戰場常數、scenario.rules.scriptedAccuracyBase/noRetreat、幾何命中/傷勢/有限近戰防禦必要資料欄驗證。
- 只做：調度與整合 `src/`、`content/base/`、`content/index/`、`test/`、`e2e/` 的上述遊戲功能及阻斷整合的既有失敗；先列精確檔案再派工。可維護 `wf/workflows/testing-checks.json`（僅主線核准更新war不變量耗時提示，驗證條件不變）、`wf/workflows/planning/`、`wf/workflows/common/code-map.md`、`wf/workflows/common/code-map.json`、`wf/workflows/common/user/working.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/dispatch/CLAIMS.md`、本線與子線交接書及報告。必要時可改根目錄 README.md、package.json、vite.config.ts、playwright.config.ts、tsconfig*.json；須先回報原因。
- 不做：`legacy/`、既有獨立 `art/` 試作、無關 lore 填充、其他工具及環境設定；不替使用者裁定既有 Fable 三題。舊暫停線無在跑工人，重疊檔須由你登記本輪接手。
- 件數 gate：新增或修改超過 162 個產品檔案先回報；容量 gate：新增產物超過 25 MB 先回報。報告不得嵌入整套大型 log。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| 原生 agent 工具 | 啟動、監看、接收子線回報 |
| `python3 wf/tools/brief_lint.py` | 各交接書送出前以 --strict 驗證 |
| `bash wf/tools/wf-lint.sh --strict .` | 收件後文件驗證 |
| `node --test` | 依 testing 指定單檔與整合驗證 |
| `git log --oneline`、`git status --short` | 收線核提交與殘留 |

## 資源與禁區

**可寫程式碼線**：你負責拆工、驗收、整合，不親做工人份量。普通工作 gpt-6.1-sol、簡單雜活 gpt-6.1-terra、美術與設計 gpt-6-astra；使用原生工具需 override 時 fork_turns=none。子代理上限 3 個同時工作，含設計工；子 agent 可再派，但整棵樹同時工人最多 3，由你統一配額。可先並行 ops 修復、astra 設計、terra 盤點。

不碰鍵盤、滑鼠、螢幕、不開 GUI；不刪檔、不 rm -rf；不改 ~/.codex/config.toml、不碰 .gitignore；不建分支、不 rebase/reset 別人提交。不覆蓋現存三個未追蹤 review log。只 main 明確檔案提交，git commit -- 明確路徑。使用者明確允許隨意 push，你可在驗證後 push。不要另行請准。

全機重負載最多一個，先 pgrep 查核，用 nice -n 19、低 concurrency；工人只單檔，整合測試由你串行協調一次。可 headless 瀏覽器但不可開桌面。沿用既有工具，不安裝或下載；必要下載先報主線說明來源用途。工具失敗先修可逆環境問題，不能解才帶證據回報。對外查詢只用 web 工具；本機 HTTP 以現有 headless/HTTP 工具驗證。

## 工作

1. 立即建立本輪 open 狀態，核對舊失敗與待辦。先安排營運無法存取的重現與修正；若無法重現再提出精確問題，不直接叫使用者自查。
2. 派 astra 設計：核對既有戰鬥系統、命中實測、物件支援，做最小但完整的互動設計與詳規；給出本輪完成邊界及尚缺項，避免和舊 Fable 題重疊。
3. 依設計逐批派 sol 實作邏輯、內容與 DOM，先明確鎖檔與契約；普通單位、掩體、拾取與殘骸需可在實際遊戲使用，不能只放展示頁。新增模組先補 spec。命中率需前後量測與預覽一致。
4. 整合並跑固定驗收；現有 9 敗須分清本輪新增或基準問題，修復阻斷遊玩者，不盲目更新黃金。按實際結果回報，不宣稱整個龐大設計無缺口。
5. 同步 code map、狀態、報告，提交推送。每 1–2 分鐘向主線報有意義的進度或阻塞。新優先項從主線接收，未完不能自行結束。

## 交付

REPORT 直接寫到 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playable-1029/REPORT.md`；四段：做了什麼、產出、沒做到或證據不足的、需要決定的事；附以後交接書該點名工具。產品修復留在以上明列路徑。回報簡短摘要、實際可玩網址、commit/push、測試證據與未完項。

## 驗收（固定 5 條）

1. 營運直接網址與頁內導航皆有 headless 載入證據，開新戰役→出戰→戰果返回營運自動測試通過；錯誤狀態可讀且可恢復。
2. 預設白手套原4v4正面交戰在20回合內至少一方全dead/alive0，20固定seed與保留seed核UnitDied/雙方alive/dead/retreated/ejected；撤退/棄機/士氣崩/據點/失能仍活/timeout不算，正常頁可重現。命中調整有同情境前後可重現數據，預覽與實際結算一致的回歸測試通過。
3. 使用者列出的掩體、地面支援、廢墟碎石、拾取、殘骸與屍體在真實戰場具呈現及對應互動；相關邏輯與 DOM 測試通過。
4. testing 規定的必要驗證與 wf-lint 嚴格回傳 0，或逐一提供阻塞證據與影響；不以舊輸出充本輪結果、不掩蓋失敗。
5. REPORT、code map、open 狀態一致，提交只含本輪明確路徑，推送結果可核對，子線終局且沒有本輪殘留重負載。

## 失敗怎麼處置

本線 regression 修好再驗；無法修復則只撤回自己的失敗改動並報 FAILED，不動別人工作。拿不到驗證證據就保持現狀報 BLOCKED，寫明解除條件。原生工具回報，不寄外部訊息。遇 gate 只回報等裁決，不擅自擴張。
