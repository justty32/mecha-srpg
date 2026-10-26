## 做了什麼

cx-web-bt；本團隊：無。實作留在交接指定的 wt-bt worktree，未 commit。已親讀主 repo AGENTS.md、feature-dev、user、conventions、code-map（含 ui-adapter／百科）、testing、dev-env、inbox 規矩、盤點報告 B01–B06 與 wc-01 REPORT；用 tabledb 查閱 code-map／testing-checks。完成開場 inbox_read、上線 PROGRESS 與各項 inbox_poll。

B01：能力消耗及產出按 mech／person owner 解析池宣告中文名；人物池取指令權者，機體池走既有 poolDecls，特殊池有中文 fallback。測試：viewmodel.test.ts「B01」。

B02：單位卡顯示五種移動類別與三種機體類別；格子 tooltip／查看卡帶選中單位的地形基礎成本或不可通行。資料在 VM 組裝，DOM 不算規則。測試：「B02」及 render.test.ts 的 B02／B04／B06 案例。

B03：能力 tooltip 增加中文傷害類型與基礎傷害、效果及觸發時點、產出、冷卻、球／線／錐／自身／單體與已宣告半徑。尚未選目標時，依賴目標的數式標「依目標而定」。測試：「B03」。

B04：我方部位列出已裝部件中文名、插槽、能力／資源／性能／防護功能，以及部位功能中文名；敵方即使可見，也不新增配裝資訊。測試：「B04」及上述 DOM 案例。

B05：unitName 共用 monster.name／epithet，棋盤短名取個體名；可見敵獸與公開 presence 使用個體名，未見敵獸保留原物種名及隱藏規則。測試：「B05」。

B06：可見怪獸顯示異形／野獸／蟲類／菌絲與蛻皮／育幼／預告的靜態說明，明標預告特徵不代表當下意圖；未見敵獸不提供新增生態資訊。測試：「B06」及上述 DOM 案例。

K2：既有 presence 指令與選取限制保留；新增棋盤「在場」及虛線標記、tooltip／查看卡的不可交戰與潮懼光環說明。不可迎戰的場景現在仍列灰色迎戰按鈕，理由為「此戰場不可主動迎戰」；其他不可用理由沿既有回合狀態。迎戰後移除 presence 說明／按鈕，光環保留至來源退出作戰。測試：VM「K2」含真實 controller 查看卡接縫，以及 DOM「K2」。

UI 全部 26 個測試檔逐檔通過，共 166 個案例／166 pass／0 fail；最終定向測試 23/23 通過。七項各自的 check／typecheck 重跑皆 exit 0（check 為核心 0 errors／32 warnings，營運 0 errors／10 warnings）；build 採 `npm run build -- --configLoader native` exit 0。完整套件逐檔已完成 155/155 檔、1000 個案例（994 pass／4 fail／2 skip）；4 個失敗案例集中於交接已列的三個沙箱限制檔。war-invariants 移除批次執行額外時限後，5/5 通過，耗時 249 秒。原樣 `npm test` 最後一輪已完成：155 個檔案包裝測試，152 pass／3 fail，exit 1；3 個失敗恰為下列已知沙箱限制，沒有其他紅檔（acceptance-final-test.log）。不將包裝計數冒稱為實際單元案例數。證據目錄：/tmp/cx-web-bt/，UI 為 dom-sequential.log，定向為 final-focused.log，型別為各項 *-typecheck.log，build 為 final-build.log。

固定四條驗收：1，七個項目皆有實作與測試；2，check／typecheck 全綠，npm test 僅交接明列的沙箱例外；3，本線 10 檔寫集全部在允許範圍；4，本 REPORT 存在。依沙箱例外條款回報 DONE，程式碼留 worktree 供領導取回。

## 改了哪些檔

共修改 10 個來源／測試檔，沒有新增來源檔；加本 REPORT 共 11 檔，未觸發 16 檔與新檔 30 KB gate。node_modules 符號連結維持原狀。

17:23:39 工作樹另外出現非本線修改的 package.json 與 scripts/heavy-lock.sh（全機重負載 flock）；已上報並原樣保留，不列本線交付。領導取碼請只取下列 10 檔。

- src/ui-adapter/vm/labels.ts
- src/ui-adapter/vm/types.ts
- src/ui-adapter/vm/viewmodel.ts
- src/ui-adapter/vm/viewmodel.test.ts
- src/ui-adapter/vm/controller.ts
- src/ui-adapter/vm/text.ts
- src/ui-adapter/dom/board.ts
- src/ui-adapter/dom/panels.ts
- src/ui-adapter/dom/render.test.ts
- src/ui-adapter/dom/style.css

## 沒做到的

SPEC-GAP（依交接允許的靜態退路）：SessionQuery 只有 reachable／pathTo，沒有有效移動類別／單步成本查詢，也沒有精確範圍影響格查詢。因此顯示內容 tags 的基礎移動類別與 terrain.moveCost，明標「地形基礎通行」，不宣稱它是結算成本；實際可達性沿用引擎高亮。能力補靜態形狀／半徑，未新增影響格預覽。

批量 npm test／test:dom 曾出現子檔 SIGTERM；關閉隔離一次載入全部檔案則 exit 137。初期重疊啟動的批量測試已中止，改逐檔關閉隔離跑相同測試檔，逐檔結果見 dom-sequential.log、suite-sequential.log、suite-remaining.log；1000 個案例的 4 個失敗為 src/mcp/cli.test.ts（socket server 未就緒）、src/mcp/e2e.test.ts（2 案例 server 提前退出 0）、src/ops/content/worldgen.test.ts（spawnSync node EPERM）。war-invariants 在批次執行的 180 秒時限內未回傳，另在全機鎖下移除額外時限重跑已 5/5 通過（249 秒，war-final.log）；沒有把自行設定的時限當作驗收條件。其餘逐檔測試全部通過，包含戰役黃金與 presence 引擎測試。原樣 npm test 最終亦只有上述三檔失敗，war-invariants 通過。交領導在沙箱外補跑三檔；沒有修改測試期望或黃金資料。迭代中新增測試的型別／建構參數錯誤已修正，最終定向測試與 typecheck 通過。

wf-lint --strict 的既有紅項不在本線範圍：legacy/docs 兩條外部失效連結；legacy/docs/README.md 與 wf/workflows/content/world-pillars/world.md 兩個 BIGLIST-LINKS。未修改 legacy／wf。code-map 與索引依交接禁寫，留領導整合。未另跑 e2e；npm test 內建 mcp/ui.test.ts 的 headless Chromium 啟動遭沙箱拒絕並跳過，未產生截圖，未另啟動 Playwright。

## 需要決定的事

無新的設計或數值決定。領導依本 REPORT 取回上述 10 檔，統一更新 code-map／索引；在沙箱外重跑 src/mcp/cli.test.ts、src/mcp/e2e.test.ts、src/ops/content/worldgen.test.ts，或整條 npm test。
