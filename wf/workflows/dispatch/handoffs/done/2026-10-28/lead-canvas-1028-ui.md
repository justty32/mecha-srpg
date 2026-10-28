# 任務：整合離線 Konva 展示與本機 CDP 驗證

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`、`wf/workflows/dev-env.md`，親讀不得只靠摘要。

## 背景與唯一目標

你是 cx-canvas-ui-1028，gpt-6.1-sol，原生工具回傳，子代理上限0。把全新礁鷹核心與astra畫件整合為離線直接開file的Canvas+Konva展示。現在核心與美術尚未交付，先建立UI框架及局部環境，不重做它們。

## 範圍（排除法寫死）

只寫 `/mnt/c/code/mine/mecha-srpg/art/canvas-mech/viewer/`、同層 `vendor/`、`index.html`、`build.mjs`、`headless.mjs`、`README.md`，以及 `/mnt/c/code/mine/mecha-srpg/node_modules/.canvas-headless/` ignored暫存。REPORT寫viewer/REPORT.md。core/唯讀、drawing/唯讀，等待凍結接口才整合。不做：不要讀取任何舊art、SVG、rig、資料或圖片。不寫遊戲src/content/spec、根package/lock、其他wf。不設計機甲造型。
件數 gate：最多160葉、260節點；容量 gate：產物15MB不含node_modules，任一超限回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node art/canvas-mech/build.mjs` | 產生無網路離線展示 |
| `node art/canvas-mech/headless.mjs` | 既有Chromium直接CDP互動與PNG |
| `ldd`、`dpkg-deb -x`、`apt-cache show` | 局部依賴及SHA256 |

## 資源與禁區

可寫程式碼線，僅上述明列檔案。不得刪檔、commit、push、建分支、rebase/reset、GUI、鍵鼠桌面、改系統/config/.gitignore。重負載全機最多1，首次真正headless測試先回報領導安排。不得安裝Playwright、瀏覽器或額外依賴。以下特定下載已向使用者告知並授權：官方 npm registry konva@10.9.0，vendor保存license及來源；官方archive.ubuntu.com的noble amd64包 libnspr4=2:4.35-1.1build1、libnss3=2:3.98-1ubuntu0.3、libasound2t64=1.2.11-1ubuntu0.3、libasound2-data同版。deb置node_modules/.canvas-headless/debs，dpkg-deb -x到root，不sudo、不系統安裝。先apt-cache show比SHA256，若404同官方源查noble合適版本並核sha，不換distro。只為headless設LD_LIBRARY_PATH=repo/node_modules/.canvas-headless/root/usr/lib/x86_64-linux-gnu，ldd無missing後啟動。既有Chromium revision1243，Node24 WebSocket直接CDP，不下載新browser。

## 工作

UI需可展開真正層樹，各層選取/顯隱/solo，父動子隨，逐層分解組裝，骨架/接點疊圖，抬臂屈肘屈膝/播放暫停還原，高DPI/縮放，好用UI。暗維修台/地面投影/背輪廓燈。葉drawLeaf(ctx,job,visualState)由astra專責，你只整合Konva custom Shape與核心變換。展示含待機、舉盾瞄準、低姿支撐，不宣稱腳接地IK；短砲/光矢砲，不寫電磁砲。

先等待核心凍結接口通知；可先處理下載與UI外框。固定2D視角前側3/4。最終單HTML全內嵌，file無fetch無CDN。Konva真實使用，不能轉繪舊SVG。CDP測試有正例與反例，實際互動驗證各層顯隱、選取、solo、父動子隨、動作、分解、還原、離線無請求、DPI縮放；存PNG供領導親看。

## 交付

REPORT：`/mnt/c/code/mine/mecha-srpg/art/canvas-mech/viewer/REPORT.md`，做了什麼／產出／沒做到或證據不足／需要決定的事／以後交接書該點名的工具。原生工具回傳階段及終局，不寄頂層inbox。

## 驗收（固定 2 條）

1. 離線建置可重現，leaf契約通過，無CDN/fetch，固定Konva10.9.0及license，產物gate通過。
2. 本機CDP實際互動與PNG證據；環境擋就如實BLOCKED，不能冒稱通過；不跑遊戲整合套件。

## 失敗怎麼處置

自己的程式錯自行修；工具環境出錯回報BLOCKED。不得回滾別人的檔案。未收到核心和astra交付時保持等待，回報可做進度，不自行補畫。

## 完成證據

2026-10-28 DONE。本機CDP11項PASS，browser無殘留；待機/舉盾/低姿/分解PNG已親看，viewer/REPORT.md與headless-result.json保存證據。 原生工具終局回傳，不走頂層inbox。統一以本輪Canvas提交為git log核對依據；未改領地外檔案，commit/push由領導執行。
