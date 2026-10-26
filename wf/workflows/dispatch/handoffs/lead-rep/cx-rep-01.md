# 任務：在隔離 worktree 實作「勢力招牌機要刷聲望才買得到」，補七個國家與城邦勢力的營運資料，上架舊廠件，並重錄戰役黃金

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀下列每份（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列路徑原樣出現）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（ops 列在 `wf/workflows/common/code-map.json`，用 tabledb 查）、`wf/workflows/testing.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/lead-fill-mech/REPORT.md`、`wf/workflows/dispatch/handoffs/lead-ironsword/REPORT.md`、`wf/workflows/planning/specs/ops/data-model-faction-rnd.md`、`wf/workflows/planning/specs/ops/data-model-factions-contracts.md`、`wf/workflows/planning/specs/ops/content-format-ops/factions-war.md`、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/lead-rep/cx-rep-01.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo HEAD 相同。

## 背景與唯一目標

使用者裁示：「國家機甲當然是要刷聲望」「勢力機甲也是」。現況：玩家買機只看市場篩選器與 `exportPolicy`（`src/ops/world/market.ts` 的 `modelVisibleAt`），跟玩家對造機勢力的聲望（`FactionState.rep`，−100..100，完成契約 +5、每蝕月朝 0 回 1）無關；朝廷、俄、北美、日本、內海諸家、基多、奈洛比沒有營運勢力資料，它們的 8 台 frame 進不了研發與市場；舊廠件 `oa-*` 6 件沒有上架入口。唯一目標：**讓玩家買到某勢力的招牌機必須先對該勢力刷到門檻聲望，通用三系（堅盾、長槍、鐵劍）維持公開**，並把上述勢力與舊廠件接進營運。

## 設計（已由領導定，照做；有更小的做法可以，但行為要一致並在 REPORT 說明）

1. **門檻資料集中一處**：`content/base/world/actions/ops-world.json` 的 `rules` 加 `repGate: { byTier: {"D":10,"C":20,"B":35,"A":55,"S":80,"SS":90,"SSS":95}, overrides: {} }`（暫值；`overrides` 是「model id → 門檻」）；`src/ops/world/places.ts` 的 `WorldRules` 型別同步加欄；`src/ops/content/check.ts` 驗 `overrides` 的 key 都是存在的 model id、值是 −100..100 的數字。
2. **哪些機有門檻**：一台 `ModelDef` 有門檻 ⇔ `isModelGeneric(s, m)` 為假（未流出、`generic:false`）且 `maker !== "generic"`；門檻＝`overrides[m.id] ?? byTier[m.tier]`；比的是玩家對 `maker` 那個勢力（經 `factionId` 對到 faction-ops）的 `rep`。在 `src/ops/war/rnd.ts` 或新檔 `src/ops/world/rep-gate.ts` 匯出純函式（例 `repGate(s, ctx, model): number | undefined`、`repGateBlocked(s, ctx, model): { faction, need, have } | undefined`）。
3. **購買**：`cmdTrade` 買 frame 時，listing 帶 `model` 就用它；沒帶（市場死清單的 frame）就看該 frame 對應的所有 model——有任何一台無門檻則不擋，否則取門檻最低者。聲望不足回 `{ ok:false, error:"reputation-required" }`，不扣錢不扣庫存。門檻對所有市場一律生效（含造機勢力自己的地盤、條約進口）。
4. **可見**：市場列表的可見規則改成「原 `modelVisibleAt` 為真」**或**「有門檻、已釋出、非隊長機、玩家聲望 ≥ 門檻」——聲望夠了，`restricted` 的機也能在有對應篩選器的市場出現。`marketListings` 過濾 dynamic 時與 `listings` 用同一個判斷。原規則可見但聲望不足的機照列（玩家看得到目標），買時回 `reputation-required`。
5. **研發與補員（世界側）**：通用血統（`source:"generic"`）上掛了勢力 `maker` 且 `generic:false` 的機型，**只有 maker 自己**能在 `initRnd` 開局釋出與 `rndCandidates` 研發（其他勢力看不到）；其餘血統的既有行為不變。勢力補員本來就從自己的 `released` 抽，不用改。玩家側目前沒有「研發機型」與「補員帶機」入口——不新增，REPORT 記一行 SPEC-GAP。
6. **新勢力的營運資料**（每個勢力：`content/base/factions/` 下一個核心 FactionDef＋`content/base/world/factions-ops/` 下一個同名檔，id 用 lore 檔名（`content/lore/factions/` 的檔名），例 `faction/imperial-court`、`faction-ops/imperial-court`；名稱、scale 依該勢力的 lore 檔，**不自創新名**；lore 沒名字的才自取並標提案名）：
   - `imperial-court`（朝廷，中傘，state）：`frame/cn-jade-tablet-i`
   - `russia-umbrella`（state）：`frame/ru-hearth-i`
   - `north-american-umbrella`（state）：`frame/na-kestrel-i`
   - `japan-umbrella`（state）：`frame/jp-si04`
   - `inner-sea-houses`（company）：`frame/innersea-counterseal-ii`
   - `quito`（city）：`frame/quito-andes-wall`、`frame/quito-thunderbird`、`frame/quito-vulture-ii`
   - `nairobi`（city）：`frame/nairobi-crook-iii`、`frame/nairobi-shepherd`
   - 韓傘沒有 frame，不做；lore 若顯示上面某個 scale 明顯不對，照 lore 改並在 REPORT 寫一句。
   - 每台 frame 一個 `content/base/world/models/` 檔（檔名＝frame id 的名段，例 `cn-jade-tablet-i.json`）：`lineage` 選三條通用血統之一（依定位：防守→`universal-bulwark`、遠程→`universal-longspear`、其他→`universal-ironsword`，REPORT 每台一句理由）、`maker` 該勢力、`generic:false`、`exportPolicy:"restricted"`、`role:"line"`、`tier` 照 frame 等級、`cost` D5／C15／B40、`availableFrom:{month:0}`、`requires:[]`、`series`／`mark` 依 frame 名。
   - 新勢力 `territory: []`（不擁有地點、沒有常備軍、不打仗）：`actionLanes` 不含 `"war"`；先讀 `src/ops/war/` 確認沒有 territory 的勢力不會開作戰、不會崩（`war-invariants` 要綠）。
   - **刷聲望的入口**：新增可選欄 `FactionOpsDef.presence?: Id[]`（派駐地點：不擁有、不駐軍，只在這裡發契約）。`src/ops/contracts/lifecycle.ts` 發契約時把 `presence` 當成發包地（`nearby` 與非裂縫契約的落點），**既有勢力（有 territory 的）排在前面優先拿到發包請求**，只有 presence 的勢力排後；若這樣新勢力幾乎拿不到契約，可加最少的 board 行動牌（`content/base/world/actions/board-*.json`）專給它們，REPORT 說明。每個新勢力 `presence` 選 1–2 個既有地點（lore 上講得通，例如外國軍售代表常駐的港城）、`contractKinds` 選 1–3 個 `issuerKinds` 含其 scale 的既有契約模板。`check.ts` 驗 `presence` 都是存在的地點。
7. **在哪買**：國家機要有地方買——擴充既有市場檔（例 `content/base/world/markets/war-armory.json` 加 frame 篩選器 `{"maker":"faction/imperial-court","tierMax":"B"}`（每個新勢力一條）），或在**沒有市場的地點**新開一個市場檔（UI 一個地點只認一個市場）。舊廠件 `component/oa-*` 6 件以固定 `items` 上架（無門檻、公開），價格比照同類既有部件。新市場名若要命名標提案名。
8. **spec 最小補段**（只改這兩檔，各一小段，段首標 `SPEC-GAP 補（2026-10-26 lead-rep）`）：`wf/workflows/planning/specs/ops/data-model-faction-rnd.md` 的「機型池怎麼被用 → 玩家」補聲望門檻規則（上面 2–5）；`wf/workflows/planning/specs/ops/data-model-factions-contracts.md` 的 `FactionOpsDef` 補 `presence?` 一行說明。
9. **戰役黃金重錄**：全部改完、`npm test` 只剩黃金紅時，在本 worktree 跑 `node test/campaigns/rerecord.ts`，再 `GOLDEN_UPDATE=1 npm test`。注意 lead-ironsword／lead-fill-mech REPORT 的教訓：`rerecord.ts` 會重對應出擊編號但**不改合約編號**——寫死合約 id 的戰役（至少 `test/campaigns/ops-betrayal.json` 與 `test/campaigns/golden-spec.ts` 的比對子序列）要手動照原意圖對應；寫死軌跡數字的測試（如 `src/ops/sim/campaign.test.ts` 的終局天數）照新軌跡改，並逐條記前後值。

## 範圍（排除法寫死）

- 只寫（都在 worktree 內）：`src/ops/**`（含測試）、`content/base/factions/`、`content/base/world/`（factions-ops、models、markets、actions、必要時 affinity）、`test/campaigns/**`、`src/ops/sim/fixtures/**`、上列兩份 spec 檔；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rep/rep-01/`。
- 不做：`src/ui-adapter/`、`src/mcp/`、`src/rules/`、`src/ai/`、`src/core/`、`content/base/frames/` 與 `components/`（只引用不改）、`content/lore/`、`content/index/`、`design-notes`、其他 spec 檔、`wf/`（報告目錄除外）；不平衡數值、不改既有機型的 tier／cost；不做外交系統、不做玩家研發機型、不刪檔、不 commit。
- 件數 gate：新增＋修改的檔超過 45 個就停下回報；容量 gate：任一新檔超過 12 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm test`、`npm run check`、`npm run typecheck`（worktree 根） | 每完成一步 |
| `node src/ops/content/check.ts content/base` | 改內容後 |
| `node --test src/ops/sim/war-invariants.test.ts` | 新勢力接進後 |
| `npm run sim:campaign -- --months 12 --policy greedy --seed 7` | 量新勢力有沒有發契約、新機有沒有釋出 |
| `node test/campaigns/rerecord.ts`（`--dry` 只印） | 第 9 步 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查 code-map.json |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-rep-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑，worktree 是 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-rep/wt/`；**不 commit**（沙箱下 `.git` 唯讀，commit 由領導做）；worktree 內不要留其他檔（筆記、臨時腳本放 `/tmp/cx-rep-01/`）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網。整檔改寫用單一操作。
- **子代理上限 1 個**，模型隨意，只准為推進正事開；它若做實質工作也要親自讀「先讀」全部，受同一範圍與閘門約束。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯、測試因你的改動變紅 → 自己修、繼續做。沙箱內 `node --test` 計數可能不準（每檔只算 1 項），以 exit code 為準並在 REPORT 註明。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-rep-01 --up PROGRESS '已讀完先讀清單，開始實作聲望門檻' < /dev/null`）。
2. 引擎：設計 1–5、presence（6 的引擎部分）；寫單元測試 `src/ops/world/rep-gate.test.ts`，至少涵蓋：(a) 聲望不足買某勢力機回 `reputation-required`、現金與庫存不變；(b) 同一台把聲望設到門檻後買得到；(c) 通用三系機在聲望 0 買得到；(d) 新國家機型開局只在 maker 的 `released`、不在其他勢力；(e) `restricted` 新國家機只在聲望達門檻後才出現在市場列表。
3. 內容：設計 6–7；跑 check 與 war-invariants；跑 12 蝕月 greedy sim，記新勢力發了幾份契約、新機有沒有釋出。
4. spec 補段（設計 8）。
5. 黃金重錄（設計 9）。
6. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rep/rep-01/REPORT.md`**（檔名被擋改寫同目錄 `report.md`），回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、內容、測試、spec、黃金 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-rep/wt/…` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rep/rep-01/REPORT.md` |

REPORT：開頭「已讀清單」；再四段——做了什麼（含改動檔清單：`git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-rep/wt status --short` 原文）、產出（測試數、sim 結果：每個新勢力發契約數、新機釋出情形；黃金逐檔前後 hash 與終局天數變化、手動對應了哪些合約）、沒做到或證據不足的（含 SPEC-GAP 清單）、需要決定的事（新名提案、與 lore 矛盾處）；末尾「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內 `npm test` exit 0、`npm run check` 末行 0 errors、`npm run typecheck` exit 0。
2. `node --test src/ops/world/rep-gate.test.ts` exit 0，且涵蓋工作第 2 步 (a)–(e) 五項。
3. 7 個新勢力各有 core faction 與 factions-ops 檔、8 台新 model 檔、舊廠件 6 件出現在某市場檔。
4. REPORT 有黃金逐檔前後 hash 與 sim 的新勢力契約數。
5. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西；`npm run test:e2e` 與 wf-lint 由領導驗收時跑。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（做成了但測試紅、修不好）→ 保留改動，發 `FAILED`，REPORT 寫證據與卡住的測試。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-rep-01`。本線團隊：`teams/rep`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rep-01 --up DONE '聲望門檻與七勢力營運資料完成，黃金已重錄' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rep/rep-01/REPORT.md`（STATUS 與標題依實況換成 DONE／BLOCKED／NEEDS-USER／FAILED 與一句自足結論）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

codex 工人的 ROSTER 格已由領導代登記。
