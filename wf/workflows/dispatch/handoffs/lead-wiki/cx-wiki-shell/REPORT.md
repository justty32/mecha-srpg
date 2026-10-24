# cx-wiki-shell：殼與路由已交付，8 個 node 測試與雙 tsc 通過；e2e 受沙箱阻擋

## 做了什麼
已親讀交接書點名的 AGENTS.md、wf 規矩、凍結型別、markdown 與架構契約。完成 hash 路由、40px 三頁導航、戰鬥懶掛載、百科動態載入與 WikiApi 接線、百科快捷鍵、輸入焦點保護及隱藏戰鬥鍵盤 guard。戰鬥切走保留 mount，返回送 resize；搜尋 replaceState 保留戰鬥 query。main.ts 原有 spectate 接線與 controller 的別線改動均保留。

驗證維持交接書固定範圍：

- `node --test --test-isolation=none --test-reporter=tap src/ui-adapter/vm/route.test.ts src/ui-adapter/dom/shell.test.ts`：exit 0，8 tests／8 pass／0 fail，route 5 個、shell 3 個。
- `npx tsc --noEmit`、`npx tsc --noEmit -p tsconfig.ui.json`：最終均 exit 0；每個程式／測試檔完成後亦執行 UI tsc。
- `e2e/wiki.spec.ts` 恰好 3 條，涵蓋 F1 往返保留回合、從 content/base 讀 frame 名稱搜尋、交叉引用與瀏覽器返回，三條均收集 pageerror／console error。
- 範圍核對：9 個新增程式／測試檔，加 REPORT 共 10 個；新增非測試程式約 12 KB，連同本線對既有檔的新增內容與 REPORT 仍小於 40 KB。本線造成的 git status 改動均在許可路徑，未改既有 battle.spec.ts、未 commit。

## 產出（檔清單）
新增（以下相對專案根）：

- `src/ui-adapter/vm/route.ts`、`route.test.ts`
- `src/ui-adapter/vm/wiki/keymap-wiki.json`、`keys.ts`
- `src/ui-adapter/dom/shell.ts`、`shell.css`、`shell.test.ts`、`wiki/boot.ts`
- `e2e/wiki.spec.ts`
- `wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-shell/REPORT.md`

最小修改：`src/ui-adapter/vm/{types.ts,keymap.ts,keymap.json,controller.ts}`、`src/ui-adapter/dom/{render.ts,style.css,main.ts}`、`index.html`。

## 沒做到或證據不足的
`npx playwright test e2e/wiki.spec.ts` 未能啟動設定內的 webServer，exit 1。為辨別來源，使用 `DEBUG=pw:webserver npx playwright test e2e/wiki.spec.ts` 重跑，明確取得 `connect EPERM ::1:4174` 與 `connect EPERM 127.0.0.1:4174`；終止於 `Process from config.webServer was not able to start. Exit code: 1`。三條 e2e 沒有實際執行，沒有宣稱通過；未自行起 dev server 或開 GUI。

解除條件：領導在沙箱外執行同一條 Playwright 指令；另依交接書重算 8 個 node 測試與重跑雙 tsc。既有戰鬥 e2e 未改、未額外擴大驗收。終局採 BLOCKED，表示瀏覽器整合證據受環境阻擋，實作與 node／型別驗證已交付。

## 需要決定的事
請領導接手沙箱外 e2e 驗證。其餘無。

## SPEC-GAP 清單
1. 契約只命名 WikiKeyAction，未定義結構；採鍵位資料檔的 action 字串聯集，由 shell 映射 WikiMount 方法或 navigate，已於 keys.ts 註解。
2. 契約未定義損壞的百分比編碼；parseHash 以最小容錯回百科首頁，已註解。query 使用純字串解析，不依賴 DOM／URLSearchParams 型別。

## 以後交接書該點名的工具
無。
