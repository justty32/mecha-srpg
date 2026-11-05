# testing — 跑測試 / 驗證

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

改完怎麼確認沒壞：有哪些驗證、各自的指令、哪些 agent 自己跑得了、哪些得交給使用者。

**何時用**：改完程式要驗、使用者說「跑測試」、重構前要記基準。
**何時不用**：環境還沒裝好、不知道指令哪來 → [dev-env](dev-env.md)；驗證紅了要查成因 → [investigation](investigation.md)。

## Done when

- 下表標「改完必跑」的列指令回傳 0。
- 「誰跑」是使用者的列，已在 [WAIT_USER](../WAIT_USER.md) 各留一行（寫明跑什麼、什麼算過）。

## 驗證表

已抽到 [testing-checks.json](testing-checks.json)（12 列：快速驗證、完整驗證、營運層、戰鬥效能、文件 lint、驗收模擬、AI 平衡量測、實際遊玩、MCP server、戰鬥規則 fuzz、內容平衡探針、內容批次護欄）。

欄位：`驗證`（名稱與何時跑）、`指令`、`誰跑`（agent，或 使用者 → WAIT_USER）。查法見 [data-files](common/data-files.md)。

**改 `src/ui-adapter/` 必跑**（agent）：`npm run test:dom`（vm 單元＋happy-dom DOM＋模組邊界 `vm/boundary.test.ts`＋全 AI 觀戰 hash 等於 `runBattle`，已含在 `npm test`）、`npm run build`、`npm run test:e2e`（Playwright headless，2026-11-05 瘦身後 4 檔 19 案、未實跑：`battle.spec.ts` 戰鬥 11 案＝載入、行動後浮出選單、結束回合確認、縮放與記住設定、跳過動畫、大地圖捲動、觀戰、混合兵種情境、正式觀戰與 node 同 hash、安全拖曳 mouse／touch；`wiki.spec.ts` 百科 3 案＝F1 進出百科、搜尋開詳情、交叉連結與瀏覽器返回；`ops-map.spec.ts` 大地圖 3 案＝開局→抵達→泊、安全拖曳 mouse／touch；`ops-campaign.spec.ts` 營運 2 案＝導航進出保留戰役、開新戰役→推進→接約→航行→出戰→返回營運看戰果（`/?seed=3&spectate=1&anim=off#/ops`，掛鉤 `window.__ops`／`__opsBattle.settle()`；設環境變數 `OPS_SHOTS=<目錄>` 才存六張截圖）；自動 build＋preview 在 4174 埠；URL `?anim=off` 讓演出不延遲，`window.__battle.settle()` 跳過演出）。

**全套基準**（node 套件，不含 `src/mcp/ui.test.ts` 與 e2e；nice 19、`--test-concurrency=1`）：2026-11-05 瘦身第一階段後 163 檔、1012 案全綠，序列耗時**估算**約 1060 秒（瘦身前 169 檔、1143 案、實測 1690 秒）；最慢的是 `war-invariants`（縮後約 150 秒）、`ops/sim/health`、`campaigns`。瘦身進度與剩餘階段見 [test-prune-1105](../notes/investigations/test-prune-1105/README.md)。

**黃金規矩**：改勢力營運或世界內容的 commit，必須在同一個 commit 重錄黃金，並在訊息寫明原因（見 [decisions](decisions/2026-11-05-golden-a3407d97.md)）。

「誰跑」只有兩種值：**agent**（本機跑得動）、**使用者 → WAIT_USER**（要實機、外部服務、帳號、付費、目視）。判不準就當後者。

## 測試分類

邏輯層與 DOM 都能在 node 裡 headless 驗（策略見 spec 的 [architecture](planning/specs/core/architecture.md)「headless 測試策略」）；畫面、手感是否真的對，交給使用者確認。

- `fast`：本專案自己的 unit／source gate；每次小改都跑。
- `contract`：跨元件的真實 CLI／process 邊界；改 producer、consumer 或協定時跑。
- `full`：README 指定的完整離線 suite；commit 前或大改後跑。
- `external`：需要實機、外部服務、素材、帳號或人工感官驗收；agent 代跑不了的記到 [WAIT_USER](../WAIT_USER.md)。

## 綠燈不等於有檢查

**一道檢查通過，可能是因為它根本沒在檢查。** 這不是假設：曾在一天內抓到四個恆真檢查——結構稽核、「鎖已釋放」的檢查指向已刪目錄、連結檢查器走到子 repo 指標就停、自製字元偵測。

**規則：新增或修改一道檢查時，要證明它能變紅。** 先餵一個**應該被擋**的輸入，確認 exit ≠ 0；再餵正確的輸入，確認 exit = 0。**沒做過這個雙向驗證的綠燈不算證據。**

兩個推論：檢查器的**涵蓋範圍要跟著結構走**——拆出子 repo、搬走目錄之後，回頭確認檢查器還看得到那些地方（見 [refactor/moving-things.md](refactor/moving-things.md)）；**靜態全過不等於畫面上是對的**，方框、亂碼、截斷、手感只有人眼看得出來，這類記到 [WAIT_USER](../WAIT_USER.md)，不要自己宣稱通過。

## 交接

- 綠燈後回 [feature-dev](feature-dev/README.md) 接完剩下的步驟（code map → 文檔 → commit）。
- 同一個紅燈第二次撞到 → [common/gotchas](common/gotchas.md)。
