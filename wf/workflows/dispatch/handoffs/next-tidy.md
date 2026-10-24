# next-tidy — 下次段落的重構拆檔與 tidy 清單

[handoffs](README.md)｜交棒 [STATE](STATE.md)｜流程 [tidy](../../tidy/README.md)、[refactor](../../refactor/README.md)、結構原則 [STRUCTURE](../../../STRUCTURE.md)

2026-10-24 段落使用者明示**這次不做重構拆檔與 tidy**，以下是收尾時盤點的現況，留給下次。動手前重跑 `bash wf/tools/wf-lint.sh --strict .` 與 `git worktree list` 取新數字；搬檔用 `fix_moved_links.py`，刪檔一律先問使用者。

## 一、wf-lint 現況違規（2026-10-24 收尾時，exit 1）

- `OVERSIZE wf/workflows/inbox/ROSTER.md`（24569 bytes）：歷史格太多 → 已下線格移 `inbox/archive/` 或拆 `ROSTER/` 資料夾，入口留現役。
- `BIGLIST wf/workflows/dispatch/CLAIMS.md:9-14`（1972 bytes）：現役／歷史表抽 json，或收線後清歷史表。
- `BIGLIST-LINKS`（warning）：`legacy/docs/README.md`（只讀封存，可加 `<!-- wf-nav -->`）、`content/README.md`（17 條連結，pilot 線改過，下次確認用途後標 nav 或分層）。

## 二、接近 8 KB 的檔（> 8000 bytes，再加一段就超）

design-notes：`mechs.md` 8089（world.md 7818）——使用者新裁示再進來就要拆，照「原路徑保留當入口」按主題拆子檔。流程檔：`team-model.md` 8108、`decisions.md` 8170、`content/world-pillars/{mechs,world,bio-battle}.md` 8170／8149／8123（本段落為塞新裁示已壓縮引文，下次改成每檔 ≤ 9 條或拆四檔）。spec：`specs/core/data-model-world.md` 8188、`specs/ops/{battle-interface,data-model-factions-contracts,README,text-ui-contract,data-model-operations-war}.md` 8083–8187——spec 是本質不可分的單體可超標保留，但大地圖實作會再改它們，屆時先拆。

## 三、活狀態與收信殘檔

- `wf/SESSION-LOG.md`／`wf/WAIT_USER.md`：本段落已清；下次確認試玩三項是否已回饋。
- `handoffs/STATE.md`：`inbox_ack.sh --state` 會把 ack 記錄追加在檔尾，交棒內容與 ack 流水混在一起 → ack 改寫到 `handoffs/ack-log.md` 或關掉 `--state`。
- 收信殘檔：`wf/inbox/new/` 一封（lead-gaps-ops REQUEST）、`wf/inbox/mail/` 30 個信箱、`wf/inbox/teams/` 5 隊、`wf/inbox/orders/`，與 `wf/inbox/done/2026-10-24/teams/` 12 隊未追蹤 → 確認已處理後照 inbox 協議歸檔、done 進版控或 ignore（`.gitignore` 歸調度者）。

## 四、handoffs 目錄

- 已收線的 44 個 `handoffs/<線名>/` 目錄（不含現役 lead-codex-pilot 與本段落收尾 lead-wrapup）與頂層 `plan-ops-spec.md` 仍在現役位置 → 照 [handoffs README](README.md) 移 `done/2026-10-24/`，並開 `done/README.md` 索引（線名、日期、一句結論）；注意 roadmap、engine-backlog.json、content 工作流有連到各 REPORT，搬後跑 `fix_moved_links.py`。
- 7 個 `trash/` 目錄（lead-rules-fuzz、impl-foundation、gaps-battle、mcp、integ-battle、impl-ui、ui-ops）→ 問使用者能否刪。
- repo 根未追蹤 `tmp/`（內含 `claude-1000/`）→ 確認來源後清或 ignore。

## 五、scratchpad 舊 worktree

`git worktree list` 10 條：主工作樹＋ lead-codex-pilot 的 9 個 detached worktree（`scratchpad/codex-pilot/wt-*`，含 `-base` 對照樹）。pilot 收線後由頂層確認，`git worktree remove`（刪除要使用者確認）＋`git worktree prune`。

## 六、文件同步

- `content/README.md` 的內容件數（lead-content-ancient 留給頂層）與 pilot 新增後的實數對齊。
- [code-map](../../common/code-map.md)／[code-map.json](../../common/code-map.json)：world-grid、intent、content 工具（`wf/tools/content_*`）落地後補列；[testing-checks.json](../../testing-checks.json) 與 `package.json` scripts 對一遍。
- [planning-roadmap.json](../../planning-roadmap.json)：本段落只改狀態、加 5 列；已完成列下次移出或標封存。
- `wf/workflows/decisions/2026-10-24-bio-ui.md` 導航過期：應指 `design-notes/bio-mechs.md`（plan-world-pillars REPORT 矛盾 3）。
- spec 殘留（plan-spec-integrate）：`core/rules-battle-flow.md:49`、`world-grid/{continents,terrain-layers}.json`「兩百公里」、月弓年份 2041 vs 2043。
- `wf/workflows/planning.md` 的「想法」表三列都已處理，可清。
