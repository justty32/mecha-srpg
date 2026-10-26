# 已讀清單

- `AGENTS.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `content/lore/factions/sub-saharan-umbrella.json`
- `content/lore/factions/west-asia-umbrella.json`
- `content/lore/events/gold-reef-night.json`
- `content/lore/events/twin-rivers-night.json`
- `content/lore/events/suez-canal-night.json`
- `content/lore/events/yoke-riders-abroad.json`
- `content/lore/events/hunter-license-act.json`
- `content/lore/places/gold-reef.json`
- `content/lore/places/twin-rivers.json`
- `content/lore/places/suez.json`
- `content/lore/places/mombasa.json`
- `content/lore/characters/wanjiku-kamau.json`
- `content/lore/characters/juma-kiprop.json`
- `content/lore/characters/farida-naseri.json`
- `content/lore/characters/nadia-sabri.json`
- `wf/workflows/dispatch/handoffs/lead-fill-af/af-03/PLAN.md`
- `wf/workflows/dispatch/handoffs/lead-fill-af/cx-af-03.md`

PLAN.md 與交接書未在 worktree 複製，已親讀主 repo 的同名絕對路徑；沒有用摘要替代。另親讀 wf/WORKFLOWS.md、wf/SESSION-LOG.md、wf/WAIT_USER.md、inbox README／PROTOCOL，以及 world-pillars 的 world／mechs／bio-battle 入口與 tone-and-rules、factions-and-sandbox、monsters、bonds、bio 子檔。開場進度計數為 7／1，已開啟兩檔；new 信箱無信。

## 做了什麼

本線 cx-af-03，團隊 teams/fill-af；依已審 PLAN 與交接書六項裁定完成產出。未派子代理，子代理成本為零；四檔由本線親讀上下文後撰寫，品質證據為下列固定驗收。所有步驟後均已輪詢 orders，無新指示。

- `sarei-ndovi.json`：以出發與到港的落差寫分援調度，掛 G 線、N05→2100 成傘→N08、金山夜與軛騎出洋，保留雙籤港求援自選。
- `temo-moruen.json`：寫塌穿後首趟復探帶班與地熱優先排班，掛 N05、金山夜、2100 成傘及底色 1.4／1.6，井口維持國家與傘共管。
- `sahen-darim.json`：寫斷橋逃生、載傷員與預留回程船位，掛底色 1.11、斷橋夜及 N10 的既往破約先例，只留下對停戰的疑懼。
- `saevna-suren.json`：寫運河夜等命令失船與後來的持牌交接，主掛 N08、運河夜→同年獵牌法後採用評等輪值，陣營 null、駕堅盾-I。

## 產出

四個新檔均位於本線隔離 worktree 的 `content/lore/characters/`，相對檔名如上；工作目錄為 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-03/`。白話表為本報告同目錄的 `review-add.json`，本檔為 `REPORT.md`。既有 lore 未修改，未 commit。開工已有未追蹤 `node_modules`，收尾保持原狀；本線新增僅指定四檔，件數及容量 gate 均未觸發。

固定四條驗收證據：

1. 開工前 `node content/lore/check.ts` 為 `errors=0 warnings=12`；每完成一檔各跑一次，四次均為 `errors=0 warnings=12`。最後人物總數 84，無新增警告。
2. 全部寫完後 `npm run check` 執行一次，exit 0，末行 `OK 0 errors, 10 warnings`。
3. 四檔存在且 id name 段與檔名相同；body 字數按上述順序為 544、550、544、587，皆在 300–1000。review-add.json 可解析、恰 4 列，白話字數依序為 42、43、43、44，皆 ≤60。git status 只多指定四檔，既有檔無修改。
4. 本 REPORT 已寫入，開頭為「已讀清單」，包含交接書點名的全部路徑。

## 沒做到、或證據不足的部分

無。依固定四條驗收收尾，沒有加跑 npm test、typecheck、wf-lint、content_accept 或其他驗收。既有 12 個 lore 警告未處理，其中金山夜未入年表的警告保持原狀。

## 需要決定的事

本批無新增設定裁決需求。已知落差逐條交代如下，未修改任何既有 lore 或設定筆記：

- 雙籤細則：支柱仍有跨傘權責未定的記載；依領導裁定只沿用蒙巴薩既有的日常歸撒南、求援自選，未增懲罰或援軍優先權。
- 金山井權：城主只掌日常排班與供應，產權法理與守備仍依既有國家／傘共管，不寫私有礦井。
- 金山生還者：泰莫明定為塌穿後首趟復探帶班者，當夜失蹤者仍未歸。
- 斷橋與 N10：不說違反尚未簽訂的蝕線協定，不指定炸橋方，不寫開局後事件。
- 運河掛點與牌照：依裁定主掛 N08；先運河夜，再同年法頒後登錄輪值，牌屬獵團，未加月日。
- 既有獸描寫：PLAN 指出的 league-founded.json 散放獸與 gold-reef.json 墟出低階東西疑慮交領導；本批調獸連拘束艙、騎手與維護，金山僅採掘供應，遵守 B1／B2／W11。
- 關係列數量：交接書稱「計畫書列的四列」，PLAN 逐人卻明列 2＋1＋1＋1＝5 列。本線依逐人規格保留這 5 列，沒有另添關係；若「四列」才是硬限制，需領導指定刪去哪一列。

## 以後交接書該點名的工具

`node content/lore/check.ts`（先記 warnings 基線、逐檔跑）、`npm run check`（全批一次）、`python3`（JSON 寫入／解析與字數核對）、`git status --short --untracked-files=all`（檔案範圍）、`wf/tools/inbox_read.sh`、主 repo 絕對路徑的 `wf/tools/inbox_poll.sh` 與 `wf/tools/inbox_mail.sh`。PLAN 與交接書若不複製進 worktree，宜直接點名主 repo 絕對路徑。
