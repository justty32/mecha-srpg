# REPORT — lead-tidy：next-tidy 六節跑完一輪，wf-lint 全 0、測試綠（2026-10-24，頂層代存）

[handoffs](../README.md)｜清單 [next-tidy](../next-tidy.md)

STATUS：DONE。殘留項在 next-tidy「殘留」段。commit `13cd91d`（搬移）、`48a23c0`（狀態清理）、`281efd6`（拆檔）、`ce5402e`（拆 spec）、`96b1f5c`（文件同步）。

## 做了什麼
1. 搬移：43 個已收線 `handoffs/<線名>/`＋`plan-ops-spec.md` 以 `git mv` 移 `done/<收線日>/`（10-23 四線放 `done/2026-10-23/`），開 `done/README.md` 索引；`fix_moved_links` 修 49 檔（`inbox/done` 的 messages.json 是信件紀錄不改）；8 支量測工具相對 import 補兩層並實跑；testing-checks、content 子流程、e2e 註解的工具路徑同步。
2. 狀態清理：ROSTER 38 格封存 `inbox/archive/ROSTER-2026-10-24-c.md`（24569→3825 B）；CLAIMS 移已收三列、歷史改指 done 索引；`new/` 1 封＋`mail/` 41 封 ack、4 隊 close、orders 歸檔、done/teams 名冊進版控、空信箱 rmdir；`inbox_ack.sh --state` 預設改 `wf/inbox/done/ack-log.md`。
3. 拆檔：design-notes mechs／world、world-pillars 三檔、decisions 2026-10-23 五筆、team-model 分級表（`team-model/grades.md`）、spec 6 檔（core data-model-world；ops battle-interface、factions-contracts、text-ui-contract、operations-war、README）；原路徑留入口、措辭不改、錨點保留；constraints*.json 7 處 spec_section 改指子檔。
4. 文件同步：bio-ui 導航、spec 殘留三處（`rules-battle-flow.md:49` 戰機砲兵→鐵翼鐵龜、world-grid json 兩百公里→十格、world README 月弓 2043）、planning 想法表清空、roadmap 移除完成 3 列、`content/README.md` 件數（frames 7→89 等）＋world 列、acceptance-playtest 的 sweep 寫法與 stdio 連線、SESSION-LOG。

## 驗收
wf-lint --strict：oversize=1 biglist=1 → 全 0（warning 剩 `legacy/docs/README.md`）；check_anchors 0；`npm test` 811/0；check 0 錯 12 警告；wf/tools unittest OK；test_inbox.sh 0。

## 沒做到
`src/ai/adapters/rules-adapter.ts:3`、`src/rules/index.ts:4` 註解的舊 handoffs 路徑（src 禁區）；legacy 導航表 warning（只讀）；`lead-wrapup/`、`lead-tidy/` 待第二階段後移 done；`lead-codex-pilot/` 永久留原處。

## 需要使用者決定
`handoffs/lead-tidy/trash/`（約 9.2 MB，gitignored）：7 線 codex log／pid（gaps-battle 3.7M、integ-battle 1.8M、impl-ui 1.2M、mcp 1.2M、ui-ops 720K、impl-foundation 548K、rules-fuzz 132K）＋`repo-root-tmp/` 68K。刪了不影響連結與測試：`rm -r wf/workflows/dispatch/handoffs/lead-tidy/trash`。
