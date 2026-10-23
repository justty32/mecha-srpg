# code-map — 程式碼導航 index（哪個檔負責什麼）

[common/README](README.md)｜[INDEX](../../INDEX.md)

碰原始碼前先查這張表，只讀相關領域列出的檔；動完再照維護鏈把表更新回去。寫碼慣例本身在 [conventions](conventions.md)。

## 領域表

| 領域 | 檔案 | 職責 | 測試在哪 |
|------|------|------|---------|
| 入口／狀態機／UI | `src/mecha_srpg/{main,__main__,engine,game_states,input_handlers,ui}.py` | 主迴圈、狀態切換、輸入、渲染 | 無（尚未建測試）|
| 回合與行動 | `src/mecha_srpg/{turn_manager,actions,movement}.py` | 回合／AP、行動物件、可達格與尋路 | 無 |
| 戰鬥與視野 | `src/mecha_srpg/{combat,fov}.py` | 命中／傷害／熱量、FOV、視線、掩體 | 無 |
| 敵方 AI | `src/mecha_srpg/ai.py` | 候選行動評分與選擇 | 無 |
| 資料與生成 | `src/mecha_srpg/{entity,components,config,battlefield,procgen,rng}.py` | 單位、常數、戰場格、地圖生成、可重現亂數 | 無 |
| C++ 熱點 | `cpp/*`、`CMakeLists.txt`、`pyproject.toml` | `mtcore` 加速 combat／ai 數學 | 無 |

## 真相層優先序

各專案可以改自己的優先序，但必須明確。預設：

```text
code/tests > SPEC.md > code map > docs（教學）> generated
```

- 上層與下層衝突時，**以上層為準並修正下層**。
- generated（產生出來的檔、html）永遠不是唯一真相。
- 原始來源與摘要衝突時，以**原始來源**為準。
- code map 是**導航不是規格**；行為以 code/tests 為準。

## 維護鏈：程式碼 > code map > 文檔

**優先級**（衝突或時間不夠時，依序保持一致）：程式碼 > code map > 文檔。
**code map 與程式碼衝突時以程式碼為準，立刻改 code map。**

1. **修改前**：先讀本表找到相關領域，只讀清單裡的檔——不讀無關領域的檔。
2. **修改後**：新增／刪除了原始碼檔案，或某檔職責顯著改變，必須同步更新本表。
3. 原始碼裡**不加**「對應 code map」的註釋（維護成本過高）；反向查找直接 grep 本檔。
4. 迭代期間本表可暫時落後，**commit 前必須對齊**（見 [feature-dev](../feature-dev/README.md)）。
