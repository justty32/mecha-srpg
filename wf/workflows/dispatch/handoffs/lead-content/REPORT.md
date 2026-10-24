# REPORT — lead-content：codex 新增內容七批＋勢力草稿併入（2026-10-24）

> 由頂層代存（harness 擋子 agent 寫報告檔）。

STATUS：**DONE**。工人全用 codex `gpt-6-astra`（reasoning high），隔離 worktree＋manifest＋`content_accept.sh`，八批全部 ACCEPT、閘門 0 違規、帶回 main。

收線驗證（乾淨 worktree @`5613152`；主工作樹有 lead-grid 第三波未 commit 的改動）：`npm test` 871／871、`npm run check` 0 錯 8 警告、`npm run typecheck` 綠、`node content/lore/check.ts` 0 錯 2 警告（既有）。`wf-lint --strict` 剩 ROSTER 超標（9.8 KB，全是現役 lead-tune／lead-grid 的格）與 CLAIMS 現役表 >1 KB，都不是本線的格；本線已把已收線成員封存到 `inbox/archive/ROSTER-2026-10-24-d.md`（15.8→9.8 KB）。

## 一、八批

| 批 | codex-batches 序 | 產出 | 輪 | commit |
|---|---|---|---|---|
| lc-ops-01 | 4 | 中後期營運事件 9（蝕潮異象／同業獵團／船上生活各 3）＋對白 2 | 1（工人誤報 BLOCKED） | b6baa3f |
| lc-lore-02 | 2（lore） | 第三刃／背面：事件 4（百燈破圍、同旗之約、無月撤棧、藏燈之盟）＋人物 2＋年表 4 | 2（容量 gate 誤判重派） | ee0a263 |
| lc-lore-01 | 5 | 5 勢力代表事件（阿克拉、守寢人、環線商隊、新加坡、雪梨）＋年表 5 | 1（orders 中途澄清） | 1e7646e |
| lc-mech-01 | 3 | 人類對手衍型機 7（基多 禿鷲-II／安地斯壁／雷鳥、奈洛比 牧杖-III型／牧者、鹽鷗 潮鷗-長槍、殘聯 犁）全配 defaultLoadout＋展示情境 2 | 2 | c13ae38 |
| lc-lore-03 | 6（lore） | 既有 A／S 怪獸二名由來事件 6＋年表 6 | 1 | 05d8b92 |
| lc-field-01 | 7 | 地圖 4＋情境 5（守區／存活／撤離／參戰斬首／人對人，全殲 0；勝率 40–80%） | 1 | 9781901 |
| lc-merge-01 | — | 兩批 lore 的四小節草稿併入 7 個勢力檔 body（20 節，polish 模式） | 1 | 5613152 |

帳本 `content/batches/2026-10/lc-*.json`（files／ids／rounds／naming／summary 已填），各批 REPORT、命名表、accept 產物在 `handoffs/lead-content/<batch>/`。`codex-batches.json` 狀態欄、`engine-backlog.json`（+2 列：序 26 新機入營運與專屬血統、序 27 lore 事件 gameRefs）已更新。收線 commit `9dfdfe8`。

## 二、判斷

- **品質**：lore 比試點敢中二（「萬燈開海！」「借岸斬王！」），營運事件每件有氣味／聲音／不解釋的名詞；機體血統暫借既有 tag，理由清楚。agy 只退回一個名字（山口扣船令→山口查扣令）。
- **營運黃金**：新隨機事件一律 `calendar.month >= 7`（黃金最長 168 天＝month 6），所以是中後期事件；greedy 11 潮月 4 seed 實測每 seed 抽到 6–10 次。黃金重產若獲授權，可放寬月份閘門。
- **最大成本是 codex 字面執行停止條款**：年表 35 KB 觸發「單檔 16 KB」容量 gate（2 條線停）、沙箱內 `src/mcp` 兩個測試 EPERM 被當阻塞（4 條線報 BLOCKED）、node 內 spawn node 被擋就停 MCP 試玩。後兩批交接書寫明「不算阻塞」後就沒再發生。
- **用語**：新檔照當時新詞寫；lead-rename 收線前用 rename-18 掃過本線前幾批（蝕盛→大潮、舊專名）；收線後我再照 `terms-rename.json` 掃全部本線新檔與草稿，0 殘留（萬潮葬王與怪獸檔一致，屬海洋意象保留）。草稿併入時換成守寢人、稽古學會。

## 三、沒做到／留給後續

- lc-mech-01 七台沒有 `world/models`、遭遇編成、市場，只在兩個展示情境出現；維拉科查／恩凱／埃吉爾專屬血統未落地（engine-backlog 序 26）。lore 寫安地斯壁是「堅盾之祖」，與堅盾公刻 2093 時間先後矛盾，交規劃線。
- 勢力草稿的欄位建議（`ancientMech`、`relations`、背面是否升大勢力）未套用，留在 `lc-lore-0{1,2}/faction-drafts/`。
- lc-lore-03 六件事件原本填了 `gameRefs` 連怪獸，但 lore 契約 event 無此欄（check 警告；我交接書寫錯），收件時移除；欄位開放後再補（序 27）。
- MapDef 沒有 `name` 欄，lc-field-01 的地名只存在命名表與情境 brief。

## 四、給工作流的教訓（建議寫進 dispatch/content-batch.md、content/batch.md）

1. 容量 gate 寫「只看你新增的檔」，例外檔（timeline.json）本身不算。
2. 沙箱內 `npm test` 的 `src/mcp/cli.test.ts`、`e2e.test.ts` 必定失敗（socket／spawn EPERM），寫明「不算阻塞」；MCP 試玩一律走 shell 管線或 FIFO，不在 node 裡 spawn node。
3. **共用工作樹的索引陷阱**：`npm run content:index` 讀共用 git index、寫共用工作樹，誰 `git commit -- content/index` 就把別線的暫存與未 commit 檔算進去（本段落 base-route 分片被刪、lc-mech-01 分片被覆蓋過，都已補回）。重產一律 `GIT_INDEX_FILE=<tmp> git read-tree HEAD` → 只 add 自己的檔 → `content:index` → **立刻** commit 自己牽動的分片，中間不跑長測試。
4. 多批同改 timeline 時 carry 會拒（目的地已非 base）；本線用 merge 腳本從 worktree 對 base 算出新增條目、依 date 插入 main，純插入不動既有條目。
5. worktree base 選主線測試綠的 commit；主線被別線半成品弄紅時，收件後驗證在乾淨 worktree 跑。

## 子代理

沒有開 Claude 子 agent；codex 工人 7 條（含重派 2 次），工人自報都沒有開子代理。

## 以後交接書該點名的工具

`python3 -I wf/tools/content_gate.py`、`bash wf/tools/content_accept.sh`、`npm run content:index`（配臨時 GIT_INDEX_FILE）、`python3 wf/tools/tabledb.py`（寫實際路徑）、MCP 用 shell stdio（`printf … | node src/mcp/server.ts`／FIFO）、`agy --model gemini-4-argon-high`（純文字命名審查）、`wf/workflows/planning/design-notes/terms-rename.json`（用語定案表）。
