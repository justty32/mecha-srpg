"""__main__.py — 讓 `python -m mecha_srpg` 可直接啟動遊戲。

委派給 main.main()（建立 tcod context 與主迴圈，SPEC §9）。
"""

from __future__ import annotations

from .main import main

if __name__ == "__main__":
    main()
