# lead-techstack REPORT：網頁三棧與 Godot headless 都能跑 120×120＋200 單位並 headless 驗證；建議純 TS＋Vite，備案 Lit

[交接書](../lead-techstack.md)｜比較矩陣 [matrix.json](matrix.json)（4 列）

## 做了什麼

**本機盤點（2026-10-23 21:24）**：node v24.14.1、npm 11.11.0、pnpm 11.6.0；godot-mono 4.7.2.stable.mono、dotnet 10.0.111；`~/.cache/ms-playwright/` 已有 chromium-1243／1248 與 headless_shell，無系統 chromium（只有 firefox，未用）；`/tmp` tmpfs 可用 30 GB、`/` 可用 495 GB；codex-cli 0.163.0。

派三條 codex 工人（gpt-6-astra，`-s workspace-write`＋`-c sandbox_workspace_write.network_access=true`，`-C` 各自的 `/tmp/lead-techstack-spike/<名>/`）：純 TS 無框架、Svelte 5、Lit 3，規格相同（120×120 DOM 格、200 單位、點格顯示資訊、結束回合全員移動、Playwright headless 量 5 次、node --test＋happy-dom 與 Playwright 兩條斷言）。三條都在 21:31–21:33 交 `DONE`（約 6–8 分鐘），我逐條對過 log 的 5 次值與中位數，並重跑一次 vanilla 量測（66.1／30.9 ms，與原 log 65.8／30.9 一致）。Godot 候選我自己做：GDScript 版同規格（ColorRect 格、Label 單位、`push_input` 模擬真實點擊）與 C# 版純邏輯（離線用本機 nupkg 編譯）。參考 gd_libs 的 headless 慣例（XDG 目錄改到 /tmp、`--headless --path … -s script`），唯讀。

## 產出

| 候選 | 首次渲染中位數 | 一回合更新中位數 | headless 驗證 |
|---|---|---|---|
| 純 TS＋Vite | 65.8 ms | 30.9 ms | node --test＋happy-dom pass；Playwright 2 斷言 pass |
| Lit 3＋Vite | 96.9 ms | 25.0 ms | 同上兩條皆 pass |
| Svelte 5＋Vite | 321.8 ms | 30.7 ms | 同上兩條皆 pass |
| Godot-mono headless | 114.5 ms | 13.8 ms | GDScript 3 PASS、C# CS_PASS |

Godot 實跑指令與輸出（log：`/tmp/lead-techstack-spike/logs/godot-spike.log`）：

```
$ XDG_*=/tmp/lead-techstack-spike/godot/xdg godot-mono --headless --path /tmp/lead-techstack-spike/godot -s res://spike.gd
RENDER_MS [149.825, 113.265, 114.471, 112.94, 114.516] median=114.471
UPDATE_MS [6.925, 13.802, 13.807, 13.802, 13.804] median=13.802
PASS 200 units still present after end_turn
PASS at least one unit moved (moved=200)
PASS click cell -> info 'x=17 y=15 terrain=0 unit=0 hp=8' (got 'x=17 y=15 terrain=0 unit=0 hp=8')
RESULT fails=0        (exit=0)
```

C#（`/tmp/lead-techstack-spike/logs/godot-cs.log`）：`dotnet build` 成功（net10.0；net8.0 因缺 targeting pack 失敗），`godot-mono --headless -s res://CsCheck.cs` 印 `CS_LOGIC_TURN_MS 0.122 moved=200 units=200`、`CS_PASS`、exit 0。

各網頁候選的指令與輸出原文在工人 REPORT：[vanilla](cx-spike-vanilla/REPORT.md)、[svelte](cx-spike-svelte/REPORT.md)、[lit](cx-spike-lit/REPORT.md)；子線交接書同目錄 `cx-spike-*.md`。spike 程式碼與 log 在 `/tmp/lead-techstack-spike/`（總量 556 MB，未過 1.5 GB gate）。

**建議：純 TypeScript＋Vite（無框架）。** 首次渲染最快、依賴最少，遊戲邏輯是純 TS 模組，能在 node 內直接 `node --test` 跑，UI 再用 Playwright headless 驗；對 agent 開發最透明。**備案：Lit 3＋Vite**——渲染慢約 30 ms 但仍在 0.1 秒內，模板宣告式，營運層大量選單時比手寫 DOM 省事；兩者可共用同一個純 TS 邏輯層，切換成本低。Svelte 可用但首次渲染是 3–5 倍；Godot headless 能跑能驗，但 dummy renderer 驗不了畫面、又背離「網頁遊戲」目標，使用者「網頁不好用才改 Godot」的條件沒有觸發。

**怎麼讀這些數字**：一回合更新的終點是兩次 `requestAnimationFrame`，headless chromium 每幀約 16.7 ms，所以 25–31 ms 幾乎都是等幀，網頁三者在更新上**沒有可分辨的差異**，真正的 JS 成本沒拆出來。Godot 的幀不鎖 vsync（每幀約 7 ms），與瀏覽器口徑不可直接比。格子口徑也不完全一致（vanilla／lit 用 24 px div，svelte 用 20 px button）。

## 沒做到或證據不足的

- 沒拆出純 JS 更新耗時（只有含兩幀的端到端值）；網頁三棧的更新差異因此不可判。
- 只測 120×120；更大的地圖（例：300×300＝9 萬個 DOM 節點）沒測，全量 DOM 是否還撐得住、要不要只渲染可視區，證據不足。
- Godot 未測網頁匯出，也沒做 C# 版 UI；headless 下沒有像素可驗。
- 第四個網頁候選（如 Preact／Solid）沒加，交接書允許但非必要。

## 需要決定的事

1. **頂層要拍板**：選純 TS＋Vite（建議）或 Lit（備案）作為網頁棧；兩者都要求「遊戲邏輯是純 TS、與 DOM 分離」，這條建議寫進 spec。
2. 營運層要不要另用 Lit 元件、戰場格仍手寫 DOM（混用可行，但多一種寫法）。
3. 地圖上限若會超過 120×120 很多，spec 前要不要再開一條線測 300×300 與可視區渲染。
4. Playwright 套件得釘在 `1.64.0-beta-1791568591000` 才吃得到本機快取的 chromium-1248；正式專案要不要允許另下載瀏覽器、釘哪個版本。

## 以後交接書該點名的工具

- `codex exec … -c sandbox_workspace_write.network_access=true`：workspace-write 預設斷網，要 npm install 就得寫這條。
- `export npm_config_cache=<線目錄>` 與 `NUGET_PACKAGES`／`DOTNET_CLI_HOME`：讓套件快取留在線目錄，不寫家目錄。
- `godot-mono --headless --path <dir> -s res://<script>.gd`＋XDG 三變數改到 /tmp（沿用 gd_libs）。

## gpt-6-astra 這次觀察到的癖好

三條都在 6–8 分鐘內完成、自報數字與 log 一致、沒有越界寫檔或亂加驗收；會主動去 node_modules 外找版本相容（自己挑出對得上快取瀏覽器的 Playwright beta 版）。REPORT 偏長（100–134 行），量測口徑差異（格子尺寸、元素種類）各線自行決定、沒有對齊——口徑要一致的話交接書得寫死尺寸與元素。
