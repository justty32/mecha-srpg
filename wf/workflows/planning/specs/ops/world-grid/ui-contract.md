# ui-contract — 大地圖畫面：沿用戰場方格渲染、專屬圖層、快捷鍵、`sail` 參數

[world-grid README](README.md)｜營運畫面契約 [text-ui-contract](../text-ui-contract.md)｜戰場可視區 [core/architecture](../../core/architecture.md)（ViewModel）｜鍵位格式同 `keymap.json`

裁示：UI 走一般網頁遊戲元件（按鈕、列表、面板、tooltip）＋快捷鍵（資料驅動、可改綁、按鈕與 tooltip 顯示鍵）；方格是 DOM／CSS 真格子、無美術；> 120×120 用可視區渲染。

## 共用的方格渲染

戰場 `ui-adapter` 的可視區渲染（每格一個 `div`、CSS class、`viewport`＋`dirty`、縱橫捲動、三段縮放、游標）抽成 `GridView` 共用模組，吃一個 `GridSource` 介面；戰場 ViewModel 與大地圖 `WorldViewModel` 各實作一份，互不 import。

```ts
interface GridSource { size: { w: number; h: number }; viewport: { x: number; y: number; w: number; h: number };
  cell(x, y): { classes: string[]; glyph?: string; badge?: string; highlight?: string; age?: number }; dirty(): Set<CellKey> | "all"; }
type WorldViewModel = GridSource & { map: Id; layers: Record<LayerId, boolean>; cursor: Cell; ship: Cell;
  hover(x, y): { lines: string[] } /*tooltip：座標、地形、區域、蝕深、地點、行動者（最後所見第 N 天）、到此 N 天 M 氦*/;
  pathPreview(to: Loc | { actor: Id }): { cells: Cell[]; days: number; fuel: number; risk: number[]; reachable: boolean; note?: string };
  actions(): Screen["actions"]; minimap(): { w: number; h: number; classes: string[][] } };
```

大地圖 `Screen` 是艦橋房間的一個面板：`Screen.panels.map` 給 `WorldViewModel` 要的狀態（它是 `ops/text` 的純資料產物），DOM 層只畫。切圖（洲）＝換 `map`，`viewport` 以船為中心。

## 圖層（可切換、預設全開除航跡）

| 圖層 | 畫什麼 | 來源 |
|---|---|---|
| `terrain` | 地形底色與圖例字（`glyph`） | 靜態層 |
| `blight` | 淺蝕／深蝕／核三色疊加、核塊閃爍 | `maps[].blight`（經 `known` 快照）|
| `territory` | 勢力地盤淡色邊線（地點 owner 的 footprint 外擴 2 格） | places |
| `places` | 地點標記：城邦■、港▲、遺跡◇、據點●、裂縫口✶、燈標△；失守的打叉 | places |
| `actors` | 行動者標記（部隊、巡邏、商隊、群、獵團各一形）＋朝向箭頭；灰度＝資訊年齡 | `known` |
| `fog` | 未知格（`dark` 圖）純黑；過期格降飽和、角標天數 | `known` |
| `path` | 船的路徑：已走實線、未走虛線、每天一個節點標「D+n」；追擊目標預測位置 | `ship.path` |
| `sight` | 船與天網的可見範圍外框 | fog 模組 |
| `region` | 區域名浮字（縮小時才顯示） | 靜態層 |

縮放三段沿用：1（滿格、看得到圖例字）、½、¼（¼ 時長陸 250×150 約 750×450 px，等於全圖縮圖；`minimap()` 另給右下角固定縮圖，點它跳 `viewport`）。

## 操作與快捷鍵（`keymap-ops.json` 新增 context `map`）

游標與捲動沿用戰場鍵（方向鍵、Shift+方向鍵、`+`／`-`／`0`、`c` 回船）。大地圖專屬：`Enter` 對游標格下 `sail`（有地點就航向地點、有行動者就追擊）；`Tab`／`Shift+Tab` 在地點間跳；`g` 跳到座標或地點名（`prompt`）；`l` 圖層選單（`prompt` 1..9 切）；`t` 切圖（洲）選單；`m` 縮圖開關；`w` `wait 1`、`Shift+w` 等到下個大潮／弦月；`d` `dock`／`drift`；`Escape` 取消路徑預覽；`?` 鍵說明。滑鼠：點格移游標、雙擊＝Enter、拖曳捲動、滾輪縮放、hover 顯示 tooltip。所有按鈕在面板右側列：航／泊／懸／等／切圖／圖層／回船，標鍵、tooltip 寫成本與不可用原因（「燃料不足：缺 12 氦」「追不上：對方 8 格／天」）。

## `sail` 參數擴充（不加動詞）

```ts
{ v: "sail"; to: Id /*place*/ | Cell | { actor: Id }; via?: (Id | Cell)[] }
```

文字形式：`航 達卡`、`航 120,44`、`航 @鹽鷗`（`@` 前綴＝行動者）、`航 靜海市 經 新加坡`。`parse` 對三型往返一致；`sail` 到別張圖的地點自動含航道段，確認框列出「新加坡港等船 3 天、渡潮船 3 天、票價 2800」。

## 遭遇與事件的呈現

接觸時 `Screen.prompt` 給四選（迴避／追擊／交涉／開打，鍵 1–4），面板同時高亮雙方格與接觸範圍；交涉展開第二層選項。`log` 的 `Sighted`／`Evaded`／`Intercepted` 用 `warn` kind；商隊損失、城邦失守用 `blood`。開打後 `Screen.handoff` 交戰場、戰後回到大地圖同一格。

## 效能契約

長陸可視區 60×35 格（1920 寬、½ 縮放）全量重畫 < 30 ms；日結後只重畫 `dirty`（船路徑、變色的蝕格、動過的行動者）；¼ 縱觀圖用 `<canvas>` 或單一 `div` 背景漸層皆可（唯一允許不每格一 `div` 的地方——它只是縮圖，不接受點格以外的互動）。Playwright 端對端一條：開局→大地圖→游標到地點→Enter→等到到達→泊。

## 替使用者做掉的決定

1. **抽 `GridView` 共用、兩個 ViewModel 不互認**：使用者要「沿用戰鬥畫面的方格渲染」，共用的是渲染不是狀態。
2. **資訊年齡用灰度不用問號**：一眼看出「這是三天前看到的」，比圖示省說明。
3. **Enter 一鍵航向游標**：大地圖最常做的事只該按一下；追擊與航向地點是同一鍵由格上內容決定。
4. **¼ 縮放允許非逐格 DOM**：37,500 個 `div` 的縱觀圖沒有意義；但它不接受戰術互動，所以不違反「真格子」裁示。
5. **大地圖是艦橋的一個面板**：不另開頂層畫面，房間模型不變。
