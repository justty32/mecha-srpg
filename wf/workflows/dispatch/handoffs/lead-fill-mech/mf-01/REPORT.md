# 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/templates.json`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/ability-forms.json`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/playtest-baselines.json`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/polish.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/mechs.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/world/drive.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/history-lines/c-essence.md`
- `wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`
- `content/lore/factions/selene.json`
- `content/lore/factions/singapore-exchange.json`
- `content/lore/factions/mimic-works.json`
- `content/lore/factions/league-armory.json`
- `src/mcp/README.md`
- `wf/workflows/dispatch/handoffs/lead-fill-mech/cx-mf-01.md`

親自讀取主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md` 與交接書絕對路徑；其餘指定檔以 worktree 為根讀取。資料表透過 tabledb 分條查閱。

## 做了什麼

cx-mf-01，團隊 teams/mech。在隔離 worktree 只新增 6 台 mechanical frame，全用既有 mx 部件，未新增部件、能力、效果。來源與命名意涵寫進既有 etymology 欄，英文原名只存 naming.json，不使用 aka。照 09:24:44 上游 orders，勢力 tag 改成 faction-imperial-court、faction-russia-umbrella、faction-north-american-umbrella、faction-japan-umbrella、faction-inner-sea-houses；日機 innateAbilities 空陣列。未委派子代理；子代理成本為零，平台未提供本線 token／費用數字。

`content/base/frames/selene-silverring-g1.json`：銀環-G1，C 偵察射手；lineage-jinghai 來自靜海仿造骨架。沿用既有名，掛 2099 型錄、海峽衛及 2102 墜海逆向；相較 G2，改用紋刻連吼與鷹瞳靈目，沒有光幕、流光囊與 soul-driven，流光 60／10 也較素。

`content/base/frames/cn-jade-tablet-i.json`：玉圭-I型（提案名），B 線列；lineage-kuafu 承接境內衍一聯合技藝，朝廷禮器語感接閱兵提案。相較城垣，採強化雙足、連吼與戰錘，無背砲、灰霧或古紋重甲，負責列陣而非要塞。

`content/base/frames/ru-hearth-i.json`：長爐-I型（提案名），B 耐寒重裝；lineage-kuafu 選公刻堅盾來源，不另造俄國古代機。接棄東令與俄跟進 B 級提案；相較城垣，重砲配鳴刃、燼池 150、先手 3，省掉雙背掛與古紋聖甲。

`content/base/frames/na-kestrel-i.json`：隼翼-I型（提案名），B 機動射手；lineage-kuafu 沿用公刻接口，沒有取得刑天。接美國內陸工業與北美跟進提案；相較長槍-V7，靠背翼、輝光連吼與近身鳴刃換位，無星痕貫矛或追矢背掛，未將國家強盛寫成全能。

`content/base/frames/jp-si04.json`：SI-04（提案名），D 線列守牆；lineage-kuafu 選公刻圖紙經船廠改造。接 2094 瀨戶內鎖海；相較 FR-7，只留一把紋刻連吼與白瓷鎧甲，先手 3、無內建能力。遙控／AI 編成只在暫存試玩情境設定，frame 未加座艙欄。

`content/base/frames/innersea-counterseal-ii.json`：合印-II型（提案名），C 短程護線；lineage-kuafu 由堅盾公刻圖與型錄件傳下。接家族蓋印賒帳與聖馬洛九門同喪；相較堅盾-II，換蛇鞭配短砲，無背掛灰霧、排燼系統，工坊不冠家族姓氏。

## 產出

交付 [naming.json](naming.json)、[review-rows.json](review-rows.json)、[playtest.json](playtest.json) 與 [MCP 原始紀錄](mcp-log/)。六個內容新檔各 1559–1775 bytes；沒有觸發 9 件／12 KB 停工 gate。原有 node_modules symlink 在開場就已存在。

固定五條驗收（沒有增加測試、typecheck、wf-lint 或 npm test）：

1. 每檔寫完均跑 worktree 根目錄 npm run check，六次最後一行皆為 `OK 0 errors, 8 warnings`；見 [checks.txt](mcp-log/checks.txt)。
2. 六個新 frame 均存在，檔名等於 id 的 name 段，defaultLoadout 非空；部件／能力／效果新檔合計 0。
3. naming.json、review-rows.json 各 6 列，與內容新檔數相同；白話欄各 60 字內，實測長度記在 [驗收紀錄](mcp-log/acceptance.json)。兩表先建 wf-table/1 空表，再用主 repo tabledb.py 的 Table.add 寫入。
4. playtest.json 2 列；第一場涵蓋 G1、合印、SI-04，第二場涵蓋玉圭、長爐、隼翼，合計 6 台。
5. REPORT.md 存在，開頭為已讀清單，逐項列出交接指定路徑。

probe 使用交接列出的 6 個新 id，外加 G2、城垣、長槍-V7、FR-7、堅盾-II，全部同條件 n=5；原始 [文字](mcp-log/probe.txt)／[JSON](mcp-log/probe.json) 可逐項查數字。新機依序對同級衍型機勝率為 100%、0%、0%、0%、0%、100%；對同級怪獸為 100%、100%、100%、100%、20%、100%。全部例外 0。G2、城垣、長槍-V7、FR-7、堅盾-II 的對怪勝率均 100%；其對衍型機為 100%、60%、40%、100%、100%。

骨架加外掛鎧甲 HP 依序 370／475／555／445／275／400，均在各級帶內；掛件本身的組件 HP 另計。燼池 max 為 100／110／150／100／100／100，流光 max 為 60／60／60／90／30／50。俄先手 3 低於 B 建議 5–8，刻意保留慢速重裝定位；G1 靈目本體 6、鷹瞳再加 1。沒有更改任何既有能力數值；超帶提示包括輝光連吼射程 7、重砲射程 9／傷害 36、D 紋刻連吼射程 6／傷害 20，均為既有部件。自身盾陣射程 0、反應技 AP 0 亦會被泛用數值帶提示，不能直接當作壞資料。俄、北美的鳴刃反應技在 probe 未觸發。

MCP 走 node src/mcp/server.ts stdio，使用 /tmp/cx-mf-01/mcp-play/ 暫存內容副本與原 src symlink，加 Node preserve-symlinks 旗標讓 server 載入暫存根；引擎原始碼與 worktree 情境未改。完整情境 JSON 放各場 log 開頭。港場 seed 1：親自讀 legal_actions、選 G1 移到 (8,12)，保存再載入後以 driver 透過 legal_actions→act 接續，AI 單位由 step_ai 推進；第 9 輪 player 勝，0 我方離場、2 敵方被逐退，hash 2e6ce2b698736e99。國家場 seed 2：battle_auto，第 8 輪 player 勝，0 我方離場、1 敵撤退，hash a7e84717b6a22324。無新能力，newAbilityUses 均為 0；SI-04 的普通 AI 實際使用既有部件武器，沒有內建招式。

## 沒做到或證據不足的

未做平衡調整，這是交接書明定邊界。日機單挑低勝率與一場 timeout、三台 B 對城垣全敗均原樣回報；這些不是已解決的平衡問題。C 級與 B 級對獸全勝大多是第 8 輪起逐退，不能解讀成擊毀或無敵。兩場 MCP 為混編覆蓋試玩，並非單變數平衡實驗。港場 G1 一度燼滯 II，素裝舊型有續戰限制。

暫存 driver 初稿漏 schemas、內容 symlink 不被 loader 遍歷，另把 detail 寫成布林而被參數檢查拒絕；已改為完整暫存內容副本與 detail:"full"，重新取得本次證據。港場原始 log 保留那筆拒絕，不以舊輸出替代。沒有尚未解除的工具或沙箱阻塞。

world/models 與區域 lore 由領導／其他線整合，本線沒有寫入；因此新 frame 已可在資料／百科被載入，未聲稱已取得市場投放或研發解鎖。未 commit。

## 需要決定的事

既有 `content/lore/factions/mimic-works.json` 的格爾木分家段把堅盾公刻後接成「長槍」普及，與 C 精粹線的 2102 G1 逆向長槍、M10 堅盾防守／長槍遠程的來源區分不一致；本批照交接書保留 G1→長槍，舊檔不改。

既有 `content/base/world/lineages/jinghai.json` 的 source 指 frame/ancient-rearguard（刑天），holder 指白手套；selene lore 則以恩底彌翁為靜海骨架來源。既有 mechs.md 又把長槍 tag 對照到 lineage-xingtian，與本次銀環流出敘述需由領導對齊。本批依指定 lineage-jinghai／既有 lineage-kuafu tag 填寫，沒有替它們增造古代機或血統檔。

玉圭、長爐、隼翼、SI-04、合印皆為提案名；中傘 2107 閱兵事件與俄、北美跟進 B 級仍以提案語氣掛接。五個新勢力 tag 採上游 orders，區域線對應 lore 檔尚不在本 worktree，交由領導整批對齊。

## 以後交接書該點名的工具

Node stdio MCP 及 src/mcp/e2e.test.ts 的 JSON-RPC driver；battle_observe.detail 合法值為 brief／full。自建情境需暫存內容副本或自訂 createEnv packs，不能只建 scenario 後期待預設 server 自動載入；loader 不遍歷內容 symlink。tabledb.py 的 Python load／Table.add／save 與 CLI add 都能按契約寫表。所有暫存 driver 留在 /tmp/cx-mf-01/，MCP 子行程已結束。
