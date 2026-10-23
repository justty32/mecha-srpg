"""input_handlers.py — 把 tcod 事件映射成語意指令（SPEC §8）。

用途：將底層 tcod.event 物件（KeyDown / Quit / MouseMotion 等）轉換成
與遊戲狀態無關的「語意指令」，讓 game_states 只需處理高階意圖，
不必直接面對鍵碼。這是經典 roguelike tutorial 的 input handler 概念，
但本專案改為「事件 → 指令 dict」的純函式映射，狀態機自行解讀。

對應教學 part：part1_window_and_loop（事件迴圈）、part10_ui_winloss（操作說明）。

座標慣例（SPEC §2）：方向指令一律以 (dx, dy) 表示，x=橫、y=縱、原點左上，
故「上」= (0, -1)、「下」= (0, +1)。

關鍵 tcod API：
- tcod.event.KeyDown / tcod.event.Quit：事件型別
- tcod.event.KeySym：鍵碼列舉（方向鍵、字母、Enter、Escape…）
- event.sym：KeyDown 事件的鍵碼
"""

from __future__ import annotations

from enum import Enum, auto
from typing import Optional, Tuple

import tcod.event


class Command(Enum):
    """語意指令列舉（與鍵位解耦，供 game_states 解讀）。

    SPEC §8 鍵位：
    - 方向鍵 / WASD：移動游標（隨指令附帶 (dx, dy)）
    - Enter：選取 / 確認
    - Esc：取消 / 選單
    - M：移動模式
    - F：攻擊模式
    - Space：Wait / 結束單位
    - Tab：切換我方單位
    - E：結束我方回合
    """

    MOVE = auto()        # 游標移動；附帶 payload=(dx, dy)
    CONFIRM = auto()     # Enter：選取／確認
    CANCEL = auto()      # Esc：取消／返回
    MODE_MOVE = auto()   # M：進入移動模式
    MODE_ATTACK = auto() # F：進入攻擊模式
    WAIT = auto()        # Space：該單位 Wait／結束
    NEXT_UNIT = auto()   # Tab：切換下一個我方單位
    END_TURN = auto()    # E：結束我方回合
    QUIT = auto()        # 視窗關閉／要求離開


# ---------------------------------------------------------------------------
# 鍵碼 → (dx, dy) 方向映射（方向鍵與 WASD）
# ---------------------------------------------------------------------------
# tcod.event.KeySym 列舉。WASD 用小寫字母鍵碼。
_MOVE_KEYS = {
    # 方向鍵
    tcod.event.KeySym.UP: (0, -1),
    tcod.event.KeySym.DOWN: (0, 1),
    tcod.event.KeySym.LEFT: (-1, 0),
    tcod.event.KeySym.RIGHT: (1, 0),
    # WASD
    tcod.event.KeySym.w: (0, -1),
    tcod.event.KeySym.s: (0, 1),
    tcod.event.KeySym.a: (-1, 0),
    tcod.event.KeySym.d: (1, 0),
}

# 其餘功能鍵 → 指令
_ACTION_KEYS = {
    tcod.event.KeySym.RETURN: Command.CONFIRM,
    tcod.event.KeySym.KP_ENTER: Command.CONFIRM,
    tcod.event.KeySym.ESCAPE: Command.CANCEL,
    tcod.event.KeySym.m: Command.MODE_MOVE,
    tcod.event.KeySym.f: Command.MODE_ATTACK,
    tcod.event.KeySym.SPACE: Command.WAIT,
    tcod.event.KeySym.TAB: Command.NEXT_UNIT,
    tcod.event.KeySym.e: Command.END_TURN,
}


class InputAction:
    """一個解讀後的輸入動作：指令 + 可選的 (dx, dy) 位移。

    以小物件取代裸 dict，讓 game_states 取用時有明確屬性名。
    """

    __slots__ = ("command", "dx", "dy")

    def __init__(self, command: Command, delta: Optional[Tuple[int, int]] = None) -> None:
        self.command = command
        self.dx, self.dy = delta if delta is not None else (0, 0)

    def __repr__(self) -> str:  # 便於除錯
        return f"InputAction({self.command.name}, dx={self.dx}, dy={self.dy})"


def dispatch(event: tcod.event.Event) -> Optional[InputAction]:
    """把單一 tcod 事件轉成 InputAction；無對應則回傳 None。

    SPEC §9 主迴圈會對每個事件呼叫此函式，再把結果交給目前 state。

    參數：
        event: tcod.event.wait() / get() 產生的事件物件。
    回傳：
        InputAction 或 None（不關心的事件，例如滑鼠移動）。
    """
    # tcod.event.Quit：視窗右上角關閉鈕
    if isinstance(event, tcod.event.Quit):
        return InputAction(Command.QUIT)

    # tcod.event.KeyDown：鍵盤按下
    if isinstance(event, tcod.event.KeyDown):
        sym = event.sym
        if sym in _MOVE_KEYS:
            return InputAction(Command.MOVE, _MOVE_KEYS[sym])
        if sym in _ACTION_KEYS:
            return InputAction(_ACTION_KEYS[sym])

    return None
