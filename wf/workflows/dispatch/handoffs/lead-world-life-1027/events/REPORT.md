# 已讀清單

<!-- wf-nav -->
- `AGENTS.md`
- `wf/workflows/dispatch/handoffs/wl-events-1027.md`
- `wf/SESSION-LOG.md`
- `wf/WAIT_USER.md`
- `wf/WORKFLOWS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/world-pillars/world/tone-and-rules.md`
- `wf/workflows/content/world-pillars/world/monsters.md`
- `wf/workflows/content/world-pillars/world/factions-and-sandbox.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/world-pillars/mechs/bonds.md`
- `wf/workflows/content/world-pillars/mechs/ancient.md`
- `wf/workflows/content/world-pillars/mechs/mechanical.md`
- `wf/workflows/content/world-pillars/bio-battle.md`
- `wf/workflows/content/world-pillars/bio-battle/bio.md`
- `wf/workflows/content/world-pillars/bio-battle/battle.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/acceptance-playtest.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/events/valparaiso-borrowed-stretcher.json`
- `content/lore/events/antarctic-shell.json`
- `content/lore/eras/league.json`
- `content/lore/places/busan.json`
- `content/lore/places/gyeongju-tombs.json`
- `content/lore/places/quito.json`
- `content/lore/places/titicaca-ruin.json`
- `content/lore/places/alpine-shell.json`
- `content/lore/places/genoa-yards.json`
- `content/lore/factions/busan.json`
- `content/lore/factions/third-blade.json`
- `content/lore/factions/quito.json`
- `content/lore/factions/shell-society.json`
- `content/lore/factions/inner-sea-houses.json`
- `content/lore/factions/selene.json`
- `content/batches/2026-10/wl-events-1027.json`

另用主樹 `wf/tools/tabledb.py` 的 `load` 讀取 `lead-world-life-1027/lore-plan.json`，僅取 category=events 最後六列（索引 6–11）；templates.json 僅查 lore 範本列。所有規則讀主樹最新版。

## 做了什麼

依最新計畫完成六篇事件正文，各三節、412–481 個中文字。使用匿名地方人物，以當下行動呈現利益衝突：守軍追捕受攤販阻止、學會助手卸責、地方主管背約、家人爭執婚喪、代理侵占署名、屋主救鍋仍逐欠租者。沒有把每篇收成認錯或悔悟。

已核對六處地點與相關勢力、時代、指定範本及同地既有事件摘要；名稱與 id 在主樹及隔離區寫入前均無命中。避開百燈破圍、同旗之約、釜山還印、出塢一踏、兩處古代機出土及船廠出售。釜山使用劍魚-III；慶州倒的是當代遮棚；基多背約由地方主管負責，保全為受雇匿名人員。古代機、先民史與勢力外交均未增補。

計畫的「嫌隙留到開場」改成「嫌隙留到翌年」，正文與玩家可見文字不含「開局／本作／開場」。未發現需要改動契約的計畫矛盾；通用工作流的安裝、npm、試玩與收線要求依本次 brief 和使用者指示延後。

## 產出

全部內容位於 `/mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wl-events-1027/content/`；六個新檔與一個年表插入檔，完整檔名、白話及既有掛接見本類 [review.json](review.json)。

六個概念為魚市止火、雨揭舊頂、撤席之夜、婚毯留白、炭紙換主、共灶斷煙。年表只插入本批六條，日期全在 2107 年，沒有 occurs=possible。

固定檢查一：Python 標準庫檢查回傳 0；六個概念與全部配套存在、JSON 可解析、id 與檔名一致；新內容檔恰六件，修改檔僅 timeline.json。各篇正文漢字數依審閱表順序為 425、412、451、446、431、481，各三節；引用均指向隔離區既有檔。年表 222 → 228，剔除本批六條後與 HEAD 舊 entries 完全相等，舊內容與相對順序未改；整體日期排序正確。敘述用語檢查無出戲詞或指定禁用詞命中。

固定檢查二：在自己的 worktree 執行 `git diff --check`，回傳 0、輸出空白。主樹工具以 brief 指定的兩個絕對路徑執行路徑閘門，回傳 1：

```text
VIOLATION content/lore/timeline.json MODE 檔案權限變更
FAIL batch=wl-events-1027 mode=add approved=6 violations=1
```

主樹 `wf/tools/content_gate.py` 檢查六個新事件路徑均准入。唯一阻塞是年表權限：`git ls-tree HEAD content/lore/timeline.json` 為 100644；`stat` 回報 777。已只對允許的隔離區 timeline.json 執行 chmod 644，stat 仍為 777；再次跑閘門仍是同一項 MODE 違規。未修改工具、manifest、掛載或 Git 設定來繞過檢查。

固定檢查三：REPORT、review 存在；review 為 wf-table/1，由主樹 tabledb 的 add/save 寫入，恰六列，白話皆非空且不超 60 字；REPORT 含 manifest 的五份 mustRead 路徑與整合未驗聲明。容量以七份內容檔完整大小加 REPORT、review 計算，不超過 1 MB；白話依序為 31、33、35、34、33、35 字；完整交付合計 112406 bytes（七份內容檔加 REPORT、review）。

## 未做與證據不足

整合驗收與平衡未驗，明確延到家裡。未執行 lore 的 Node 驗證器、content_accept、npm、sim、MCP、整合測試、黃金重錄或試玩；未安裝、上網、派子代理、commit/push。主樹僅寫本類 REPORT/review；未改主樹 content、其他線、索引、manifest、src、schema 或 spec。未將批次標為 accepted。

三條固定檢查中，第一與第三通過；第二的空白檢查通過，路徑閘門仍因上述 MODE 違規失敗，不能稱完整格式閘門通過。

## 需要決定

敘事沒有新增待裁決事項。需調度者在能保留 Git 檔案權限的工作環境收取七份內容，核對六條年表插入並重跑原路徑閘門；目前指定隔離區的 chmod 無法清除執行權限。公司環境的本線授權不含搬移 worktree 或改掛載設定，因此保留現場及失敗證據。回家再依主線安排整合驗收與平衡，不宣稱完成正式收線。

## 主線收件註（2026-10-27）

使用者已授權年表 WSL MODE 誤報本次例外手動帶回；主線已收取六篇事件與六條年表，六類合計 34 概念、52 個新 JSON 與六條年表全部帶回。上方原 gate 失敗歷史保留，這次例外不是 gate 改為通過。全部維持 draft、未 commit，整合驗收與平衡留回家。
