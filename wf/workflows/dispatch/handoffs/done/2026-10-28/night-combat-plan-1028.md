# 任務：設計兩台機甲與兩種怪獸的下一輪可玩內容
先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`及適用子檔、`wf/workflows/content/mechs.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/acceptance-playtest.md`、`content/lore/style.md`，依需求讀spec格式，不改引擎。
## 背景與唯一目標
使用者要持續填充到23:00台北；剛整合6機8怪8人，另一線寫生活lore。本線astra設計小批可玩戰鬥內容，避免只堆日常人物與換名變體。先設計再交sol實作，為驗收留時間。
## 範圍
只寫 `wf/workflows/dispatch/handoffs/night-combat-plan-1028/` PLAN/review/REPORT/規畫資料；全repo內容與已匯入exm/exk/exp唯讀。不做：實作JSON、引擎改造、技能新機制、填補backlog、SS/SSS、改既有單位、宣稱正式平衡、派子agent。
件數 gate：固定2台機械系機甲＋2種怪獸（以真正區別行為/部位/代價為準，可同物種變體但不能只換數值）共4概念、最多20設計附件；預計每類實作批≤20新內容JSON；容量 gate：設計附件總共2MB。
## 必用工具
| 工具 | 用途 |
|---|---|
| `python3 wf/tools/tabledb.py` | content index/engine-facts/numeric-bands/templates有界查詢 |
| `rg` | ID/引用/近似角色查重 |
| `git show` | 必要來源核對 |
## 資源與禁區
**唯讀調查線**：只寫自己設計交付目錄。子代理上限0。不得npm、sim、probe、全套或其他測試，不開GUI、不碰鍵鼠螢幕、不下載、不刪檔、不git commit/push/reset/rebase。現有引擎能力不確定就查原碼的單點實作與測試，不憑描述推斷支援；先讀conventions/code-map再看原碼。
## 工作
1. 優先C/B級可控成本，機械系依既有藍本/系列/等級；怪獸不創違反W/B守則的族別。和庫內及匯入22件比定位、部位、招式與代價，指出最近2例與差別。
2. 每單位給輪廓/用途/弱點、可執行配裝/部位/能力引用、AI可用性依據、數值帶與同級參照。盡量重用有效既有能力，必要才新增能力/效果，不能為辨識度杜撰引擎功能。不以無法驗的設定文字假裝戰鬥區別。
3. 提供兩個互相獨立實作批（機甲2、怪獸2），新檔全部 night-cm- / night-ck- 前綴，各一展示情境與完整明列檔清單/引用；不改既有市場/招募/時間線/黃金。每批合法既有基準對手與5seed方案、新能力覆蓋、1場MCP auto＋3回合合法操作設計，方便sol驗收。
4. 新frame若需model資料先標取得範圍與聲望限制，不繞過國家/勢力機聲望裁示；可先是展示可用、尚未接營運取得，必須誠實標示。資料白話每件≤60字，基調太空歌劇，避免硬科幻。
5. 規畫完成回主線核可，不開工。若時間不夠優先交機甲批，再交怪獸批。
## 交付
直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-plan-1028/REPORT.md` 與 PLAN.md、wf-table/1 review.json。REPORT首段已讀清單，四段產出/證據/限制/需要決定。僅工具回傳。
## 驗收（固定 3 條）
1. 4概念的review具體欄位齊全，每件2個近似對照與差異，未占用新id已核。
2. 每批精確寫集≤20、每個引用存在且引擎支援有證據、參照與展示驗證方案可執行。
3. PLAN與REPORT存在，無內容或源碼改動；未決與僅展示限制明列。


## 行政收線證據（2026-10-28）

主線以原生工具確認本 brief 已終局，明確授權此次搬移；此為派線行政收尾，非本輪內容整合全過。原文保留如上，附件與 reportDir 留在原處：[原位置 REPORT](../../night-combat-plan-1028/REPORT.md)。相關 commit：`7314fc6b／5680c463（設計與診斷）`；指定 commit 已以唯讀 git log 核存在，原始驗證結論以 REPORT 為準。

原始 brief SHA256：`bc822e9bc7ccc0bb51cd7b613b972dc02a061fce2482ccf7e1244861e9aef7dd`。原生終局來源為主線本次指示；Sagan 設計 agent 已 close，Socrates 前輪 verify 已 DONE、復用待 GO。其他四份 brief 尚未獲搬移授權，Pasteur 仍處理 pilot／R2；最後 suite 與收尾 commit 待主線補。
