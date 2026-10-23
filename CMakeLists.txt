# ============================================================================
# 頂層 CMakeLists.txt — mecha-srpg C++ 核心建置入口
#
# 給 scikit-build-core 使用（見 pyproject.toml 的 [build-system]）。
# 僅負責找到 pybind11 並把 cpp/ 子目錄納入；實際模組在 cpp/CMakeLists.txt。
#
# 注意（SPEC §4 / 完成定義 §12）：C++ 為「選用加速」。
# 若環境沒有編譯器或 pybind11，建置 mtcore 會失敗，但純 Python 路線
# （pip install tcod numpy && python -m mecha_srpg）仍可正常執行。
# ============================================================================

cmake_minimum_required(VERSION 3.18)

project(mecha_srpg_native LANGUAGES CXX)

# C++17（SPEC §1）
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 找到當前 Python 的開發元件（scikit-build-core 會提供 Python_EXECUTABLE 等提示）
find_package(Python COMPONENTS Interpreter Development.Module REQUIRED)

# 找到 pybind11（由 build 依賴提供；scikit-build-core 會把其 CMake 設定加入搜尋路徑）
find_package(pybind11 CONFIG REQUIRED)

# 納入 C++ 模組子目錄
add_subdirectory(cpp)
