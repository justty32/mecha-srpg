"""main.py — 進入點：建立 tcod context/tileset 與主迴圈（SPEC §9）。

流程：
1. 載入字型 tileset（找不到自訂字型則用 tcod 內建預設，確保零設定可跑）。
2. 建立 tcod context（視窗）與 Console（order="F"，與 engine/ui 的 [x, y] 索引一致）。
3. 主迴圈：clear → engine.render → context.present → 處理 tcod.event.wait() 事件。

對應教學 part：part1_window_and_loop。

關鍵 tcod API：
- tcod.tileset.load_tilesheet(path, cols, rows, charmap)
- tcod.context.new(columns, rows, tileset, title)
- tcod.console.Console(w, h, order="F")
- tcod.event.wait()：阻塞式取得事件
"""

from __future__ import annotations

import tcod.console
import tcod.context
import tcod.event
import tcod.tileset

from . import config
from .engine import Engine


def _load_tileset():
    """嘗試載入字型；失敗則回傳 None（context 會用內建預設字型）。

    這裡用 tcod 常見的內建字型名稱嘗試載入；找不到檔案時不報錯，
    讓專案在沒有額外資源的情況下仍能啟動（SPEC §12 完成定義）。
    """
    for name, cols, rows, charmap in (
        ("dejavu10x10_gs_tc.png", 32, 8, tcod.tileset.CHARMAP_TCOD),
        ("terminal8x8_gs_ro.png", 16, 16, tcod.tileset.CHARMAP_CP437),
    ):
        try:
            return tcod.tileset.load_tilesheet(name, cols, rows, charmap)
        except Exception:
            continue
    return None  # 用 context 內建預設字型


def main() -> None:
    """啟動遊戲主迴圈。"""
    tileset = _load_tileset()

    # 建立引擎（其建構子會進入 DeployState → 生成戰場、部署、轉入玩家回合）
    engine = Engine()

    # order="F"：console 的 ch/fg/bg 以 [x, y] 索引（與 engine/ui 一致，SPEC §2）
    console = tcod.console.Console(config.SCREEN_W, config.SCREEN_H, order="F")

    with tcod.context.new(
        columns=config.SCREEN_W,
        rows=config.SCREEN_H,
        tileset=tileset,
        title="Mecha Tactics — 回合制機甲戰旗",
    ) as context:
        try:
            while True:
                console.clear()
                engine.render(console)
                context.present(console)

                for event in tcod.event.wait():
                    # 讓滑鼠座標等轉換正確（多螢幕/縮放時的點擊位置）
                    context.convert_event(event)
                    engine.handle_event(event)
        except SystemExit:
            # 玩家關閉視窗或在結束畫面按 Esc：正常離開
            pass


if __name__ == "__main__":
    main()
