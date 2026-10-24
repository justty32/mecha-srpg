## 已讀清單

- `AGENTS.md`（親讀主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/world/essence.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/dispatch/handoffs/lead-reconcile/guide.md`（通則與 sea、souls、faith、politics、dark、fix、sky 全節）

另讀 `wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、inbox README／PROTOCOL、world-pillars 的 world／mechs 導航與 mechanical／factions-and-sandbox 守則。以 `python3 wf/tools/tabledb.py …/history-reconcile.json grep '公刻|31|三十一|銀環|長槍|背面'` 查 R08、R13、R14、R21 等裁示；核對年表 2102「銀環墜機・長槍流出」。

## 做了什麼

cx-rc-09 依 guide 修正秦望舒公刻血統，以及墨西哥城與南亞創始 31 城的關係。只修改指定文字欄；未 commit，未改索引、manifest 或其他工作樹檔案。終局狀態：BLOCKED。長槍檔的白名單矛盾已向上游發 REQUEST；多次輪詢未收到補授權，保留原檔供上游處理。

指定檢查本輪實跑：`npm run check` 末行 `OK 0 errors, 8 warnings`；`node content/lore/check.ts` 為 `errors=0 warnings=2`。前者警告為範圍外怪獸 capture layer HP，後者為 busan-returned-seal、dark-quay-surety 未列年表。日誌在 `/tmp/cx-rc-09/check.log`、`/tmp/cx-rc-09/lore-check.log`。未跑 npm test 或額外驗收。

件數／容量：目前只改 2 個指定檔，`node_modules` 為開場即有的未追蹤項；秦望舒 4566 → 4558 bytes（-0.18%），墨西哥城 2196 → 2211 bytes（+0.68%），長槍仍 490 bytes。未觸發 3 檔／30% 閘門。

## 逐檔對照

### content/base/world/lineages/universal-longspear.json

尚未改，非「無需改」：`traits.silhouette` 中「2101 年」「吉大港外海」應為「2102 年」「孟加拉灣」。交接書僅對 lore 加開 silhouette 欄位，待上游補明確允許。年份位於敘述字串，並非數字型別欄位。

### content/lore/characters/qin-wangshu.json

- summary：「造出衍一與長槍、把長槍刻給全世界」→「造出衍一與堅盾、把堅盾刻給全世界」。
- body 小標：「衍一與長槍」→「衍一與堅盾」。
- body 公刻段：「長槍是全世界的長槍：長槍-V1、AT-12、吉大港的長槍-V4」→「堅盾是全世界的堅盾：各地照公刻圖造出的機甲」。避免仍把長槍型號接在堅盾公刻血統上。
- body 留下的段：「誰都能仿的長槍」→「誰都能仿的堅盾」。
- tags 中文標籤：「長槍」→「堅盾」；陣列長度未變。
- dark 無需改：僅有拓片「背面」，屬物件本義。

### content/lore/places/mexico-city.json

- body 誰在這裡：「殘聯最大的北美成員」→「殘聯在北美的契約窗口」。保留區辦事處與契約功能，不把墨西哥城列作南亞傘成員。
- body 成立段：「墨西哥城是 31 城邦之一」→「南亞 31 城邦組成殘聯，墨西哥城的區辦事處成了北美契約與獵牌的窗口」。

## 殘留

按交接書原命令對 content 跑 `git grep -nE '潮差|背面|複本|迦梨|歸還黨|九闕|聖保羅|浦那'`，全輸出僅存 `/tmp/cx-rc-09/residuals.log`，逐檔判讀本批 3 檔：

- 秦望舒 body「刻痕拓片，背面寫著」：1 處「背面」，為拓片反面，依 guide dark 保留。
- 長槍、墨西哥城：上述詞均無命中。
- 三檔均無「潮差」，亦無勢力義「背面」。範圍外命中未改。

## 沒做到或證據不足的

長槍 `traits.silhouette` 尚待欄位授權。未改 base，故暫未執行僅在改到 base/world 時要求的 ops content check。其餘指定檢查已通過。

## 需要決定的事

解除條件：上游補明確允許本批 base `traits.silhouette` 並對齊閘門，或指定此檔由上游修正。交接書原文為「lore 檔另可改敘述欄」才列 `silhouette`，通用白名單未列此欄；指定檔卻位於 base。已於開工後發 REQUEST，多次輪詢未收到答覆，不自行擴大白名單。沒有測試工具故障或沙箱拒寫；本次阻塞僅是交接範圍矛盾。

## 子代理

未使用；子代理成本為零。3 檔由本線親自判讀、改寫與檢查。

## 以後交接書該點名的工具

無。
