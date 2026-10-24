# content — 填內容與潤飾文案（codex 照本流程在既有框架上增添 content/base、content/lore）

[WORKFLOWS](../../WORKFLOWS.md)｜[INDEX](../../INDEX.md)｜格式契約 [core content-format](../planning/specs/core/content-format.md)、[ops content-format](../planning/specs/ops/content-format-ops.md)、[lore README](../../../content/lore/README.md)｜風格 [style.md](../../../content/lore/style.md)

在**不改引擎、不改 spec 架構**的前提下，新增遊戲資料（機甲、部件、怪獸、古代機、人物、能力、地形、情境、營運事件…）與世界觀資料（lore），以及把既有文字改得更像人寫的。本工作流給的是**設計原則＋數值帶＋驗收規程**；格式欄位去讀 spec，不在這重抄。

**先讀** [world-pillars](world-pillars.md)：世界觀設計支柱 35 條（太空歌劇、抵抗性與精粹、群像、獵團＝傭兵、怪獸不是畜牲、機魂不可複製且個性限 S、意圖受挫撤退…）與最常見的違反——動筆與潤飾前過一遍。

**何時用**：「填內容」「新增機甲／怪獸／事件／情境」「補 defaultLoadout」「潤飾文案」「改名統一用語」。
**何時不用**：要加欄位、改載入器、改 AI 行為 → feature-dev；數值表本身要改結構 → planning；只是查一個 id 怎麼寫 → 直接看範本檔。

## Done when

- 新檔都在 `content/base/<kind>/` 或 `content/lore/<kind>/`，一檔一筆、檔名＝id name 段。
- `npm run check` 末行 `OK 0 errors`；動到 `content/base/world/` 另跑 `node src/ops/content/check.ts content/base` 末行 OK；動到 lore 跑 `node content/lore/check.ts` 0 錯。
- `npm test` 無新 fail；`test/golden/` 與 `src/ops/sim/fixtures/campaign-hash.json` **不變**（變了＝你改到既有數值或情境，回頭看範圍）。
- 自動對戰煙霧：每個新單位至少進一場 `runBattle`（5 seed）0 例外、每個新能力至少被 AI 用過 1 次（見 [acceptance-playtest](acceptance-playtest.md)）。
- MCP 試玩一輪，量測數字落在 [playtest-baselines.json](playtest-baselines.json) 門檻內，或 REPORT 寫明為何例外。
- `bash wf/tools/wf-lint.sh --strict .` 對你碰過的 wf 檔 0 違規；commit 只 add 明確路徑。

## 流程

<!-- wf-nav -->
0. **開 batch**（agent 批量產出必做）：照 [batch](batch.md)。
1. **選題**：從任務書或 catalog 缺口選；一批 ≤ 20 檔、一個類別，先小後大。
2. **讀範本**：查 templates.json 的範本檔、必配套、常見錯誤，整檔讀過再動筆；再讀該類原則檔。
3. **查數值帶與引擎事實**：numeric-bands.json 建議區間（超出寫理由；觀察值由 `tools/stats.ts` 重算）；engine-facts.json 21 條（標「待引擎缺口線」的照其落地前寫法）。
4. **寫**：id 英文 kebab、文字照 style.md；每檔寫完 `npm run check`。
5. **自動對戰煙霧**：scratch pack、5 seed 0 THROW、能力有被用（見 acceptance-playtest）。
6. **MCP 試玩**：自己起 socket server，打基準對手、量勝率／輪數／能力使用；失衡照「怎麼調」改再跑。
7. **驗收與 commit**：Done when 逐條、REPORT 寫件數／平衡／超帶理由／新發現；`git add <明確路徑>`、`git diff --cached --stat`、`git commit -- <路徑>`，不 push。
8. **更新索引**：`git add` 後 `npm run content:index` 一起 commit；查索引帶條件查分片，**禁止整份讀**。

## 內容

<!-- wf-nav -->
| 檔案 | 內容 |
|------|------|
| [numeric-bands.md](numeric-bands.md)＋[numeric-bands.json](numeric-bands.json) | 各級 HP／層／抗性／AP／傷害／射程／成本／池上限的觀察值與建議區間、抵抗性（原十分律）對數值設計的影響 |
| [engine-facts.json](engine-facts.json) | 引擎事實 21 條：哪些欄位死資料、AI 會用什麼、每條「怎麼寫才有效」 |
| [templates.json](templates.json) | 每類內容的範本檔路徑、必配套、常見錯誤 |
| [mechs.md](mechs.md) | 機械系：三段命名、藍本血統、通用系列、世代演進、建議配裝、角色定位矩陣 |
| [bio-monsters.md](bio-monsters.md) | 怪獸四族骨架與行為差異、等級與血量、核心部位；生物系活捕／屍體、族別、二名、拘束與磨損 |
| [ancient-people.md](ancient-people.md) | 古代機（神異能力、多不產燼、神話命名、獨一無二）；人物與機魂（特質、意志軸、個性限 S） |
| [abilities-effects.md](abilities-effects.md)＋[ability-forms.json](ability-forms.json) | 能力與效果的形態選擇（13 種想做的事→寫法→AI 戰術鍵）、成本與產出、常見失效寫法 |
| [battle-field.md](battle-field.md) | 地形、地圖、情境（部署、撤離、目標類型、參戰型、輪數）、AI 設定 |
| [ops-content.md](ops-content.md) | 營運內容：事件 prompt／choose、契約模板、名表、科研、市場、遭遇、對白 |
| [lore-text.md](lore-text.md) | lore（勢力四節、人物、事件、年表一致性）與文字潤飾準則（禁用詞、句長語感、只改文字欄） |
| [batch.md](batch.md) | 一批內容從開 manifest、隔離 worktree、派 codex、閘門、驗收、退回重做到帶回 main 與更新帳本 |
| [polish.md](polish.md) | 潤飾模式：只改文字欄、欄位白名單、閘門判定表 |
| [playtest.md](playtest.md) | codex 在 worktree 自測：MCP socket 試玩、`content:probe`、`playtest.json` 格式 |
| [acceptance-playtest.md](acceptance-playtest.md)＋[playtest-baselines.json](playtest-baselines.json) | 每批驗收清單、MCP 試玩規程、基準對手、失衡門檻、調整順序 |
| `tools/stats.ts` | 零依賴統計：`node wf/workflows/content/tools/stats.ts --json <out>` 重算觀察值 |

## 禁區

- **不改 `src/`、不改 `schemas/`、不改 `wf/workflows/planning/specs/`**；發現引擎缺口寫進 REPORT「需要決定」，不自己補程式。
- **不改既有 id 檔的結構與數值**，除非任務書明列該檔；潤飾只改 `name`／`summary`／`body`／`text`／`lines`／`ui.badge`／`phrase` 這類**文字欄位**，不碰 id、數字、引用、tags。
- 不新增 registries 值（layer-types／damage-types／part-functions／slot-types／locomotion／tactics）；需要就提缺口。
- 不動 `test/golden/`、`src/ops/sim/fixtures/`、既有 `names/nick-*`、`markets/{chittagong,dhaka}`、`rules/*.json`。
- 不刪檔、不裝依賴、不 push、不碰鍵鼠螢幕、不開 GUI；MCP 只用自己起的 socket。
- codex 設定檔（`~/.codex/`）不碰。

## 交接

- 完成後 REPORT 放 `wf/workflows/dispatch/handoffs/<線名>/REPORT.md`，catalog 用 wf-table/1 json（id／類別／等級／名稱／定位／範本）。引擎缺口 → 頂層派 feature-dev；數值帶要改 → 本工作流 numeric-bands（附 stats 重算）；為什麼這樣定 → [decisions](../decisions.md)。
