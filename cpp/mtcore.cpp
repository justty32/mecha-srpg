// ============================================================================
// mtcore.cpp — 機甲戰棋 C++ 核心熱點模組（pybind11 綁定）
//
// 用途（對應教學 part9_cpp_core）：
//   把命中／傷害數學、AI 候選評分、批次視線（Bresenham）這些「熱點」下沉到
//   C++，透過 pybind11 綁回 Python。Python 端（combat.py / ai.py / fov.py）以
//       try: import mtcore
//       except ImportError: 使用 combat._py_* 純 Python fallback
//   的方式漸進使用；**本模組的數值結果必須與 Python fallback 完全一致**
//   （SPEC §7 為鐵則）。
//
// 座標慣例（SPEC §2，鐵則）：
//   - 邏輯座標 (x, y)，x=橫、y=縱，原點左上。
//   - numpy 陣列一律 [y, x]（row-major / C-contiguous）。本檔的
//     batch_line_of_fire 直接以 row-major 讀取 transparent[y][x]，零拷貝。
//
// ----------------------------------------------------------------------------
// 採用的最終函式簽名（與 Python fallback 對齊的鐵則約定）
// ----------------------------------------------------------------------------
// 1) hit_chance(int accuracy, int pilot_skill,
//               int min_range, int max_range, int distance,
//               int target_evasion, int cover, int heat_penalty) -> double
//
//    與 SPEC §4 的微調說明：
//    SPEC §4 原型把射程寫成單一 weapon_range，但 §7 公式的射程判定需要
//    「min_range <= distance <= max_range」兩個邊界，故依專案指示把射程拆成
//    min_range / max_range 兩個參數（多出一個參數）。Python 端 combat._py_hit_chance
//    亦採用相同的 (accuracy, pilot_skill, min_range, max_range, distance,
//    target_evasion, cover, heat_penalty) 簽名，兩者一致。
//
// 2) resolve_damage(int weapon_damage, int target_armor, bool is_rear) -> int
//
//    與 SPEC §4 的微調說明：
//    SPEC §4 原型為 resolve_damage(weapon_damage, target_armor, is_rear, roll)，
//    但 §7 的命中判定流程是「先 hit_chance → rng.random() 比較 → 命中才結算傷害」。
//    為了讓亂數（rng）完全留在 Python 端（可重現、單一亂數源），這裡選定
//    **resolve_damage 只負責計算傷害數值，命中判定留給 Python**，故移除 roll 參數。
//    傷害公式（SPEC §7）：
//        dmg = max(0, weapon_damage - target_armor)
//        若 is_rear： dmg = int(dmg * REAR_MULT)   // REAR_MULT = 1.5
//    Python combat._py_resolve_damage 採用相同三參數簽名與相同公式。
//
// 3) score_action(int my_hp, int target_hp, double expected_dmg, double hit,
//                 int dist_after, int cover_after, bool in_range) -> double
//    AI 對「移動到某格並攻擊某目標」的候選評分（越高越好）。
//
// 4) batch_line_of_fire(numpy.ndarray[bool, (H,W)] transparent,
//                        int ox, int oy,
//                        list[(int,int)] targets) -> list[bool]
//    對每個目標跑 Bresenham 視線；中途遇到不透明格即為 false。
// ============================================================================

#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>
#include <pybind11/stl.h>

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <utility>
#include <vector>

namespace py = pybind11;

// ----------------------------------------------------------------------------
// SPEC §7 平衡常數（鐵則；務必與 config.py 同值）
// ----------------------------------------------------------------------------
namespace {
constexpr double HIT_CHANCE_MIN = 0.05;        // 命中率下限
constexpr double HIT_CHANCE_MAX = 0.95;        // 命中率上限
constexpr int    COVER_PENALTY_PER_LEVEL = 20; // 每級掩體 -20（百分點）
constexpr int    RANGE_PENALTY = 100;          // 超出射程懲罰
constexpr double REAR_MULT = 1.5;              // 背後攻擊倍率
}  // namespace

// ----------------------------------------------------------------------------
// hit_chance — 命中率（SPEC §7 公式，clamp 到 [0.05, 0.95]）
// ----------------------------------------------------------------------------
//   base        = accuracy + pilot_skill
//   range_pen   = 0 若 min_range <= distance <= max_range，否則 100
//   cover_pen   = cover * 20
//   evasion_pen = target_evasion
//   heat_pen    = heat_penalty
//   chance = (base - range_pen - cover_pen - evasion_pen - heat_pen) / 100
//   回傳 clamp(chance, 0.05, 0.95)
static double hit_chance(int accuracy, int pilot_skill,
                         int min_range, int max_range, int distance,
                         int target_evasion, int cover, int heat_penalty) {
    const int base = accuracy + pilot_skill;
    // 射程判定：落在 [min_range, max_range] 內才不受射程懲罰
    const int range_pen =
        (distance >= min_range && distance <= max_range) ? 0 : RANGE_PENALTY;
    const int cover_pen = cover * COVER_PENALTY_PER_LEVEL;
    const int evasion_pen = target_evasion;
    const int heat_pen = heat_penalty;

    const double chance =
        static_cast<double>(base - range_pen - cover_pen - evasion_pen - heat_pen) / 100.0;

    // clamp 到 [0.05, 0.95]
    return std::min(HIT_CHANCE_MAX, std::max(HIT_CHANCE_MIN, chance));
}

// ----------------------------------------------------------------------------
// resolve_damage — 結構傷害（SPEC §7；只算數值，命中判定留 Python）
// ----------------------------------------------------------------------------
//   dmg = max(0, weapon_damage - target_armor)
//   若 is_rear： dmg = int(dmg * 1.5)
static int resolve_damage(int weapon_damage, int target_armor, bool is_rear) {
    int dmg = weapon_damage - target_armor;
    if (dmg < 0) dmg = 0;
    if (is_rear) {
        // 與 Python int(dmg * 1.5) 一致（向零截斷；dmg>=0 故等同向下取整）
        dmg = static_cast<int>(static_cast<double>(dmg) * REAR_MULT);
    }
    return dmg;
}

// ----------------------------------------------------------------------------
// score_action — AI 候選評分（SPEC §4，越高越好）
// ----------------------------------------------------------------------------
// 評分啟發式（與 Python combat/ai fallback 對齊）：
//   - 期望傷害佔比：expected_dmg 對目標血量的相對貢獻（越能造成傷害越好）。
//   - 擊殺加成：若期望傷害足以擊殺目標，給大額加成。
//   - 命中率：高命中率優先。
//   - 趨近：愈靠近目標愈好（dist_after 越小越好），用負權重。
//   - 掩體：移動後自身所在掩體越高越安全（cover_after 加分）。
//   - 不在射程：若 in_range 為 false，攻擊無效，傷害相關分數歸零，僅保留趨近項。
static double score_action(int my_hp, int target_hp, double expected_dmg,
                           double hit, int dist_after, int cover_after,
                           bool in_range) {
    (void)my_hp;  // 目前評分未直接使用自身血量，保留參數以符合 SPEC §4 簽名

    double score = 0.0;

    if (in_range && target_hp > 0) {
        // 期望有效傷害（命中率 × 期望傷害）
        const double effective_dmg = hit * expected_dmg;

        // 傷害貢獻（相對目標血量，封頂 1.0）
        double dmg_ratio = effective_dmg / static_cast<double>(target_hp);
        if (dmg_ratio > 1.0) dmg_ratio = 1.0;
        score += dmg_ratio * 100.0;

        // 擊殺加成：期望傷害足以擊殺
        if (expected_dmg >= static_cast<double>(target_hp)) {
            score += 50.0;
        }

        // 命中率本身的偏好
        score += hit * 20.0;
    }

    // 趨近：距離越近越好（負權重）
    score -= static_cast<double>(dist_after) * 2.0;

    // 掩體：移動後自身掩體越高越安全
    score += static_cast<double>(cover_after) * 10.0;

    return score;
}

// ----------------------------------------------------------------------------
// batch_line_of_fire — 批次視線查詢（Bresenham；row-major 零拷貝讀取）
// ----------------------------------------------------------------------------
// transparent: numpy bool 陣列，形狀 [H, W]（[y, x]，C-contiguous）。
//              True = 透光（可穿越視線）；False = 不透明（阻擋）。
// (ox, oy)   : 視線起點（射手）座標。
// targets    : 目標 (x, y) 清單。
// 回傳        : 與 targets 等長的 bool 清單；true = 起點到該目標之間視線無阻。
//
// 規則（與 tcod.los / Python fallback 對齊）：
//   沿 Bresenham 連線逐格檢查；**不檢查起點**，檢查中間每一格與終點；
//   只要中途任一格不透明（含目標格本身不透明）即視為被阻擋 → false。
//   超出邊界的目標一律 false。
static std::vector<bool> batch_line_of_fire(
    py::array_t<bool, py::array::c_style | py::array::forcecast> transparent,
    int ox, int oy,
    const std::vector<std::pair<int, int>>& targets) {

    // 取得 buffer 資訊並驗證為 2D [H, W]
    py::buffer_info info = transparent.request();
    if (info.ndim != 2) {
        throw std::runtime_error("batch_line_of_fire: transparent 必須是 2D [H, W] 陣列");
    }
    const ssize_t H = info.shape[0];
    const ssize_t W = info.shape[1];

    // 零拷貝原始指標（c_style 保證 row-major 連續）
    const bool* data = static_cast<const bool*>(info.ptr);

    // 邊界與透明度查詢小工具
    auto in_bounds = [&](int x, int y) -> bool {
        return x >= 0 && x < static_cast<int>(W) && y >= 0 && y < static_cast<int>(H);
    };
    auto is_transparent = [&](int x, int y) -> bool {
        // row-major：index = y * W + x
        return data[static_cast<ssize_t>(y) * W + x];
    };

    std::vector<bool> result;
    result.reserve(targets.size());

    for (const auto& t : targets) {
        const int tx = t.first;
        const int ty = t.second;

        // 目標出界 → 無視線
        if (!in_bounds(tx, ty)) {
            result.push_back(false);
            continue;
        }

        // Bresenham 由 (ox, oy) 走到 (tx, ty)
        int x0 = ox, y0 = oy;
        const int dx = std::abs(tx - x0);
        const int dy = std::abs(ty - y0);
        const int sx = (x0 < tx) ? 1 : -1;
        const int sy = (y0 < ty) ? 1 : -1;
        int err = dx - dy;

        bool visible = true;
        while (true) {
            if (x0 == tx && y0 == ty) {
                break;  // 到達終點（終點透明度已在上一步檢查）
            }
            const int e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
            // 走到的這一格（中間格或終點格）若不透明 → 阻擋
            if (!in_bounds(x0, y0) || !is_transparent(x0, y0)) {
                // 終點格不透明也視為無法瞄準（與 fallback 一致）
                visible = false;
                break;
            }
        }
        result.push_back(visible);
    }

    return result;
}

// ----------------------------------------------------------------------------
// PYBIND11 模組定義
// ----------------------------------------------------------------------------
PYBIND11_MODULE(mtcore, m) {
    m.doc() = "mecha-srpg C++ 核心熱點模組（命中／傷害／AI 評分／批次視線）。"
              "數值與 Python fallback（combat._py_*）完全一致，見 SPEC §7。";

    m.def("hit_chance", &hit_chance,
          py::arg("accuracy"), py::arg("pilot_skill"),
          py::arg("min_range"), py::arg("max_range"), py::arg("distance"),
          py::arg("target_evasion"), py::arg("cover"), py::arg("heat_penalty"),
          "計算命中率（SPEC §7）。base=accuracy+pilot_skill；射程外扣 100；"
          "掩體每級 -20；再扣 evasion 與 heat_penalty；除以 100 後 clamp 到 "
          "[0.05, 0.95]。回傳 0.0–1.0 的命中機率。"
          "（射程拆成 min_range/max_range，較 SPEC §4 原型多一參數。）");

    m.def("resolve_damage", &resolve_damage,
          py::arg("weapon_damage"), py::arg("target_armor"), py::arg("is_rear"),
          "計算實際結構傷害（SPEC §7）：dmg=max(0, weapon_damage-target_armor)；"
          "背後攻擊（is_rear）時 dmg=int(dmg*1.5)。回傳 >=0 的整數。"
          "命中判定由 Python 端以 rng.random()<hit_chance 決定，本函式不含亂數。");

    m.def("score_action", &score_action,
          py::arg("my_hp"), py::arg("target_hp"), py::arg("expected_dmg"),
          py::arg("hit"), py::arg("dist_after"), py::arg("cover_after"),
          py::arg("in_range"),
          "AI 對『移動到某格並攻擊某目標』的候選評分（SPEC §4，越高越好）。"
          "綜合期望有效傷害、擊殺加成、命中率、趨近距離與移動後掩體。");

    m.def("batch_line_of_fire", &batch_line_of_fire,
          py::arg("transparent"), py::arg("ox"), py::arg("oy"), py::arg("targets"),
          "批次視線查詢（Bresenham）。transparent 為 [H,W] 的 bool 陣列"
          "（row-major，True=透光），對每個目標 (x,y) 沿連線逐格檢查中間格與"
          "終點格，遇不透明即 false。回傳與 targets 等長的 bool 清單。");
}
