# conventions — 程式碼慣例（碰原始碼的工作流共用）

[common/README](README.md)｜[INDEX](../../INDEX.md)

碰原始碼的工作流（feature-dev / refactor / investigation）共用這套規矩：**寫碼時要遵守什麼**。哪個檔負責什麼領域、測試在哪 → [code-map](code-map.md)；真相層優先序也在 [code-map](code-map.md)。結構整理原則 → [STRUCTURE](../../STRUCTURE.md)。

## 慣例

| 項目 | 規矩 |
|------|------|
| 檔案拆分 | 模組清單以 [SPEC.md](../../../SPEC.md) §3 為準；新增模組先改 SPEC；單檔超過 400 行照 STRUCTURE 檢視 |
| 命名 | PEP 8：模組／函式 snake_case、類別 PascalCase；C++ 綁定名與 Python 同名 |
| 註解語言 | 沿用既有中文註解；文件繁中 |
| breaking change | 改函式簽名前 `grep -rn '<名稱>' src cpp docs` 找全呼叫端與教學引用，一起改（分歧前例見 INTEGRATION_NOTES） |
| Python／C++ 一致 | 改 `combat.py`／`ai.py` 的 `_py_*` 數學時同步 `cpp/mtcore.cpp`，兩邊結果必須一致（SPEC §4、part9）|
| 相依 | 執行期只依賴 `tcod`、`numpy`；新增套件先問，`pyproject.toml` 與 `requirements.txt` 同步 |
| 純 Python fallback | C++ 永遠選用：`try import mtcore` 失敗時遊戲必須照常可玩（SPEC §12）|
