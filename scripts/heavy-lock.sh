#!/bin/sh
# 全機一次只跑一個重負載（npm test／test:dom／test:e2e／sim／fuzz）：
# 以 git 共用目錄（主 repo 與所有 worktree 共用）當鎖，後來者排隊等待。
lock="$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null || pwd)"
exec flock "$lock" "$@"
