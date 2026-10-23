"""engine.py — Engine：持有全域狀態、驅動 render 與事件分派（SPEC §9）。

用途：遊戲的中樞物件。持有 battlefield、units、turn_manager、目前 state、
cursor、message_log、selected_unit、visible（可見性陣列）。
- render(console)：畫地形（背景色 + char）、可見性/迷霧（已探索變暗）、
  移動範圍藍底 / 射程紅底高亮、單位、游標黃框，最後呼叫 ui.draw_hud。
- handle_event(event)：委派給目前 state。
- add_message(text)：追加訊息到日誌。

對應教學 part：part1（主迴圈骨架）、part5（移動高亮）、part6（FOV/迷霧）、
part10（HUD 整合）。

座標慣例（SPEC §2）：邏輯 (x, y)；numpy 陣列 [y, x]。
本檔以 console "F" order 為前提（main.py 建立 Console(order="F")），
故寫 console 像素時用 console.ch/fg/bg[x, y]；讀 numpy 地圖/可見性時用 [y, x]。

關鍵 tcod API：
- console.ch / console.fg / console.bg：numpy 視圖（order="F" → [x, y]）
- console.print(x, y, text, fg, bg)
- tcod.event：事件型別
"""

from __future__ import annotations

from typing import Dict, List, Optional, Set, Tuple, TYPE_CHECKING

import numpy as np
import tcod.console
import tcod.event

from . import config, ui
from .input_handlers import dispatch
from .ui import Cursor

if TYPE_CHECKING:
    from .game_states import GameState


# 已探索但目前不可見的格，前景/背景變暗的衰減比例
_FOG_DIM = 0.45


def _dim(color: Tuple[int, int, int], factor: float = _FOG_DIM) -> Tuple[int, int, int]:
    """把 RGB 依比例變暗（迷霧中已探索格用）。"""
    return (int(color[0] * factor), int(color[1] * factor), int(color[2] * factor))


class Engine:
    """遊戲引擎：全域狀態容器與 render/event 驅動者（SPEC §9）。"""

    def __init__(self) -> None:
        # 戰場與單位（由 DeployState.on_enter 經 procgen 填入）
        self.battlefield = None
        self.units: List = []
        self.turn_manager = None

        # 互動狀態
        self.cursor: Cursor = Cursor(config.MAP_W // 2, config.MAP_H // 2)
        self.selected_unit = None
        self.message_log: List[str] = []

        # 可見性（[y, x] bool）與已探索（持久）。在 battlefield 就緒前為 None。
        self.visible: Optional[np.ndarray] = None
        self.explored: Optional[np.ndarray] = None

        # 高亮集合（由 PlayerTurnState 在移動/攻擊模式設定）
        self.move_highlight: Set[Tuple[int, int]] = set()
        self.attack_highlight: Set[Tuple[int, int]] = set()

        # 命中預估字串（攻擊模式時由 state 設定，HUD 顯示）
        self.hit_preview: Optional[str] = None

        # 目前狀態機狀態。延後匯入避免循環依賴。
        from .game_states import DeployState
        self.state: "GameState" = DeployState(self)
        # 進入初始狀態
        self._enter_state(self.state)

    # ------------------------------------------------------------------
    # 狀態切換
    # ------------------------------------------------------------------
    def _enter_state(self, state: "GameState") -> None:
        """呼叫 state.on_enter（若有）。"""
        on_enter = getattr(state, "on_enter", None)
        if callable(on_enter):
            on_enter()

    def change_state(self, state: "GameState") -> None:
        """切換到新狀態並觸發其 on_enter（SPEC §9：engine.state = NewState(engine)）。"""
        self.state = state
        self._enter_state(state)

    # ------------------------------------------------------------------
    # 訊息日誌
    # ------------------------------------------------------------------
    def add_message(self, text: str) -> None:
        """追加一則訊息（日誌保留最後 200 行即可）。"""
        self.message_log.append(text)
        if len(self.message_log) > 200:
            del self.message_log[:-200]

    # ------------------------------------------------------------------
    # 查詢工具
    # ------------------------------------------------------------------
    def unit_at(self, x: int, y: int):
        """回傳位於 (x, y) 的存活單位，否則 None。"""
        for u in self.units:
            if getattr(u, "x", None) == x and getattr(u, "y", None) == y and self._alive(u):
                return u
        return None

    @staticmethod
    def _alive(unit) -> bool:
        """容錯判定單位存活（SPEC §5：alive 屬性 = structure > 0）。"""
        a = getattr(unit, "alive", None)
        if a is not None:
            return bool(a)
        return int(getattr(unit, "structure", 0)) > 0

    def player_units(self) -> List:
        return [u for u in self.units if getattr(u, "faction", None) == config.Faction.PLAYER and self._alive(u)]

    def enemy_units(self) -> List:
        return [u for u in self.units if getattr(u, "faction", None) == config.Faction.ENEMY and self._alive(u)]

    # ------------------------------------------------------------------
    # 事件
    # ------------------------------------------------------------------
    def handle_event(self, event: tcod.event.Event) -> None:
        """把事件轉成語意指令後委派給目前 state（SPEC §9）。

        state.handle_event 接收解讀後的 InputAction（None 表示不關心）。
        Quit 指令在此統一處理（拋出 SystemExit 結束主迴圈）。
        """
        action = dispatch(event)
        if action is None:
            return
        from .input_handlers import Command
        if action.command == Command.QUIT:
            raise SystemExit()
        # 委派給目前狀態
        handler = getattr(self.state, "handle_event", None)
        if callable(handler):
            handler(action)

    # ------------------------------------------------------------------
    # 可見性
    # ------------------------------------------------------------------
    def recompute_fov(self, ox: int, oy: int, radius: int = 12) -> None:
        """以 (ox, oy) 為視點重算可見性，並累積到 explored（容錯呼叫 fov 模組）。"""
        if self.battlefield is None:
            return
        try:
            from . import fov  # 由其他 agent 依 SPEC §3 提供
            vis = fov.compute_visible(self.battlefield, ox, oy, radius)
            self.visible = np.asarray(vis, dtype=bool)
        except Exception:
            # fov 模組不可用時：退化為「全部可見」，確保仍能呈現
            self.visible = self._full_visible()
        if self.visible is not None:
            if self.explored is None:
                self.explored = np.zeros_like(self.visible)
            self.explored |= self.visible

    def _map_shape(self) -> Tuple[int, int]:
        """回傳 (H, W)。"""
        bf = self.battlefield
        h = getattr(bf, "height", None) or config.MAP_H
        w = getattr(bf, "width", None) or config.MAP_W
        return int(h), int(w)

    def _full_visible(self) -> np.ndarray:
        h, w = self._map_shape()
        return np.ones((h, w), dtype=bool)

    # ------------------------------------------------------------------
    # 渲染
    # ------------------------------------------------------------------
    def render(self, console: tcod.console.Console) -> None:
        """繪製整個畫面（SPEC §9 render 契約）。

        順序：地形 → 迷霧處理（已探索變暗、未探索黑） → 高亮（移動藍/射程紅）
        → 單位 → 游標黃框 → HUD。
        """
        if self.battlefield is not None:
            self._render_terrain(console)
            self._render_highlights(console)
            self._render_units(console)

        # 游標黃框（以背景色塊取代框線）
        ui.draw_cursor(console, self.cursor)

        # HUD（右側資訊欄 + 底部訊息）
        ui.draw_hud(console, self)

    def _render_terrain(self, console: tcod.console.Console) -> None:
        """畫地形：每格用地形 char + 前景色，背景為前景的暗化版作底色。"""
        bf = self.battlefield
        tiles = self._tiles_array()
        if tiles is None:
            return
        h, w = tiles.shape
        vis = self.visible
        explored = self.explored
        for y in range(min(h, config.MAP_H)):
            for x in range(min(w, config.MAP_W)):
                # 可見性處理
                is_visible = True if vis is None else bool(vis[y, x])
                is_explored = True if explored is None else bool(explored[y, x])
                if not is_explored and not is_visible:
                    # 未探索：保持黑（console.clear 已是黑底），不畫
                    console.ch[x, y] = ord(" ")
                    console.bg[x, y] = config.BLACK
                    continue

                tile = config.get_tile(int(tiles[y, x]))
                fg = tile.color
                bg = _dim(tile.color, 0.30)  # 地形底色（暗化前景）
                if not is_visible:
                    # 已探索但目前不可見：整體變暗（迷霧）
                    fg = _dim(fg)
                    bg = _dim(bg)
                # 寫入 console（order="F" → [x, y]）
                console.ch[x, y] = ord(tile.char[0]) if tile.char else ord(" ")
                console.fg[x, y] = fg
                console.bg[x, y] = bg

    def _render_highlights(self, console: tcod.console.Console) -> None:
        """疊加移動範圍（藍）與射程（紅）背景色（SPEC §8）。"""
        if self.move_highlight:
            ui.highlight_cells(console, self.move_highlight, config.COLOR_MOVE_RANGE)
        if self.attack_highlight:
            ui.highlight_cells(console, self.attack_highlight, config.COLOR_ATTACK_RANGE)

    def _render_units(self, console: tcod.console.Console) -> None:
        """畫所有存活單位（僅在可見格內，符合 FOV）。"""
        vis = self.visible
        for u in self.units:
            if not self._alive(u):
                continue
            ux, uy = getattr(u, "x", None), getattr(u, "y", None)
            if ux is None or uy is None:
                continue
            if not (0 <= ux < config.MAP_W and 0 <= uy < config.MAP_H):
                continue
            # 僅畫可見單位（迷霧中的敵人不顯示）
            if vis is not None and not bool(vis[uy, ux]):
                continue
            char = getattr(u, "char", "M")
            color = getattr(u, "color", None)
            if color is None:
                color = (
                    config.COLOR_PLAYER
                    if getattr(u, "faction", None) == config.Faction.PLAYER
                    else config.COLOR_ENEMY
                )
            console.ch[ux, uy] = ord(char[0]) if char else ord("M")
            console.fg[ux, uy] = color
            # 被選取單位以較亮底色標示
            if u is self.selected_unit:
                console.bg[ux, uy] = (60, 60, 30)

    # ------------------------------------------------------------------
    # battlefield 地形陣列存取（容錯多種 SPEC 相容命名）
    # ------------------------------------------------------------------
    def _tiles_array(self) -> Optional[np.ndarray]:
        """取得地形 id 陣列 [y, x]。容錯嘗試 battlefield 的常見屬性名。"""
        bf = self.battlefield
        if bf is None:
            return None
        for name in ("tiles", "terrain", "tile_ids", "grid"):
            arr = getattr(bf, name, None)
            if arr is not None:
                return np.asarray(arr)
        return None
