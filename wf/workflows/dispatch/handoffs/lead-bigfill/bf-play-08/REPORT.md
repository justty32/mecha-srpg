# 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-08.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/bf-play-08.manifest.json`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/moon-hooks-review.json`
- `wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/ops-hooks.json`
- `wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/review-draft.json`

上述 manifest.report.mustRead 路徑原樣保留；AGENTS.md 親讀主 repo 的原檔。計畫、裁決與資料表從主 repo 唯讀；表格透過 tabledb 定向讀取。逐檔欄位、觸發、text規格、掛點與插入需求均讀 moon-hooks-review 的0–17列；ops-hooks 的0–9列及 review-draft 的相關月面列均已親讀。沒有把設計欄位抄入遊戲檔。

正式 manifest：`/home/lorkhan/repo/game_dev/mecha-srpg/content/batches/2026-10/bf-play-08.json`。其 base 與 worktree HEAD 同為 `8a48e7ef3e982b278e382d8a166cfc05a8564428`；計畫區 manifest 的 TBD 是草稿，本線未修改任一 manifest。

另讀 SESSION-LOG、WAIT_USER、WORKFLOWS、data-files、inbox 入口、fill-rulings、plan-tone-review/review、history-lines 及 world-pillars 三子檔導航。依本批範圍不登記其他 wf 檔，ROSTER 交領導代登記。

逐檔範本原文已親讀，同範本的檔案逐項核對欄位：

- `content/base/world/encounters/insect-shallow.json`
- `content/base/world/contracts/defend-citywall.json`
- `content/base/world/actions/board-rival-carcass-claim.json`
- `content/base/world/contracts/scout-rift-margin.json`
- `content/base/world/encounters/rift-alien-shallow.json`
- `content/base/world/events/news-tide-street-sermon.json`
- `content/base/world/events/news-selene-courtesy.json`
- `content/base/world/dialogues/ren-kasai-empty-chair.json`
- `content/base/world/dialogues/ilse-brandt-hull-oath.json`
- `content/base/world/dialogues/mara-okoye-spare-hand.json`

另外親讀 `content/base/world/events/ruin-before-tide-glow.json`、`restraint-empty-rack.json`、`port-farside-sealed-crate.json` 的原文，核對耗材、加班與既有暗面旗標；親讀新加坡與兩家既有雇主檔。

逐檔 lore 掛點均讀以下原檔的公開 summary/body，未將 secrets 用作玩家已知事實（月面新檔尚在指定 worktree）：

- [place/earthward-gallery](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-01/content/lore/places/earthward-gallery.json)
- [event/whitewall-at-gate](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-01/content/lore/events/whitewall-at-gate.json)
- [event/moonbow-silent-line](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-01/content/lore/events/moonbow-silent-line.json)
- [place/lunar-letter-counter](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-02/content/lore/places/lunar-letter-counter.json)
- [place/tranquility-repair-dock](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-02/content/lore/places/tranquility-repair-dock.json)
- [place/ferry-nostos](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-02/content/lore/places/ferry-nostos.json)
- [faction/lunar-ferry-crews](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-02/content/lore/factions/lunar-ferry-crews.json)
- [event/whitegloves-come-ashore](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-02/content/lore/events/whitegloves-come-ashore.json)
- [event/return-fare-queue](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-02/content/lore/events/return-fare-queue.json)
- [place/dark-quay-night-slip](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-03/content/lore/places/dark-quay-night-slip.json)
- [place/white-armour-loading-hall](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-03/content/lore/places/white-armour-loading-hall.json)
- [event/dark-quay-inspection](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-03/content/lore/events/dark-quay-inspection.json)
- [event/dark-run-under-bow](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-03/content/lore/events/dark-run-under-bow.json)

# 做了什麼

cx-bf-play-08／teams/bigfill，只新增本批18個營運檔：3份契約、3份遭遇、3張世界發包牌、6件港口事件、3則候鳥號對話。全部在地球新加坡，沒有月面營運、月面地圖、萬潮葬王或AI產物。

修船件用 survive 8 與可選鹽針擊殺；暗面備件用砂扇 killTarget；白甲候卸用 hold 6 與可選抱樁擊殺，不填 zone。各組 encounter 除 id 外沿同族 shallow；契約名稱保留獸與當班急迫理由。人、貨與白甲作動機，沒有偽造護送單位或完成條件。三組吼句方向分別為「架可以再搭，人先退！」「天路借到了，地上這一步打出來！」「白甲站住，活人先走！」；契約沒有可承諾顯示的brief欄，未加description或把吼句塞進不存在的欄位。

世界牌均 world／100／8，月份、指定日期、新加坡tag、posted與雇主聲望全部保留；暗面組另檢查 farside-prices-known。僅投遞同組契約，再記posted，未承諾補發。

六事件均 node／weight2，有月份、指定日、新加坡tag、seen限制；第一選項只seen，第二選項有現金、聲望、耗材或士氣代價，扣帳具餘額門檻。文字114–134字（長廊125字），每件有指定氣味、聲音與既有名詞；6/6有奇觀或吼句。2098／2105罷工與2107查貨、工作影像明示年份，當下觀看地點在新加坡。家書僅一件；不拆信、不判死、不承諾回信。白甲無魂無核心、不會對獸使招式；暗埠只查外側入口、仍開，未揭止步謎底。

三對話沿規格三句，每句≤40字，僅既有三名船員；一個topic、兩選項均seen、無永真後話，第二選項本人士氣+1。bf前置排序依明示例外；本人仍須在名冊且同房間，其他較早一次性題可能先成立。

# 產出

content 合計 21,953 bytes，最大 1,829 bytes，均在容量門檻內。review-rows.json 恰好18列、白話最長33字；naming.json 18列，nameEn留空，不造英文aka；inserts.json 4筆append且已去重。每件的 lore id＋節點／主線見 review-rows。

`git status --short` 原文：

```text
?? content/base/world/actions/board-bf-moon-dark-parts.json
?? content/base/world/actions/board-bf-moon-dock-parts.json
?? content/base/world/actions/board-bf-moon-white-cargo.json
?? content/base/world/contracts/bf-moon-dark-parts.json
?? content/base/world/contracts/bf-moon-dock-parts.json
?? content/base/world/contracts/bf-moon-white-cargo.json
?? content/base/world/dialogues/bf-ilse-brandt-moon-departure-command.json
?? content/base/world/dialogues/bf-mara-okoye-moon-white-armour.json
?? content/base/world/dialogues/bf-ren-kasai-moon-dock-command.json
?? content/base/world/encounters/rift-z-bf-moon-dark-parts.json
?? content/base/world/encounters/rift-z-bf-moon-dock-parts.json
?? content/base/world/encounters/rift-z-bf-moon-white-cargo.json
?? content/base/world/events/news-bf-moon-dark-lamps.json
?? content/base/world/events/news-bf-moon-two-strikes.json
?? content/base/world/events/port-bf-moon-earthward-screen.json
?? content/base/world/events/port-bf-moon-letter-light.json
?? content/base/world/events/port-bf-moon-return-light.json
?? content/base/world/events/port-bf-moon-white-steps.json
?? node_modules
```

18檔均為未追蹤新檔，與正式manifest.files完全相等；tracked與staged diff均空。`node_modules` 是領導預置符號連結，開場已存在，不算產物。未commit。

三項指定檢查：

- `npm run check`：exit 0，末行 `OK 0 errors, 10 warnings`。
- `node src/ops/content/check.ts content/base`：exit 0，末行 `OK 0 errors, 10 warnings`，新定義已載入並通過格式／引用檢查。
- `npm run typecheck`：exit 0。

`npm run check` 內核心階段為 `OK 0 errors, 32 warnings`，營運階段為末行 `OK 0 errors, 10 warnings`；單獨ops check亦10 warnings。核心32條包含怪獸捕獲層HP差異10、mx-faded迴避帶1、instinct上界未覆蓋19、kx-tide-crush傷害帶1、infantry無預設攻擊1；營運10條都是前述怪獸捕獲層HP差異。42條輸出逐一確認指向檔案與HEAD原文相同，沒有本批新檔警告。完整檢查與負載紀錄在 `/tmp/cx-bf-play-08/` 的 check.log、ops-check.log、typecheck.log 及 load-before-*.log。每次node檢查前皆跑指定pgrep；只有自身sandbox祖先指令字串誤匹配，沒有其他重負載程序，不自取鎖。補明長廊影像年份後，兩項內容檢查已重新通過。

是否改黃金：接線後會。port tag讓世界牌／事件進候選池，contractKinds讓既有雇主能生成三模板，將改世界抽選與契約軌跡。對話抽題不耗RNG，但實際talk會改旗標／士氣。本線未改黃金、未重錄。

# 沒做到或證據不足的

inserts 尚未套用：新加坡tags append一次，白手套contractKinds append兩個，鹽鷗append一個；合併線若已套同值便跳過。未改既有地點、雇主、池、領土、presence或actionLanes。月面lore由合併線同時入庫，只在本批掛點與自然語言中使用，無假loreRefs欄。

目前只證明定義載入及格式／引用通過；新加坡tag尚未接入，因此不能宣稱候選已可抽或玩家實際遇到，更不能宣稱月面新地點可航往。沒有試玩、生成情境探針或全套測試證據。

依交接固定限制，未跑全套npm test、e2e、sim、fuzz、content_accept；全批接線驗證與唯一一次黃金重錄交領導。指定遭遇width=D，依計畫先同族D兩隻、指定D缺席才補，指定C必補；C:1不代表固定C伴隨。這是沿既有計畫的引擎邊界，非本線新增實測。

# 需要決定的事

無本批新增專名、衝突或阻塞。新標題是既有詞組合；月面原批名稱的提案狀態仍保留，本批不替它們定案。正式manifest已備妥，草稿TBD不影響本線執行。後續郵務、船班、艙位與月面落點等候選不在本批擴寫。

# 子代理

未開子代理。

# 以後交接書該點名的工具

沿用 tabledb、git status、pgrep、check／ops check／typecheck、inbox_poll與inbox_mail即可。正式manifest應像本次一樣由領導預置並填base；工人從主repo唯讀，不要求worktree內也已有正式manifest。
