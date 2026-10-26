# 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/world/aegir.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`
- `wf/workflows/dispatch/handoffs/plan-epic/v3.md`（第 1 節、第 3.5 節歐洲段、文末裁示）
- `content/lore/factions/salt-gull.json`
- `content/lore/places/skagerrak-shell.json`
- `content/lore/events/skagerrak-shell-found.json`
- `content/lore/events/skagerrak-incident.json`
- `content/lore/characters/molly-van-den-berg.json`
- `content/lore/events/hunter-license-act.json`
- `content/lore/events/gull-anvil-truce.json`
- `content/lore/factions/anvil.json`
- `content/lore/places/saint-malo.json`
- `content/lore/places/istanbul.json`
- `wf/workflows/dispatch/handoffs/lead-aegir/cx-ag-01.md`

亦親自讀過主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md` 與交接書原檔 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/cx-ag-01.md`。上列相對路徑的內容取自隔離 worktree；交接書取自指定主 repo 絕對路徑。

補讀 SESSION-LOG、WAIT_USER、WORKFLOWS、inbox README／PROTOCOL、data-files、world-pillars 的 world／mechs 及其適用子檔；用詞以 terms-rename 的相關列核對，並讀過四個要插入的港城檔與 check.ts 欄位規則。上線 PROGRESS 已投遞 lead-aegir，每檔後均跑 lore check 與指定 inbox_poll。

## 做了什麼

本線 `cx-ag-01`，團隊 `teams/aegir`。按交接書順序完成兩個勢力、兩個地點、三個事件，再插入七個既有檔。

- `content/lore/factions/euro-umbrella.json`：寫國家席位、家族現金、援軍競標與四個必備小節，掛 G 傘政治線、N06 新加坡會議及聖馬洛九門同喪；body 679 字。
- `content/lore/factions/inner-sea-houses.json`：寫老家族土地、崩年船票與留地分支，掛 before-collapse-powers、magnates 穹頂下的錢及 polity 地契；帳款流向另以 rumor secret 記錄，body 484 字。
- `content/lore/places/genoa-yards.json`：寫公刻與型錄組機、家族印及外洋賒帳，掛兩岸分工、第一張標單與九門同喪；body 533 字。
- `content/lore/places/alpine-shell.json`：寫獵場圍籬、刻痕、骸片與入場費，掛家族地上的墟及學會談判；沒有加入古代機，body 505 字。
- `content/lore/events/first-bid-sheet.json`：寫成立文件與第一輪援軍分配，掛 N06 後成立的歐傘、G 線與既有 event/first-hunting-bands；body 517 字。
- `content/lore/events/aegir-lien.json`：寫茉莉簽抵押契、修機與守夜費、季度帳單，掛 2104 折損、2105 斯卡蓋拉克事件、2106 停火與獵牌法；body 520 字。
- `content/lore/events/aegir-wakes.json`：寫卡住吊臂的殘片、一小時撤離、拆件技工被認主與埃吉爾親手殺獸，掛既有出土與守墟故事；條目 hidden、明示開局尚未發生，歸矢與死亡後退回海裡僅列 hidden secrets，body 698 字。
- `content/lore/timeline.json`：加 2102 第一張標單、2106 埃吉爾的帳單、hidden 的 2108 沒上船的人；前兩筆在該年既有年-only 條目之後、月份之前，2108 在 2107-11-15 之後、所有 2108-01 之前；127 筆增至 130 筆。
- `content/lore/factions/salt-gull.json`：只在 relations 尾端追加歐傘與內海諸家兩列中立關係。
- `content/lore/places/skagerrak-shell.json`：只在 factions 尾端追加內海諸家。
- `content/lore/places/rotterdam-roost.json`：只在 factions 尾端追加歐傘，連回鹽鷗母港與競標。
- `content/lore/places/hamburg.json`：只在 factions 尾端追加歐傘，連回鐵砧與競標。
- `content/lore/places/saint-malo.json`：只在 factions 尾端追加歐傘，保留九門同喪日期與原文。
- `content/lore/places/istanbul.json`：只在 factions 尾端追加歐傘，保留堅盾產線與殘翼原文。

## 產出

內容共 14 檔：新增 7、既有檔插入 7。工作樹為 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-aegir/wt-ag-01/`，本報告為 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-01/REPORT.md`。本線未 commit。臨時腳本與工具輸出都在 `/tmp/cx-ag-01/`，報告目錄只寫本檔。

固定驗收四條的證據如下，未增加其他驗收：

1. 改前 `node content/lore/check.ts` 是 `errors=0 warnings=2`；最後一次於第十四檔寫完執行，末行仍為 `errors=0 warnings=2`，輸出 `/tmp/cx-ag-01/14-istanbul.log`。兩個 warning 都是原有事件 `events/busan-returned-seal.json`、`events/dark-quay-surety.json` 未在年表，沒有新增警告。
2. 全批寫完只跑一次 `npm run check`，exit 0，末行 `OK 0 errors, 8 warnings`；第一階段為 `OK 0 errors, 12 warnings`，警告位於未修改的 content/base。完整輸出 `/tmp/cx-ag-01/npm-check.log`。
3. 七個新檔存在，id name 段逐檔對應檔名；git status 為七個新內容檔、七個既有內容檔修改。已讀 git diff，既有值與陣列元素保留，僅插入上述元素；五個地點尾項新增逗號是 JSON 分隔所需。`node_modules` 在改前 status 已為未追蹤項，本線未建立或修改。content_gate 依交接書由領導驗收，本線不另跑。
4. REPORT 已直接寫在指定報告目錄，開頭為「已讀清單」。

逐檔 check 的暫時缺件均已消除：先寫勢力時尚未建立本批地點，會出現缺引用；事件寫完但尚未插入年表時，會出現缺年表 warning。新地點初稿照 README 通用欄加的 aka 被 checker 警告，已移除並重跑；最終結果見上。未把中間輸出當作最後驗收證據。

本線單代理完成，未啟用子代理，子代理成本為零；工具未提供實際計費數據，不推估費用。品質依據是既有原文保留、七個 body 均落在 300–1500 字，以及上述指定檢查結果。

## 沒做到或證據不足的

無交接書範圍內未完成項。領導的 content_gate 逐節點比對尚待領導執行，本線以差異閱讀記錄實際插入範圍，沒有聲稱已取得領導閘門結果。依交接書未跑 npm test 或其他額外驗收。

## 需要決定的事

本批均依交接書裁示落文，無需先決的新設定；以下是讀到的既有差異，保留供領導或後續設定維護線判定，不回改原檔：

- plan-epic/v3 第 1 節兩處把鹽鷗寫作「劍魚機」，既有 salt-gull、出土事件與新 aegir.md 都是長槍。本批寫長槍，不搬用劍魚。
- aegir.md／v3 有「十年零件庫」「十年改裝」及「2100 那位買家」的提案措辭，但出土已定 2102、開局 2108；本批依交接書把抵押定在 2106，敘述只寫「多年／這些年」，沒有補成十年或新增 2100 交易。
- G 傘政治線守線段寫「2105 鹽鷗鐵砧火併」，但既有 salt-gull、茉莉與 gull-anvil-truce 都把半年火併及停火放在 2106；本批照交接書與事件檔用 2106。
- 茉莉人物條目的承諾有「說好的撤退一定等」，本交接書則明訂認主夜一小時整照撤、技工未上船。本批照交接書寫她下令撤，未改人物原句；承諾是否限於約定撤離、與離船作業規矩如何並存，留後續維護判定。
- content/lore/README 通用欄說 place 有 aka，但 check.ts 的 places 未登記 aka；本批依既有地點格式省略 aka，維持原有 warning 數，不改格式契約或 checker。

## 以後交接書該點名的工具

沿用本次明列的 `node content/lore/check.ts`、`npm run check`、主 repo 絕對路徑的 `inbox_poll.sh cx-ag-01 --once` 與 `inbox_mail.sh cx-ag-01 --up` 即可。插入限制仍由領導的 content_gate 驗收；建議交接書說明分檔依序落地時，缺尚未建立的本批引用及缺年表 warning 會暫時出現，零錯與 warning 上限以全批完成輸出為準。無需增加驗收條數。
