# 任務：把 2026-10-24 定案落進 specs/world（含新增天象與裏側聲音兩檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」逐行列出下列每個路徑）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/STRUCTURE.md`、`wf/workflows/planning.md`、`wf/workflows/planning/specs/world/README.md`、`wf/workflows/dispatch/handoffs/lead-settle/guide.md`（**本線的唯一依據**：D1–D14 定案與「沒有暫定答案的題」）、`wf/workflows/planning/design-notes/tide-sky.md`、`wf/workflows/planning/design-notes/tide-sky/spec-proposal.json`（20 列改法，本線只落第 1–12 列 world 層）、`wf/workflows/planning/design-notes/tide-sky/mechanics.md`、`wf/workflows/planning/design-notes/tide-sky/lore.md`、`content/lore/style.md`。路徑都相對你的工作目錄（隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-spec/`，內容與主 repo 相同）。

## 背景與唯一目標

使用者 2026-10-24 說：數字 v2「OK」、世界觀未定題「就用暫定答案」。guide.md 把它們寫成 D1–D14。specs/world 還寫著「待使用者確認」「暫值」「歸哪把傘未定」，tide-sky 的 spec 改法也還沒落筆。本線唯一目標：讓 specs/world 與 D1–D14 一致。**既有說法保留**：只改與定案衝突的句子、補定案內容；spec 的「使用者裁示／我的提案／理由／放棄的替代案」四標記格式照舊，定案寫在「使用者裁示（2026-10-24）」並照抄原話。

## 範圍（排除法寫死）

只改 worktree 內 `wf/workflows/planning/specs/world/` 下列檔，每檔一個硬上限 **8,192 bytes**（`wc -c`）；放不下的細節搬進兩個新檔，原檔只留一句指標：

| 檔 | 要做的事 |
|---|---|
| **新增** `omens.md`（天象） | spec-proposal 第 1–12 列的全部內容，照 D10 修正（連珠潮第 40 蝕月一次、之後只靠湧現，不採「每 52」；沐蝕會讖語三成不準是被蝕扭曲，不是故意說錯）；加 D8 天象落在人身上、D9 年表對天象。格式照其他 spec 檔（標題、上一層連結、四標記）。 |
| **新增** `voices.md`（裏側的聲音） | D7 全部七點、D5 祕法三形狀與歸屬；迦梨那點寫明是隱藏真相、外界不知道。 |
| `README.md` | 子檔導航加 omens、voices 兩列；（九）「歸哪把傘未定」改 D2；（八）照 D14 改首例口徑。 |
| `setting.md`（現 8,139 bytes，幾乎沒空間） | 人口「待使用者確認」改已定（D1，原話「OK」，可一句帶城邦 400 等）；殘聯雙籤城「（暫值）」改已定（D2）；resistance 指標的「暫值」改已定；蝕潮與墟段的連珠潮補「下一次排定在開局後第 40 蝕月，詳見 omens」。其餘天象細節只放 omens。 |
| `resistance.md` | D6 暫值改已定（保留「數值之後可微調」原話）；D3 詞表一句；祕法指向 voices。 |
| `machine-souls.md` | D14 改首例口徑；D4 一兩句（魂核等級＝天花板、魂核不可換；搬家照舊）。 |
| `ruins-and-ancient.md` | 認主段補 spec-proposal 第 12 列（望潮尤佳、歲星加成、重蝕躁動；刻痕最深層的五星星圖）；先民或夢召段加一句指向 voices。 |
| `rifts-and-territory.md` | 時鐘段照第 1 列改名並補三句（細節可放 omens）；第 2、3 列放得下就放，放不下只留指標；D12 蝕域內的國（沐蝕會孟買神權城、拉哥斯蝕匪邦）一句。 |
| `monsters.md` | 第 9 列一句；D12 新的族（第五族以後當擴充旗，首次露面建議第 40 蝕月之後）一句。SS／SSS「待裁示」**照舊**。 |
| `bio-mechs.md` | D12 生物系在撒南傘是主流一句；蛻皮祕法指向 voices。 |
| `factions.md`（現 8,187 bytes）、`operations.md`（現 8,174 bytes） | 只准**等長或更短**的替換：factions 的殘聯若有「城邦聯合」類說法可改「南亞傘」；第 6–8、10、11 列全部放進 omens，不在原檔加字。不需要改就不改。 |

- 不做：上列以外的任何檔（含 `specs/core`、`specs/ops`、`monsters.json`、design-notes、content、`src/`）；不新增人名、事件、專名（tide-sky 詞彙表 `glossary.json` 已有的詞可用）；沒有暫定答案的題（guide.md 末段）原樣留「未定」；worktree 內不要留任何其他檔（筆記放 `/tmp/cx-st-spec/`）；不 commit。
- 件數 gate：改動與新增檔合計超過 12 個就停下回報；容量 gate：任一檔超過 8,192 bytes 就停下修到不超過，修不到就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/tide-sky/spec-proposal.json get 0`（在 worktree 根跑；tabledb 實際路徑 `wf/tools/tabledb.py`；序號換成要查的） | 逐列讀改法 |
| `wc -c wf/workflows/planning/specs/world/*.md` | 每改一檔量一次 |
| `bash wf/tools/wf-lint.sh --strict .`（在 worktree 根跑） | 改完核連結；只看規格目錄 specs/world 的新違規（既有的 ROSTER、CLAIMS、SESSION-LOG 等違規不是你的） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-st-spec --once` | 每改完一檔讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**：無；只寫 worktree 內上列檔與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-spec/`（只放 REPORT.md，不寫全文傾印或整份 diff）；不 commit（沙箱下 `.git` 唯讀，領導收件）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親自讀「先讀」全部。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；spec-proposal 第 1–12 列逐列讀。
2. 先寫 omens.md 與 voices.md，再逐檔改其他檔；每檔改完量 `wc -c`、讀 orders。
3. 跑 wf-lint，修本線造成的壞連結。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-spec/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過與新增的 spec | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-spec/wf/workflows/planning/specs/world/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-spec/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**；「做了什麼」；「逐檔摘要」（每檔落了哪些 D 代碼或 spec-proposal 列、前後 bytes）；「spec-proposal 第 1–12 列落點表」（每列一行：落在哪檔哪段，或為何改寫）；「沒做到或證據不足的」；「需要決定的事」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `omens.md`、`voices.md` 存在，README 子檔導航有兩列指向它們。
2. `specs/world/*.md` 每檔 ≤ 8,192 bytes。
3. `specs/world` 裡「待使用者確認」「暫值」「歸哪把傘未定」0 處；「2104」不再被寫成第一個登錄的機魂。
4. `wf-lint --strict` 沒有 `specs/world` 的新違規。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑，並有第 1–12 列落點表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-st-spec`。本線團隊：`teams/st`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-st-spec --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-st-spec --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-spec/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「specs/world 與 D1–D14 一致」；tide-sky 改法與 D10 衝突時以 D10 為準；任何需要改其他檔的需求一律寫進 REPORT，不動手。
