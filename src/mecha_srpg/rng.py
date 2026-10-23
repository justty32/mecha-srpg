"""rng.py — 可重現亂數來源（SPEC §3）。

用途：以 tcod.random.Random（Mersenne Twister）包裝出可重現的亂數來源，
提供單例 get_rng() 與便利方法 random() / randint() / choice()。
全專案禁止使用標準庫 random，一律走此包裝以確保「同種子→同結果」。

對應教學 part：part2_battlefield（procgen 需要可重現種子）、part7_combat（命中擲骰）。

關鍵 tcod API：
- tcod.random.Random(algorithm, seed)  建立亂數器
- tcod.random.MERSENNE_TWISTER          演算法常數
- Random.uniform(lo, hi)                均勻浮點（含端點）
- Random.randint(lo, hi)                均勻整數（含兩端）
"""

from __future__ import annotations

from typing import List, Optional, Sequence, TypeVar

import tcod.random

T = TypeVar("T")


class Rng:
    """tcod.random.Random 的薄包裝，統一亂數介面。

    使用 Mersenne Twister，可指定種子以重現結果。
    """

    def __init__(self, seed: Optional[int] = None) -> None:
        self.seed: Optional[int] = seed
        # tcod.random.Random：演算法用 MERSENNE_TWISTER；seed=None 時由 tcod 隨機初始化
        self._rng = tcod.random.Random(tcod.random.MERSENNE_TWISTER, seed)

    def random(self) -> float:
        """回傳 [0.0, 1.0) 的浮點數（命中判定用）。

        tcod 的 uniform 含上端點，這裡以 [0,1) 語意對齊標準庫 random.random()，
        故對 1.0 做夾擠（極罕見），確保不會回傳 1.0。
        """
        # tcod.random.Random.uniform(0.0, 1.0)
        value = self._rng.uniform(0.0, 1.0)
        if value >= 1.0:
            value = 0.9999999999
        return value

    def randint(self, a: int, b: int) -> int:
        """回傳 [a, b] 的整數（含兩端）。"""
        # tcod.random.Random.randint(a, b)
        return int(self._rng.randint(a, b))

    def uniform(self, a: float, b: float) -> float:
        """回傳 [a, b] 的均勻浮點數（含兩端）。"""
        return float(self._rng.uniform(a, b))

    def choice(self, seq: Sequence[T]) -> T:
        """從非空序列隨機取一個元素。"""
        if not seq:
            raise IndexError("不能從空序列中 choice()")
        idx = self.randint(0, len(seq) - 1)
        return seq[idx]

    def sample(self, seq: Sequence[T], k: int) -> List[T]:
        """不重複抽樣 k 個元素（順序隨機）。

        以 Fisher–Yates 部分洗牌實作，僅依賴本類別的 randint，
        確保抽樣結果同樣可由種子重現。
        """
        if k < 0 or k > len(seq):
            raise ValueError("sample 的 k 超出序列長度")
        pool = list(seq)
        n = len(pool)
        for i in range(k):
            j = self.randint(i, n - 1)
            pool[i], pool[j] = pool[j], pool[i]
        return pool[:k]

    @property
    def tcod_random(self) -> tcod.random.Random:
        """取得底層 tcod.random.Random（例如傳給 tcod.noise.Noise 當亂數源）。"""
        return self._rng


# ---------------------------------------------------------------------------
# 單例
# ---------------------------------------------------------------------------
_GLOBAL_RNG: Optional[Rng] = None


def seed_rng(seed: Optional[int] = None) -> Rng:
    """以指定種子重建全域亂數單例，回傳新單例。"""
    global _GLOBAL_RNG
    _GLOBAL_RNG = Rng(seed)
    return _GLOBAL_RNG


def get_rng() -> Rng:
    """取得全域亂數單例（尚未建立時以隨機種子初始化）。"""
    global _GLOBAL_RNG
    if _GLOBAL_RNG is None:
        _GLOBAL_RNG = Rng(None)
    return _GLOBAL_RNG
