# 第2輪 factions：六概念隔離區產出

已讀清單（親讀主樹最新版；資料表只作定向查詢）：

```text
AGENTS.md
wf/WORKFLOWS.md
wf/workflows/common/user.md
wf/SESSION-LOG.md
wf/WAIT_USER.md
wf/workflows/team-model.md
wf/workflows/dispatch/README.md
wf/workflows/dispatch/content-batch.md
wf/workflows/dispatch/handoffs/wn-r2-factions-1027.md
wf/workflows/common/data-files.md
content/lore/README.md
content/lore/style.md
content/lore/style/people.md
content/batches/2026-10/wn-r2-factions-1027.json
wf/workflows/dispatch/handoffs/lead-world-next-1027/round2-plan.json（定向讀 factions adopt 六列，另讀林藏序與阿喬亞兩列作行動對照）
wf/workflows/dispatch/handoffs/lead-world-next-1027/round2-plan-review.json（定向讀 factions 六列 requiredConstraints）
wf/workflows/content/README.md
wf/workflows/content/abilities-effects.md
wf/workflows/content/acceptance-playtest.md
wf/workflows/content/ancient-people.md
wf/workflows/content/batch.md
wf/workflows/content/battle-field.md
wf/workflows/content/bio-monsters.md
wf/workflows/content/lore-text.md
wf/workflows/content/mechs.md
wf/workflows/content/numeric-bands.md
wf/workflows/content/ops-content.md
wf/workflows/content/playtest.md
wf/workflows/content/polish.md
wf/workflows/content/world-pillars/bio-battle/battle.md
wf/workflows/content/world-pillars/bio-battle/bio.md
wf/workflows/content/world-pillars/bio-battle.md
wf/workflows/content/world-pillars/mechs/ancient.md
wf/workflows/content/world-pillars/mechs/bonds.md
wf/workflows/content/world-pillars/mechs/mechanical.md
wf/workflows/content/world-pillars/mechs.md
wf/workflows/content/world-pillars/world/factions-and-sandbox.md
wf/workflows/content/world-pillars/world/monsters.md
wf/workflows/content/world-pillars/world/tone-and-rules.md
wf/workflows/content/world-pillars/world.md
wf/workflows/content/world-pillars.md
wf/workflows/content/templates.json（定向讀 lore 範本列）
content/lore/factions/anvil.json（每列計畫共用範本，完整 JSON）
content/lore/factions/inner-sea-houses.json
content/lore/factions/dome-households.json
content/lore/factions/backside.json
content/lore/factions/shell-society.json
content/lore/factions/far-herd.json
content/lore/factions/chittagong-breakers.json
content/lore/factions/old-arms-makers.json
content/lore/factions/wl-kept-bowl-circle.json
content/lore/factions/wl-torn-curtain-troupe.json
content/lore/factions/wl-afterbeat-hunters.json
content/lore/factions/wl-slant-sun-rope.json
content/lore/factions/wl-reed-knot-seed-circle.json
content/lore/factions/wl-snowkey-guides.json
content/lore/places/tranquility-city.json
content/lore/places/accra.json
content/lore/places/mombasa.json
content/lore/places/sydney.json
content/lore/places/auckland.json
content/lore/factions/accra.json
```

## 已做

依核准計畫完成六篇勢力草稿，領導的 requiredConstraints 優先。所有 body 含傭兵補給與外交；沒有替小社創造古代機、研發血統、兵權或傘席位。命名沿用核准中文，英文原名存 aka，意涵存命名表。

六篇保留不同反應：空冠仍靠家財、缺角既愛物也爭展位、白結各家分別續託或撤回、鹽印互扣拖索、沉矢只交回私留件、百味各自署名爭客。白結主軸是交接失敗之後的授權，不含錯名、替身或現場自揭，與阿喬亞計畫明確分開。缺角只寫普通人工件與觀看欲，不重演林藏序的戰史誤擊改景。

創作前親讀計畫列指定最近既有全文；交稿後再比主樹勢力與 wl-* 六篇。逐列比較行動、利益衝突、場景功能，證據與全文 SHA-256 留在 review.json；主樹未提交 wl-* 只供查重，未成為 lore 引用。

固定三條有限驗收：

1. Python 解析六個 JSON，檔名與 id 相符，必填欄齊全；精確吻合六列 targetFiles。body 含標題與標點為 554–590 字、純中文字為 486–520 字。逐一核對 22 個引用 ID，均為 HEAD 已有或本批自身。worktree 僅六個新增內容檔，無舊檔修改，未超過二十檔；正文與簡介禁用詞未命中。
2. 主樹 content_gate.py 配隔離 worktree 與唯讀 manifest 回傳 0，approved 恰六檔、violations 空；同 worktree 的 git diff --check 回傳 0、無輸出。這是路徑與空白檢查，不代表 lore 或整合已正式驗收。
3. review.json 恰六列，各有具體最近既有 ID／檔案、全文閱讀來源、實質差異，plain 最長 32 字；naming.json 恰六列，英文原名皆在 aka、含意涵。REPORT 開頭已列 manifest 五份 mustRead。

## 產出

隔離區：`.git/wf-worktrees/wn-r2-factions-1027/content/lore/factions/`。六個 JSON 分別為空冠社、缺角藏會、白結換俘社、鹽印分獵盟、沉矢獵團、百味航桌；精確檔名見 [審核表](review.json)。

另交 [命名表](naming.json) 與本 REPORT，共九個交付檔。內容合計 17,035 bytes；內容與三份報告合計 42,070 bytes，低於 1 MB。每個內容檔皆小於 3 KB。全數保留 draft，未帶回主樹。

## 未做與不足

未跑 node、npm、test、typecheck、build、sim、probe、MCP 或 content_accept；未安裝、上網、開 GUI、commit、push、刪檔或開子 agent。未寫主樹 content、manifest、index、年表、SESSION／CLAIMS、src、schema、spec 或其他隔離區。

未完整驗收，不稱 accepted。整合、平衡與試玩留家中，由領導依序進行。新項目是 lore，不宣告遊戲中的新分獵、換俘或銷兵機制；凡鐵依既有設定只傷人，機甲核心未寫成日常消耗物。

## 需決定

沒有需先行裁決的機制矛盾。領導與使用者仍需審六篇的敘事基調，以及是否接受各篇保留的利益與未解爭執；正式驗收與帶回主樹由領導續辦。本線未發 inbox，原生回傳交付。
