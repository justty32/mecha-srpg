# lead-mech2 產出線共同規格（四批交接書都引用本檔）

[計畫](plan/PLAN.md)｜[review 草稿](plan/review-draft.json)

本檔是**領導審過計畫後的定案與修正**，與 PLAN.md 衝突時以本檔為準。

## 領導審計畫的修正（必照）

1. **移動類別是真的規則，不只是標籤**（PLAN 第五節錯了）：`src/rules/movement.ts` 讀 frame tags 裡的 locomotion 值（leg／track／hover／flight／burrow），各地形 `moveCost` 依類別不同（flight 在牆、塔、酸沼都 1；hover 在淺灘、裂渠、酸沼 1；track 進不了酸沼與裂渠；burrow 可穿殘牆、進不了淺灘）；locomotion 部位全毀就不能動。所以**每台新 frame 必帶對應 tag**：`m2-wheel-d`、`m2-gantry-c` → `track`；`m2-keel-b` → `hover`；`m2-splitwing-a` → `flight`；四足、六足 → 不帶（預設 leg）；**例外 `shellsoc-archive-b` 帶 `burrow`**（學會掘進測繪，可鑽牆、不能下水）。既有骨架照同骨架既有機（`mx-hover-c` 帶 `hover`）。
2. **排燼扶架不要人人都掛**：`shellsoc-archive-b` 拿掉扶架，改為 `system-1:mx-cold-spring`、另加 `back-1:mx-ash-mist`；`quito-quay-iv` 改 `left-weapon:mx-molten-saw,right-weapon:m2-mooring-jaw,system-1:mx-frost-fins,system-2:mx-cold-spring`。扶架只留給 `ix-wain-01`、`cn-yoke-i`、`league-gantry-02`、`ix-porter-ii`、`innersea-lantern`、`league-last-ferry`。玩法差異句照改。
3. **新增共用招「架砲」**（01 批）：`ability/m2-brace-deploy`（提案名「伏架」或更好的意譯，英文 Brace；self、AP2、cooldown 2、ai.tactics buff）→ `effect/m2-braced`（scope mech、ownerTurns 1、accuracy 加、evasion 減，量級比照既有自身增益效果；tags 含 `rooted`＝本回合不能移動，這是代價）。作為**內建招**給 `ru-brazier-ii`（取代 mx-guard-stance）、`anvil-gatewarden`（取代 mx-guard-stance）、`longspear-kneeler-v2`（新增）。
4. **批次重分**：`ix-wain-01` 移到 02、`cn-yoke-i` 移到 04；01 只放共用件＋`bulwark-caisson-01`、`anvil-trestle-ii`。
5. **tags**：同系列照既有同系列 frame 的 tags 寫法（長槍系照 `frames/longspear-v4.json`，**不要**發明 `lineage-universal-longspear` tag）；其餘每台一個既有 `lineage-*`、`mech`、`human`、勢力 tag 沿用該勢力既有機的寫法（查同勢力既有 frame）。第三刃機 maker 沿用既有 `faction/salt-gull-hunters`（舊債，照舊）。
6. **命名**：新名不用「潮」字（全庫潮→蝕；海水意象另找字），所以「攔潮橫索」要改名；lore 事件 id 用世界內的名字，**不得含 `mech2`、`m2`**（`m2-` 前綴只給 bodyplan／component／ability／effect 這類機械接口檔）。

## 方法與禁忌（每台都適用）

- 節點優先、不暴力產：每台掛到勢力、主線、年表條或崩年底色（PLAN 表的掛點欄）；`etymology` 寫清為什麼這個勢力在這時需要這種機。不新增計畫外的具名人物、地名、事件。
- 中文命名避免直譯（兩步：英文原名與意涵→意譯／音譯）；frame 寫 `nameEn`＋`etymology`，bodyplan／component／ability／effect 也寫 `nameEn`。古代機本體叫古代機、外層叫裝甲；用語照 `wf/workflows/planning/design-notes/terms-rename.json`（衍型機、鎧甲、靈目、矢、燼、蝕）。新名詞一律標「提案名」（naming.json）。
- 不拿其他作品類比；不寫真實公司、真實武器型號、真實人名。
- 國家、塞勒涅、巨頭只削弱不萬能；A 級都是少數試作。古代機不在範圍；無人機題材 0 台。
- 數值照 PLAN 指定的比照機暫填，**不做平衡**（使用者：最後統一調）；probe 失衡用 manifest waivers 記，不調數值。
- bodyplan：每部位最後一層 `structural:true`，torso 帶 `core`；層 HP 從參照骨架重分原總量；槽型只用既有 slot-types。

## world model（寫到報告目錄，不寫進 content）

每台新 frame 一個 model，**寫在 `<報告目錄>/models/<id>.json`**（領導最後統一入庫並重錄戰役黃金；寫進 content 會讓黃金測試紅）。格式照 `content/base/world/models/bulwark-i.json`（通用系：maker `generic`、generic true、exportPolicy open）與 `ru-hearth-i.json`（勢力機：maker 勢力 id、generic false、exportPolicy restricted）；role 除 PLAN 標指揮者為 `captain` 外一律 `variant`；tier＝grade；cost D5／C15／B40／A100；`availableFrom.month` 01 批 1、02 批 2、03 批 3、04 批 4；`requires` 只填 PLAN「比照數值」那台的既有 model（該 model 不存在就留空）；lineage 填既有 `lineage/*`。

## 附帶產物（報告目錄，必交）

- `naming.json`（wf-table/1，欄 `id`、`nameEn`、`meaning`、`nameZh`、`method`、`status`）：每個新檔一列。
- `review-rows.json`（wf-table/1，欄 `檔`、`類別`、`名稱`、`白話`、`掛到`）：每個新內容檔一列（model 不列）；`白話` 一到兩句、≤60 字人話。
- `playtest.json` 與 `mcp-log/`：照 `wf/workflows/content/playtest.md`，MCP 走 stdio（`node src/mcp/server.ts`，沙箱禁 socket listen），至少 2 場，涵蓋至少 3 台新機（01 批 2 台全涵蓋即可）。
- `REPORT.md`：開頭「已讀清單」；四段（做了什麼：逐台一句＋和比照機打起來哪裡不同；產出；沒做到或證據不足；需要決定的事）；末尾「以後交接書該點名的工具」。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

## 共通禁區

不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網；**不 commit**（沙箱下 `.git` 唯讀，commit 由領導做）。自己打錯指令或路徑＝自己修；只有點名工具本身壞掉、沙箱拒寫才發 `BLOCKED`。
