# 已讀清單

本線 `cx-mf-02`／`teams/mech`，2026-10-26。下列指定檔案均親自讀取；相對路徑以隔離 worktree 為根，主 repo 的 AGENTS.md 與 PLAN.md 另以交接指定絕對路徑讀取，資料表以指定工具分段讀取。

規矩與入口：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/polish.md`。

設定與文體：`content/lore/style.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/history-lines/c-essence.md`。

計畫與寫法：`wf/workflows/dispatch/handoffs/lead-fill-mech/plan-02/PLAN.md`、`wf/workflows/content/mechs.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/dispatch/handoffs/lead-fill-mech/cx-mf-02.md`。

另讀開場進度、等待清單、WORKFLOWS 路由、資料檔與 inbox 契約、機械系守則、相關改名表、計畫六列 review 草稿，以及 templates 與計畫點名的部件範本。未使用子代理，子代理成本為零；無可核對的本線 token／金額統計，不估填。

## 做了什麼

六件均依 PLAN 第三節落檔，以下名稱均為提案名；slot、size、mass、hp、層位置與加值照計畫，數值未做平衡。

`content/base/components/oa-leg-brace.json`：承步腿架掛到鐵劍公刻、達卡織工及舊軍工換件供應，沿複合裝甲的25 HP層改護 legs，占 armorMount 而讓出胸甲；與計畫數值及取捨無出入。

`content/base/components/oa-hydraulic-assist.json`：順行液壓組掛到軍械庫、2107獵犬授權後的維修訂單，只借躍潮噴口的迴避+2與部件耐久，占 systemMount；與計畫數值及取捨無出入。

`content/base/components/oa-arm-mantlet.json`：擋矢臂甲掛到鐵砧、2093-09首批堅盾仿造與舊軍工甲板供應，在 right-arm 插25 HP層，占一個 weaponMount；與計畫數值及取捨無出入。

`content/base/components/oa-sight-cradle.json`：定準靈目座掛到2100堅盾-II與2104長槍-V4定版後的接口加工，只借鷹瞳靈目的命中+6，占 sensorMount，保留高階靈目外購限制；與計畫數值及取捨無出入。

`content/base/components/oa-cockpit-baffle.json`：護艙隔板掛到崩年人員損失、軍械庫與2106公發，25 HP層插在 torso 的第1位，占 cockpit，未改座位或傳導；與計畫數值及取捨無出入。

`content/base/components/oa-vent-rack.json`：敞背排燼架掛到長槍量產與拆船幫訂單，照霜鰭的 heat regen -8改占 backMount，正文保留C級精粹與量產件外購門檻；與計畫數值及取捨無出入。

文字存放有一處相對計畫的補充：現行 `ComponentDef` 已提供 `nameEn`、`etymology`，故英文原名與中文意涵除了命名表，也寫入這兩個既有文字欄；etymology 同時保留計畫掛點與配裝代價。未新增 schema 欄位，未自造 desc。六件皆 mechanical、空 pools、空 abilities；護甲層沿範本不另加部件 hp。

## 產出

內容檔位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-mech/wt-mf-02/content/base/components/`，逐檔路徑如上。本目錄交付 [naming.json](naming.json)、[review-rows.json](review-rows.json) 與本 REPORT。兩張表先手建 `wf-table/1` 空表，再由交接指定的 tabledb add 寫入；review 以 plan-02 草稿第0至5列為底稿，名稱依實際產出對齊並保留「提案名」。

固定四條驗收結果：

1. 每寫完一檔即跑 `npm run check`，共六次均 exit 0；最終載入60件 component，末行 `OK 0 errors, 8 warnings`。最後一次完整輸出存 `/tmp/cx-mf-02/check-final.log`。
2. 六個指定 oa 檔均存在，檔名等於 id 的 name 段；件數6，最大717 bytes，未觸發6件／12 KB停工 gate。
3. naming 與 review 表各6列，欄位依交接指定；白話逐列不超過60字，名稱與六個實際新檔對應。
4. 本 REPORT 存在，開頭即「已讀清單」，列全交接指定路徑。

## 沒做到或證據不足的

授權範圍內無未完成項。check 的 base 階段12個警告、ops階段8個警告均指向本批未修改的檔案；沒有為消警告擴張範圍。數值沿既有件暫填，尚未聲稱平衡完成。依固定驗收不跑 npm test、額外 lint、煙霧或MCP；索引、批次帳本、預設配裝與主庫整合留領導處理。未 commit。

## 需要決定的事

本批無新增待裁示事項。PLAN第五節已列的燕鷗／長槍血統、堅盾／長槍定位殘留、長槍授權與量產年份、塞勒涅量級及C級外購文字落差，均沿計畫建議讀法，不改任何既有來源。新件不宣稱專屬血統，也不讓舊軍工自行取得核心產能；公刻仍只給D級地板，C級精粹與量產件仍須外購。

## 以後交接書該點名的工具

本次必用工具均已點名，無新增。可補充要求最後一次 check 的輸出存到指定 scratch 目錄，方便領導直接取證；現行 nameEn／etymology 欄位也可在計畫與範本說明中同步，避免把合法命名欄當作不存在。
