# lead-cockpit 收線報告（2026-10-25，頂層代存）

[handoffs](../README.md)｜工人 [cx-cockpit-core](cx-cockpit-core/REPORT.md)、[cx-cockpit-growth](cx-cockpit-growth/REPORT.md)｜交接書 [cx-cockpit-core.md](cx-cockpit-core.md)、[cx-cockpit-growth.md](cx-cockpit-growth.md)

## 結論

engine-backlog 第 30 列（併 35、46）與 47、48、49 全部落地；使用者 2026-10-25 三條裁示寫進 spec／design-notes 並實作（SS／SSS 不做設定、終局駕駛員為零算機魂、範圍外殘留改完）。兩個 codex 工人（gpt-6-astra）在隔離 worktree 做，領導在沙箱外重驗後合入。

## commit

`d98f212`／`d993c8f` 開線與交接書｜`9bf9da5` 座艙狀態與普通開（30）｜`cb1da74` index｜`4d9a057` 裁示落地｜`986ddab` 第二工人交接書｜`429b494` 人帶能力、驅動時數、AI 醒魂（47–49）｜`263e147` index｜`8236d1e` drive／pilots 引擎現況、backlog 標完成｜`7c82230` 收線。

## 玩家看得到的變化

- 白手套不再是同一個機魂分身坐好幾台：打人的場是沒有核心的鐵偶（打獸只算凡鐵），有獸的場是有核心的遙控機。無人機顯示「無人（普通開）」，只會開槍揮拳，沒有招式。
- 駕駛員出擊累積驅動時數，到門檻長出跟人走的能力（思維加速、強化打擊、強化遠程、壓制獸性，先都是 D 級小增益）；營運、百科、MCP 顯示外貌年齡（伊爾瑟實齡 35、外貌 23）。
- 營運編隊多「AI 駕駛」切換；有核心的 AI 機打夠 10 場後，在漲潮日或有古代機的戰場各有萬分之一機率醒成新機魂。
- 名冊上沒有駕駛員也沒有機魂時戰役結束（`no-pilots`）；有機魂就不算零。

## 驗收

`npm test` 935／935（開線前 912）；`npm run typecheck` 0；`npm run check` 0 錯 8 警告；`node content/lore/check.ts` 0 錯 2 警告；`npm run test:e2e` 13／13；`bash wf/tools/wf-lint.sh --strict .` 違規全 0。

## 黃金

戰鬥黃金 `test/golden/*.hash` 全不變。營運只有 `test/campaigns/ops-relic.hash.json` 變：第 146 天最後一名駕駛離職，`no-pilots` 讓戰役在第 168 天結束（原 189 天）；其餘 campaign 與 `src/ops/sim/fixtures/campaign-hash.json` 不變。`src/ops/sim/campaign.test.ts` idle seed 7 也因駕駛離職在第 104 天結束（月摘要 6→3）。47–49 沒改任何黃金。

## 暫值放哪

全部在 `content/base/rules/cockpit.json`：`basicAbilities`、`drivenOnlyTags`、`crewPools`（無人機 AP 7）、`growth`（每回合 0.25 小時、能力門檻 20／60／150 小時、上限 3、等級上限 S、機魂 1/10、老化 1/4、每年 1000 小時、醒魂 10 場與兩個萬分之一）。四個能力的數值在 `content/base/{abilities,effects}/pa-*.json`。

## 實作上的取捨（SPEC-GAP）

- 「大潮時刻」先用漲潮日代替（大潮曆是 backlog 第 38 列）；「古代機半徑內」先算成同場有古代機、不算距離。
- 強化打擊／強化遠程暫用命中加成：效果系統沒有分近戰／遠程增傷的掛點。
- AI 估值對無人機多一個固定預覽樣本，免得低命中無人機把武器估成零傷害（只影響 scripted 單位）。
- 舊狀態缺 `core` 欄時視為有核心。

## 需要使用者決定或試玩

1. 駕駛離職就終局：idle 戰役約 100–150 天會因駕駛全離職而結束。建議先試玩；太早就調延後的薪資／士氣，不改終局規則。
2. 醒魂「同時出現相乘」：照字面兩者都在反而更難醒；引擎先做兩個獨立骰（任一中就醒，約萬分之二）。建議照這個讀；要加乘請給倍率。
3. 長能力節奏：greedy 6 蝕月 4 個種子只有 1 個長出能力（17 場約 25 小時）。試玩後再改 `abilityHours`。
4. 強化打擊／遠程要真的分近戰遠程增傷，需另開一列（建議與第 28 列抵抗性一起做）。

## 以後交接書該點名的工具

- codex 沙箱擋 unix socket 與 `spawnSync`：`src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts` 一定紅，交接書要先寫排除版測試指令（本線第一派因此 BLOCKED）。
- `node --test --test-isolation=none --test-name-pattern=…`：沙箱裡看逐案結果。
