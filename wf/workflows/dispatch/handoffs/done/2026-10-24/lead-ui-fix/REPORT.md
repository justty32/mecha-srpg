# REPORT — lead-ui-fix：試玩回饋九項全部落地，乾淨 worktree 全綠

[feedback](feedback.md)｜[contract](contract.md)｜工人 [cx-uifix-vm](cx-uifix-vm/REPORT.md)、[cx-uifix-dom](cx-uifix-dom/REPORT.md)

STATUS：**DONE**（2026-10-24）。兩條 codex 工人（gpt-6-astra）並行：`cx-uifix-vm`（vm 層＋14 測試）、`cx-uifix-dom`（dom 層＋main.ts＋12 測試）；領導凍結 `vm/types.ts` 與契約、改 `integration.test.ts`、寫 e2e、兩處收尾修正。

## 做了什麼（九項）

| # | 項目 | 狀態 | 做法 |
|---|---|---|---|
| 1 | 敵人部件血量 | 完成 | 視野內讀 state 給全部部件與每層即時 hp；離開視野回最後所見快照（`UnitView.stale`／`seenRound`，灰色），方格在 lastSeen 位置畫灰色殘影。規則知識未改，快照存在 vm |
| 2 | 行動流程 | 完成 | 行動後保持選取、棋子旁浮出選單；idle 點可達格直接移動；無可用移動與能力 → 自動待機並輪下一台；E 隨時可按，有未行動我方先出「還有 N 台未行動，確定結束？」 |
| 3 | 戰場自動貼合 | 完成 | 格大小＝面板／地圖取小、夾 [24,72] px；ResizeObserver＋視窗 resize 重算 |
| 4 | 手動縮放 | 完成 | Ctrl＋滾輪、`+`／`=`、`-`、`0`、面板與戰場角落縮放鈕；以游標／滑鼠格為錨；localStorage（try/catch）；一般滾輪仍捲動 |
| 5 | 行動中高亮 | 完成 | 行動中暖黃粗框呼吸、選取中青色細框；敵方回合先聚焦（鏡頭跟、高亮）再執行；可移動藍底、射程淡紅底、合法目標紅底紅框 |
| 6 | 戰場演出 | 完成 | 移動直達終點＋路徑箭頭 0.5 s 淡出；攻擊線、命中格閃、「部位 −N」／「未命中」浮字；效果／暴走／損毀短標籤；敵方逐台播放；log 移動合一行、點行鏡頭跳過去 |
| 7 | 動畫可跳過 | 完成 | 跳過鈕（Esc）、播放中 Esc／空白／K；動畫開／快／關（A）記在 localStorage；關＝只剩路徑閃與傷害／未命中 |
| 8 | 按鈕面板常駐 | 完成 | 左欄固定面板，七顆固定鈕＋能力，節點重用不移位；不可按變灰＋tooltip 原因 |
| 9 | 粗糙處 | 完成（部位選擇內容包目前用不到） | 能力 `partAim.allowed` 或 `target.kind:"part"` 時出部位選單（數字鍵／點選）；層種類中文走 registry name，否則 UI 對照表 `layerTypeLabel` |

領導收尾修正：(a) 側欄改三段，戰鬥記錄固定佔下方約 30% 恆可見（工人版被單位面板擠出畫面）；縮放／動畫鈕鍵名大寫。(b) 我方回合時指令與快捷鍵一律針對行動中那台——工人版點敵機查看後整排按鈕變灰，違反第 8 項。

## 產出

- 程式：`src/ui-adapter/vm/`（session、controller、viewmodel、新 presentation、keymap、labels、text、types）、`src/ui-adapter/dom/`（render、board、panels、新 menus／fx／zoom、style.css、main.ts）。
- 測試：vm `feedback.test.ts` 14、dom `uifix.test.ts` 12、`integration.test.ts` 改寫；`e2e/battle.spec.ts` 3 → 7 條。
- 文件：本目錄 feedback／contract／工人交接書與 REPORT；code-map、testing 的 UI 段。

**驗證**（乾淨 worktree＝HEAD `29d175a`＋本線 ui-adapter／e2e，與工作樹各跑一次，結果相同）：`npm test` 344／344、`check` 0 錯誤、`typecheck` exit 0、`test:dom` 65／65（原 39＋26）、`build` 266 KB、`test:e2e` 7／7。

## 新快捷鍵

| 鍵 | 操作 |
|---|---|
| W | 待機（這台結束；規則 `end`）|
| D | 延後（移到本輪隊尾；規則 `wait`，原 W）|
| E | 結束回合（我方本輪全部；有未行動者再按 E）|
| K／播放中 Esc、空白 | 跳過演出 |
| `+` `=`／`-`／`0` | 放大／縮小／自動貼合 |
| A | 動畫 開→快→關 |
| 1–9 | 能力；選部位時選部位 |

## 沒做到或證據不足的

- 手感、演出節奏、浮字可讀性只有人眼能判；領導看過 headless 截圖（佈局、浮出選單、路徑箭頭、敵方中文層名）。
- 基礎內容包沒有可瞄部位的能力，試玩看不到部位選單（測試用自建內容驗過）。
- wf-lint 既有問題非本線造成：ROSTER 超 8 KB（本線前 13 KB）、SESSION-LOG 別線壞連結、三處既有 BIGLIST。
- 共用檔 CLAIMS（本線一列）、ROSTER（一格）、`teams/uifix/`、`handoffs/STATE.md` 未 commit（混有別線改動），交調度者。

## 需要決定的事

1. 「待機」語意：使用者的待機＝這台結束（W）；規則 `wait` 改叫「延後」（D）。
2. 「結束回合」＝本輪尚未輪完的我方作戰單位一律待機（本遊戲依先攻逐台輪流）；行動中那台已下過指令不計入 N。
3. 點敵機查看後，可達格高亮與「點空格直接移動」暫時消失（指令與快捷鍵照用），點回自己或按 C／Tab 恢復——試玩後決定要不要恆顯示。
4. 建議 content 線把 `registries/layer-types.json` 的 name 改中文，UI 對照表自動退場。
5. WAIT_USER 第 14 行可改成「試玩 lead-ui-fix 改版」（歸調度者）。

## 以後交接書該點名的工具

- headless 截圖：`@playwright/test` 的 `chromium.launch({headless:true})`＋`page.screenshot`，配背景 `vite preview --port <非 4174>`。
- 乾淨 worktree：`git worktree add --detach <獨特目錄> HEAD`＋rsync 本線目錄＋symlink `node_modules`；目錄名撞到別線的會讓 `&&` 鏈斷、指令跑回主工作樹（本線踩過一次）。
