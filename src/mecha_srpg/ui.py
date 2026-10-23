"""ui.py — HUD、游標 Cursor、單位資訊面板、移動/射程高亮工具（SPEC §8）。

用途：提供呈現層工具。包含：
- Cursor：地圖內可移動且自動 clamp 的游標。
- 高亮工具：以 console 背景色疊加移動範圍（藍）／射程（紅）／游標框（黃），
  不使用任何 ASCII 框線字元（SPEC §7 / §10 鐵則）。
- draw_hud / draw_unit_panel / draw_message_log：右側與底部 HUD。

對應教學 part：part3_units（游標選取）、part10_ui_winloss（HUD、訊息日誌）。

座標慣例（SPEC §2）：邏輯 (x, y)，原點左上。本檔以 console "F" order 為前提，
即 console.rgb[x, y] / console.bg[x, y]（與 main.py 建立 Console(order="F") 一致）。

關鍵 tcod API：
- console.print(x, y, text, fg=..., bg=...)：印字串
- console.bg[x, y] = (r, g, b)：直接寫背景色（order="F" 時索引為 [x, y]）
- console.draw_rect(x, y, w, h, ch, fg, bg)：填一塊矩形
- console.draw_frame(...) 不用（SPEC 禁框線；我們以底色色塊取代）
"""

from __future__ import annotations

from typing import Dict, Iterable, Optional, Tuple, TYPE_CHECKING

import tcod.console

from . import config

if TYPE_CHECKING:  # 僅型別提示，避免執行期循環匯入
    from .engine import Engine


# ---------------------------------------------------------------------------
# 游標
# ---------------------------------------------------------------------------
class Cursor:
    """地圖游標：以 (x, y) 表示，移動後 clamp 在 [0, MAP_W/H) 內（SPEC §8）。"""

    def __init__(self, x: int = 0, y: int = 0, map_w: int = config.MAP_W, map_h: int = config.MAP_H) -> None:
        self.map_w = map_w
        self.map_h = map_h
        self.x = self._clamp(x, 0, map_w - 1)
        self.y = self._clamp(y, 0, map_h - 1)

    @staticmethod
    def _clamp(v: int, lo: int, hi: int) -> int:
        """把 v 夾擠到 [lo, hi]。"""
        return lo if v < lo else hi if v > hi else v

    def move(self, dx: int, dy: int) -> None:
        """以 (dx, dy) 位移游標，超出地圖邊界時停在邊界（SPEC §8）。"""
        self.x = self._clamp(self.x + dx, 0, self.map_w - 1)
        self.y = self._clamp(self.y + dy, 0, self.map_h - 1)

    def set(self, x: int, y: int) -> None:
        """直接定位游標到 (x, y)（同樣 clamp）。"""
        self.x = self._clamp(x, 0, self.map_w - 1)
        self.y = self._clamp(y, 0, self.map_h - 1)

    @property
    def pos(self) -> Tuple[int, int]:
        return (self.x, self.y)


# ---------------------------------------------------------------------------
# 安全屬性存取（其他模組的 MechUnit 由別的 agent 依 SPEC §5 實作；
# 這裡以 getattr 容錯，確保即使欄位名小有出入仍能呈現而不崩潰）
# ---------------------------------------------------------------------------
def _g(obj: object, *names: str, default=None):
    """依序嘗試多個屬性名，回傳第一個存在者；皆無則回 default。"""
    for n in names:
        if hasattr(obj, n):
            return getattr(obj, n)
    return default


def _unit_structure(unit) -> Tuple[int, int]:
    """回傳 (目前結構, 最大結構)。"""
    cur = _g(unit, "structure", default=0)
    stats = _g(unit, "stats", default=None)
    mx = _g(stats, "max_structure", default=cur) if stats is not None else cur
    return int(cur), int(mx)


def _unit_heat(unit) -> Tuple[int, int]:
    """回傳 (目前熱量, 最大熱量)。"""
    heat = int(_g(unit, "heat", default=0))
    stats = _g(unit, "stats", default=None)
    mx = int(_g(stats, "max_heat", default=100)) if stats is not None else 100
    return heat, mx


# ---------------------------------------------------------------------------
# 高亮工具（皆以 console 背景色疊加，不用框線字元）
# ---------------------------------------------------------------------------
def highlight_cells(
    console: tcod.console.Console,
    cells: Iterable[Tuple[int, int]],
    color: Tuple[int, int, int],
    map_origin: Tuple[int, int] = (0, 0),
) -> None:
    """在指定格集合疊上背景色（移動範圍藍、射程紅等）。

    console 採 "F" order，故索引為 [x, y]（SPEC §2 + main.py 設定）。
    """
    ox, oy = map_origin
    bg = console.bg  # numpy 視圖：order="F" → [x, y, channel]
    w = console.width
    h = console.height
    for (cx, cy) in cells:
        sx, sy = cx + ox, cy + oy
        if 0 <= sx < w and 0 <= sy < h:
            bg[sx, sy] = color


def draw_cursor(
    console: tcod.console.Console,
    cursor: Cursor,
    map_origin: Tuple[int, int] = (0, 0),
    color: Tuple[int, int, int] = config.COLOR_CURSOR,
) -> None:
    """畫游標：以黃色背景塊標示目前格（取代框線，SPEC §8）。"""
    ox, oy = map_origin
    sx, sy = cursor.x + ox, cursor.y + oy
    if 0 <= sx < console.width and 0 <= sy < console.height:
        console.bg[sx, sy] = color
        # 為了讓字元在黃底上仍清楚，前景轉深色
        console.fg[sx, sy] = config.BLACK


# ---------------------------------------------------------------------------
# HUD 子面板
# ---------------------------------------------------------------------------
def draw_message_log(
    console: tcod.console.Console,
    messages: Iterable[str],
    x: int,
    y: int,
    width: int,
    height: int,
) -> None:
    """在底部畫訊息日誌（最後 height 行）。"""
    msgs = list(messages)[-height:]
    for i, text in enumerate(msgs):
        # 截斷過長訊息以免溢出
        line = text if len(text) <= width else text[: width - 1] + "…"
        console.print(x, y + i, line, fg=config.GREY)


def draw_unit_panel(
    console: tcod.console.Console,
    unit,
    x: int,
    y: int,
    width: int,
    engine: "Optional[Engine]" = None,
) -> int:
    """畫單一單位資訊（結構 / AP / 熱量 / 武器 / 命中預估），回傳下一個可用 y。

    命中預估：若 engine 提供游標所指目標，嘗試呼叫 combat 估算（容錯）。
    """
    if unit is None:
        console.print(x, y, "（未選取單位）", fg=config.GREY)
        return y + 1

    name = str(_g(unit, "name", default="機甲"))
    faction = _g(unit, "faction", default=None)
    is_player = faction == config.Faction.PLAYER
    head_color = config.COLOR_PLAYER if is_player else config.COLOR_ENEMY

    cur_s, max_s = _unit_structure(unit)
    heat, max_heat = _unit_heat(unit)
    ap = int(_g(unit, "ap", default=0))

    cy = y
    console.print(x, cy, name, fg=head_color); cy += 1
    console.print(x, cy, f"結構 {cur_s}/{max_s}", fg=config.GREEN if cur_s > max_s // 3 else config.RED); cy += 1
    # 熱量：接近上限轉橙紅
    heat_color = config.ORANGE if heat >= max_heat else config.CYAN
    console.print(x, cy, f"熱量 {heat}/{max_heat}", fg=heat_color); cy += 1
    console.print(x, cy, f"AP   {ap}/{config.AP_PER_TURN}", fg=config.WHITE); cy += 1

    # 武器列表
    weapons = _g(unit, "weapons", default=[]) or []
    if weapons:
        console.print(x, cy, "武器：", fg=config.WHITE); cy += 1
        for w in weapons:
            wname = str(_g(w, "name", default="武器"))
            dmg = _g(w, "damage", default="?")
            rmin = _g(w, "min_range", default="?")
            rmax = _g(w, "max_range", default="?")
            console.print(x + 1, cy, f"{wname} D{dmg} R{rmin}-{rmax}", fg=config.GREY)
            cy += 1

    return cy


# ---------------------------------------------------------------------------
# 完整 HUD
# ---------------------------------------------------------------------------
def draw_hud(console: tcod.console.Console, engine: "Engine") -> None:
    """畫整個 HUD：右側單位資訊欄 + 底部訊息日誌 + 回合/階段/操作提示（SPEC §8）。

    版面：戰場佔左上 MAP_W×MAP_H；右側 (MAP_W..SCREEN_W) 為資訊欄；
    底部 (MAP_H..SCREEN_H) 為訊息與提示列。
    """
    panel_x = config.MAP_W + 1
    panel_w = config.SCREEN_W - panel_x

    # 右側資訊欄底色（以 draw_rect 填色塊，不畫框線）
    # tcod.console.Console.draw_rect(x, y, width, height, ch, fg, bg)
    console.draw_rect(config.MAP_W, 0, config.SCREEN_W - config.MAP_W, config.MAP_H, ord(" "), bg=config.COLOR_HUD_BG)

    # --- 回合與階段 ---
    tm = getattr(engine, "turn_manager", None)
    turn_no = _g(tm, "turn", "turn_count", "round", default=1) if tm else 1
    phase = _phase_label(engine)
    cy = 1
    console.print(panel_x, cy, f"回合 {turn_no}", fg=config.YELLOW); cy += 1
    console.print(panel_x, cy, f"階段：{phase}", fg=config.WHITE); cy += 2

    # --- 目前選取／游標所指單位資訊 ---
    panel_unit = engine.selected_unit or engine.unit_at(engine.cursor.x, engine.cursor.y)
    cy = draw_unit_panel(console, panel_unit, panel_x, cy, panel_w, engine)
    cy += 1

    # --- 命中預估（攻擊模式下，游標若指向敵方） ---
    hint = getattr(engine, "hit_preview", None)
    if hint is not None:
        console.print(panel_x, cy, f"命中預估：{hint}", fg=config.ORANGE); cy += 2

    # --- 操作提示 ---
    cy = max(cy, config.MAP_H - 8)
    console.print(panel_x, cy, "操作：", fg=config.WHITE); cy += 1
    for line in (
        "方向/WASD 移游標",
        "Enter 選取/確認",
        "M 移動  F 攻擊",
        "Space 待命  Tab 換單位",
        "E 結束回合  Esc 取消",
    ):
        console.print(panel_x, cy, line, fg=config.GREY); cy += 1

    # --- 底部訊息日誌 ---
    log_y = config.MAP_H
    console.draw_rect(0, log_y, config.SCREEN_W, config.SCREEN_H - log_y, ord(" "), bg=config.BLACK)
    draw_message_log(
        console,
        getattr(engine, "message_log", []),
        x=1,
        y=log_y + 1,
        width=config.SCREEN_W - 2,
        height=config.SCREEN_H - log_y - 1,
    )


def _phase_label(engine: "Engine") -> str:
    """依目前 state 類別名給出中文階段標籤。"""
    state_name = type(getattr(engine, "state", None)).__name__
    return {
        "DeployState": "部署",
        "PlayerTurnState": "我方行動",
        "EnemyTurnState": "敵方行動",
        "GameOverState": "結束",
    }.get(state_name, state_name)
