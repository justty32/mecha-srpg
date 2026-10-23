# PROJECT — 回合制機甲戰旗（Mecha Tactics）

## 衍生目標
做一個**可運行的回合制機甲戰術 SRPG 起手專案 + 分段教學**，作為使用者「回家後丟給 AI agent 接著做」的種子。風格：Front Mission／Into the Breach／BattleTech 式的格狀回合制機甲戰鬥。

## 核心定位（混合架構）
- **Python 為主體**：遊戲流程、狀態機、UI、資料模型、輸入。
- **C++ 為核心熱點**：命中/傷害數學、AI 候選評分、批次視線——以 pybind11 綁回 Python。
- **python-tcod（libtcod）打底**：context/console 渲染、event、FOV、Dijkstra/A* 尋路、noise/heightmap 戰場生成、可重現亂數。
- **漸進可玩**：未編譯 C++ 也能完整遊玩（純 Python fallback）；編譯後熱點自動換成 C++ 加速。

## 參照素材
- 結構參考：RogueBasin「Complete roguelike tutorial using C++ and libtcod」分章法，改編為 SRPG。
- API 依據：[`analysis/python-tcod/`](../../pas/analysis/python-tcod/)（在 pas 工作區、本專案外：world_gen_cookbook、pcg_capabilities、cpp_libtcod_cookbook）。
- 設計契約：本目錄 `SPEC.md`（唯一真實來源）。

## 技術棧
Python 3.10+ / tcod / numpy；C++17 + pybind11 + scikit-build-core + CMake。

## 交付物
- `src/mecha_srpg/`：完整可跑的 Python 遊戲套件（見 SPEC §3）。
- `cpp/`：C++ 核心 `mtcore` + pybind11 綁定（見 SPEC §4）。
- `docs/`：11 章教學（part0–part10，見 SPEC §11）。
- `pyproject.toml` / `CMakeLists.txt` / `requirements.txt`：建置設定。
- `html/`：教學導覽層。

## 完成定義
見 `SPEC.md §12`。

## 狀態
- 2026-06-26 建立：SPEC 契約 + 10 並行代理產出全部教學與起手碼。
