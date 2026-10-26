# 已讀清單

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/polish.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`
- `wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/great-tide.md`
- `content/base/bodyplans/mycel-reed-lace.json`
- `content/base/bodyplans/quadruped-beast.json`
- `content/base/frames/bulwark-i.json`
- `content/base/species/reed-lace.json`
- `content/base/species/tidewolf.json`
- `content/base/world/models/bulwark-i.json`
- `content/lore/eras/league.json`
- `content/lore/factions/bay-seventh-post.json`
- `content/lore/factions/dhaka-weavers.json`
- `content/lore/factions/mumbai-returners.json`
- `content/lore/factions/tide-creed.json`
- `content/lore/places/bay-tide-line.json`
- `content/lore/places/dhaka-sail-court.json`
- `content/lore/places/dhaka.json`
- `content/lore/places/khulna.json`
- `content/lore/places/mumbai-gate.json`
- `content/lore/places/surat-key-court.json`
- `content/lore/places/surat.json`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-02.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`

## 做了什麼

依正式 manifest `content/batches/2026-10/bf-deep-02.json`（draft、maxFiles=10、base=27e6ea2f3481a4df855b19bfbf2760a65433fbf1）於隔離 worktree 新增四人物、五事件、一地點，正文 394–476 字元。所有固定欄位、summary 與關聯照交接書；人物皆 human、born 不明，招牌話與站起來的瞬間保留；正文附地方連結。蘆口維持 possible 候選，紅光與紫光的歸因只留 rumor，骸片不移動、不取走。

魯帕與〈帆骨撐天〉接補天院（C／G，底色1.1–1.4）；薩吉德與〈庫爾納蘆口〉接空城打撈（F，1.5、1.8）；阿娜雅與〈坡上還聲〉接浦那撤離後果（F／N08，1.11）；比娜與〈第七哨白齒〉接哨線換防（E／F，1.8、1.12）；〈門內灰虹〉與孟買聽壁接迦梨傳聞（B／H，1.9）。逐件白話與掛點見 [review-rows.json](review-rows.json)。

未使用子代理；由本線直接產出與微調。未 commit、未修改任何既有檔。年表與反向導航只列需求，未套用。

## 產出

worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02`。10 個 content 路徑與白話掛點見 [review-rows.json](review-rows.json)；四份報告只位於本目錄。

固定四條驗收：

1. `node content/lore/check.ts`：開始前 errors=0 warnings=0；每檔完成後各跑一次；收尾 errors=0 warnings=4。四個新增警告恰為允許的待併年表事件，逐件對應列於下段。尚未完成正文的同批最小 JSON 曾有短文警告，收尾已清零，無未建立引用。基線與逐步／最終原始輸出留 `/tmp/cx-bf-deep-02/lore-baseline.log`、`lore-step-01.log` 至 `lore-step-10.log`、`lore-final.log`。
2. `npm run check` 全部寫完僅跑一次：content loader `OK 0 errors, 32 warnings`，ops 末行 `OK 0 errors, 10 warnings`。32／10 為既有 base 的警告輸出，本線未改 base；不宣稱全庫零警告。原始輸出 `/tmp/cx-bf-deep-02/content-check.log`。跑 node 前依共同規格先 pgrep，排除 sandbox 包裝命令的誤匹配後無實際重負載。
3. 固定 10 個新 content 檔存在，檔名均為 id name 段，與正式 manifest.files 一致；既有追蹤檔 diff 為空。開場已有未追蹤 `node_modules`，屬領導準備環境，本線未動；除這項基線外只新增本批十檔。最終核對證據 `/tmp/cx-bf-deep-02/acceptance.json`。
4. REPORT 已列全部先讀路徑；review-rows 合約 wf-table/1、10 列、白話均≤60字；inserts 同合約 1 列，timeline-add 同合約 4 列，欄位均依交接書。三表由 tabledb 的 Table.add／save 寫出，load 回讀核對。未直接寫既有檔。

年表新增四列：帆骨撐天（2107-06）、坡上還聲（2107-09）、第七哨白齒（2107-12）、門內灰虹（2107-08）。[timeline-add.json](timeline-add.json) 逐檔保留交接書原值，由合併線依日期插入。庫爾納蘆口不入確定年表，人物與孟買聽壁不新增年表。

[inserts.json](inserts.json) 唯一需求：`content/lore/factions/tide-creed.json` 的 `$.places` append `place/mumbai-resonant-wall`，只加地方導航。其餘九件無既有欄位要補，不擴充 schema。

## 沒做到或證據不足的

依指定範圍未套用年表與反向關聯；由領導合併後消除警告。本線不跑 npm test、content_accept、其他額外驗收；content_gate 由領導收件時執行。沒有工具阻塞，沒有尚待修復的本批錯誤。

## 需要決定的事

以下十個新名稱依交接書均待審，content 本文與 name 不帶設計標記：

- 魯帕・達斯（提案）
- 帆骨撐天（提案）
- 薩吉德・阿里（提案）
- 庫爾納蘆口（提案）
- 阿娜雅・帕特爾（提案）
- 坡上還聲（提案）
- 比娜・森（提案）
- 第七哨白齒（提案）
- 門內灰虹（提案）
- 孟買聽壁（提案）

既有可見度差異：`content/lore/places/mumbai-gate.json` 的 public body「2096 迦梨現身」段直接寫迦梨就在裡面及聲音，與 `content/lore/factions/tide-creed.json` 的 hidden secrets、W12 及本批外界未知口徑不一致。本批依指定規則只公開目擊光，歸因寫 rumor，未修改舊檔；是否統一舊地點可見度交領導決定。

四件待併年表警告的來源與交付對應如下：

- `content/lore/events/sail-ribs-hold-the-sky.json`：`未出現在 timeline`，對應 `timeline-add.json` 第 1 列（index 0），2107-06〈帆骨撐天〉；不進 inserts 重複追加。
- `content/lore/events/surat-voices-on-the-slope.json`：`未出現在 timeline`，對應 `timeline-add.json` 第 2 列（index 1），2107-09〈坡上還聲〉；不進 inserts 重複追加。
- `content/lore/events/seventh-post-salt-jaws.json`：`未出現在 timeline`，對應 `timeline-add.json` 第 3 列（index 2），2107-12〈第七哨白齒〉；不進 inserts 重複追加。
- `content/lore/events/mumbai-ash-halo.json`：`未出現在 timeline`，對應 `timeline-add.json` 第 4 列（index 3），2107-08〈門內灰虹〉；不進 inserts 重複追加。

無規格外新造具名角色、專名或概念詞，無其他矛盾。

## 以後交接書該點名的工具

沿用本次已點名的 lore check、npm run check、tabledb、inbox_poll 與 inbox_mail 即可。pgrep 的輸出可能匹配 sandbox 包裝命令，須辨認實際 node／npm 重負載行程；不必增加驗收條數。
