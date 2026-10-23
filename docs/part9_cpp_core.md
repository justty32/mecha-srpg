# Part 9 — 把熱點下沉到 C++（pybind11 + scikit-build）

> 對應原始碼：`cpp/mtcore.cpp`、`cpp/CMakeLists.txt`、`CMakeLists.txt`、`pyproject.toml`；呼叫端 `combat.py`、`ai.py`。
> 前一章：[part8 敵方 AI](part8_ai.md)　·　下一章：[part10 UI 與勝負](part10_ui_winloss.md)

## 本章目標
這是整個專案的**混合架構核心**：把數值密集、無 I/O 的熱點（命中/傷害/AI 評分/批次視線）搬進 C++，用 pybind11 綁回 Python，並保持「沒編 C++ 也能玩」。

## 1. 為什麼是這些函式

| 函式 | 為何是熱點 |
|------|-----------|
| `hit_chance` / `resolve_damage` | 每次攻擊、每個 AI 候選都呼叫，純算術 |
| `score_action` | AI 候選數可達數千／回合，巢狀迴圈 |
| `batch_line_of_fire` | 對多目標一次跑 Bresenham，吃 numpy 緩衝 |

共同點：**沒有物件配置、沒有 I/O，只有算術與陣列掃描**——Python 直譯器在這種迴圈最吃虧，也是 C++ 收益最大的地方。

## 2. 漸進原則：沒編也能跑

`combat.py` / `ai.py` 頂部：
```python
try:
    import mtcore
    _HAS_CORE = True
except ImportError:
    _HAS_CORE = False

def hit_chance(*args):
    return mtcore.hit_chance(*args) if _HAS_CORE else _py_hit_chance(*args)
```
→ 先用純 Python 玩通，要加速再編 C++。**這條 fallback 是整個架構能「先跑起來」的關鍵。**

## 3. mtcore.cpp（pybind11 模組）

```cpp
#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>
#include <pybind11/stl.h>
namespace py = pybind11;

double hit_chance(int accuracy, int pilot_skill, int max_range, int distance,
                  int target_evasion, int cover, int heat_penalty) {
    int base = accuracy + pilot_skill;
    int range_pen = (distance <= max_range) ? 0 : 100;
    double chance = (base - range_pen - cover * 20 - target_evasion - heat_penalty) / 100.0;
    if (chance < 0.05) chance = 0.05;
    if (chance > 0.95) chance = 0.95;
    return chance;            // 必須與 combat._py_hit_chance 逐字一致
}

PYBIND11_MODULE(mtcore, m) {
    m.def("hit_chance", &hit_chance,
          py::arg("accuracy"), py::arg("pilot_skill"), py::arg("max_range"),
          py::arg("distance"), py::arg("target_evasion"), py::arg("cover"),
          py::arg("heat_penalty"), "命中率（0.05~0.95），公式同 SPEC §7");
    // resolve_damage / score_action / batch_line_of_fire 同理 m.def(...)
}
```

### numpy 零拷貝（`batch_line_of_fire`）
```cpp
std::vector<bool> batch_line_of_fire(py::array_t<bool> transparent,
                                     int ox, int oy,
                                     std::vector<std::pair<int,int>> targets) {
    auto buf = transparent.unchecked<2>();   // [H, W] 直接讀，不複製
    // 對每個 target 跑 Bresenham，中途遇不透明 → false
}
```
> 這正是本 repo `analysis/python-tcod/` 反覆強調的「網格即陣列、零拷貝介接」：Python 把 numpy 緩衝直接交給 C 端就地讀，省去複製。pybind11 的 `py::array_t` 之於 numpy，等同 libtcod CFFI 的 `ffi.from_buffer`。

## 4. 建置：scikit-build-core + CMake

`pyproject.toml`（build backend）：
```toml
[build-system]
requires = ["scikit-build-core", "pybind11"]
build-backend = "scikit_build_core.build"
```
`cpp/CMakeLists.txt`：
```cmake
pybind11_add_module(mtcore mtcore.cpp)
target_compile_features(mtcore PRIVATE cxx_std_17)
```
安裝（會編譯）：
```bash
pip install -e .         # Windows 需 MSVC Build Tools；Linux/mac 需 gcc/clang
```
編好後 `python -c "import mtcore; print(mtcore.hit_chance(65,12,6,3,12,1,0))"` 應印出與 Python 版相同的數字。

## 5. 驗證一致性（重要）

```python
from mecha_srpg import combat
import mtcore
args = (65, 12, 6, 3, 12, 1, 0)
assert abs(combat._py_hit_chance(*args) - mtcore.hit_chance(*args)) < 1e-9
```
公式只要有一處不同步，編不編 C++ 就會打出不同結果——把這類斷言放進測試，是混合架構的安全網。

## 6. 效能心法（不要瞎猜數字）
數值密集的純迴圈，C++ 通常比 CPython 快**一個量級以上**，但**實際倍率取決於你的工作負載**。別抄網路上的數字——用 `timeit` 量你自己的 AI 回合：
```python
import timeit
print(timeit.timeit(lambda: ai.HostileAI().take_turn(engine, unit), number=100))
```
先量純 Python，再編 C++ 重量一次，比較同一場景。**先讓它正確，再讓它快。**

## 本章完成後你應該能…
- 用 pybind11 + scikit-build 把一個 C++ 函式綁成可 `import` 的模組。
- 用 numpy 緩衝在 Python↔C++ 間零拷貝傳大陣列。
- 維持 Python/C++ 雙實作一致，並用斷言驗證。

下一章 → [part10 UI 與勝負](part10_ui_winloss.md)
