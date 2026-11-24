#!/bin/sh
# 全機一次只跑一個重負載（npm test／test:dom／test:e2e／sim／fuzz）：後來者排隊等待。
# 鎖檔是全機共用的，跟 arena_cheater 的 arena_verify／arena_e2e 鎖同一個檔，所以跨 repo 也互斥
# （使用者 2026-11-24 裁示；路徑沿用 arena 既有的，別改，要改得兩邊一起改）。
lock=/tmp/aos/arena_cheater/locks/node.lock
mkdir -p "$(dirname "$lock")"
exec flock "$lock" "$@"
