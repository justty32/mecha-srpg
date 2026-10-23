# ============================================================================
# cpp/CMakeLists.txt — 用 pybind11 建置 C++ 核心模組 mtcore（SPEC §4）
#
# 由頂層 CMakeLists.txt 透過 add_subdirectory(cpp) 引入。
# 由 scikit-build-core 在 `pip install -e .` 時驅動 CMake 編譯。
# ============================================================================

# 透過 pybind11 提供的 helper 建立 Python 擴充模組。
# 產出名稱必須與 PYBIND11_MODULE(mtcore, m) 一致：mtcore
pybind11_add_module(mtcore mtcore.cpp)

# 使用 C++17（SPEC §1）
target_compile_features(mtcore PRIVATE cxx_std_17)

# 安裝到 Python 套件內，讓 `import mtcore` 可直接找到。
# scikit-build-core 預設 wheel.install-dir 為套件根；此處安裝到 mecha_srpg 套件目錄。
install(TARGETS mtcore LIBRARY DESTINATION mecha_srpg)
