## 已讀清單

- `AGENTS.md`（親讀主 repo 絕對路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/world/essence.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/dispatch/handoffs/lead-reconcile/guide.md`

其餘親讀：`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/content/world-pillars/world.md` 與其 `world/tone-and-rules.md`、`world/factions-and-sandbox.md`。裁示原文以 tabledb 查 `history-reconcile.json` 的「背面|暗面」，讀得 R21、R28。

## 做了什麼

終局狀態：NEEDS-USER。已完成允許範圍內可執行的改名；兩處欄位授權未收到追加指示，固定驗收第 3 條尚未完成。

cx-rc-06 已逐檔閱讀 17 檔，修改 10 檔、19 處勢力名稱；正式稱呼用「月之暗面」、敘事與口語用「暗面」。兩個背景名依同目錄以勢力冠稱職業的語境改名；M-3 的「背面的故事」指暗埠走私網流傳的版本，改為「暗面的故事」。不改地理、本義、識別字、引用、數值、鍵或陣列長度。
件數未超過 17；單檔最大位元組增幅 1.43%（`content/base/world/lineages/jinghai-stolen.json`），未超過 30%。沒有新增或刪除內容檔，沒有 commit。暫存腳本與檢查輸出只在 `/tmp/cx-rc-06/`。

固定五條驗收（未加項）：

1. 通過：`git status --short` 除既有 `?? node_modules` 外，只列允許的改動檔；逐節點確認只改白名單字串。
2. 通過：`npm run check` 為 `OK 0 errors, 8 warnings`；`node content/lore/check.ts` 為 `errors=0 warnings=2`。交接書另指定的 `node src/ops/content/check.ts content/base` 為 `OK 0 errors, 8 warnings`；三者退出碼均為 0。警告為範圍外的怪獸 capture layer HP（8）及兩個事件未列 timeline（2），未擴大修正。
3. 未通過：17 檔無「潮差」；仍有兩處 base 的 traits.silhouette 勢力義「背面」，受欄位白名單限制而保留。其餘「背面」逐處理由見殘留。
4. 通過：下列逐檔對照涵蓋全部 17 檔。
5. 通過：第一段已讀清單列齊先讀指定的全部 11 個路徑。

## 逐檔對照

### content/base/world/backgrounds/farside-hull-welder.json

- `背面帶傷艙外焊工` → `暗面帶傷艙外焊工`

### content/base/world/backgrounds/farside-navigator.json

- `背面渡輪領航員` → `暗面渡輪領航員`

### content/base/world/dialogues/yusuf-demir-exit-map.json

無需改：兩個 topic 的「寫在背面的出口」及 lines 的「古紋背面」都是筆記紙張的反面。

### content/base/world/events/port-farside-sealed-crate.json

- `「背面」的熟面孔` → `「月之暗面」的熟面孔`

### content/base/world/events/port-raft-lantern.json

無需改：「名單背面」為紙張本義。

### content/base/world/events/ship-locker-debt.json

無需改：「背面寫著」為畫紙反面。

### content/base/world/lineages/jinghai-stolen.json

- `靜海盜系（背面走私網）` → `靜海盜系（月之暗面走私網）`
- `traits.silhouette` 尚未改：待上游確認 base 欄位授權。

### content/base/world/lineages/universal-longspear.json

需改但未獲欄位授權：勢力義只出現在 traits.silhouette；交接書只對 lore 檔放行此欄，已向上游提出具體改稿。

### content/lore/characters/eugenia-ferrero.json

無需改：「月面背面裂開」為地理，「照片，背面寫著」為物件本義。

### content/lore/characters/han-seorin.json

- `她不信背面守口如瓶` → `她不信暗面守口如瓶`

### content/lore/characters/jonas-halvorsen.json

無需改：「背面裂開」接續月亮、墟帶敘述，為月面地理。

### content/lore/characters/lu-zhaoyin.json

- `沒有替背面任何人訂規矩的資格` → `沒有替暗面任何人訂規矩的資格`
- `"背面"` → `"月之暗面"`

### content/lore/characters/m3.json

- `「背面」說他／她從沒離開過古代機` → `「暗面」說他／她從沒離開過古代機`
- `## 背面的故事` → `## 暗面的故事`
- `「背面」的人提到時會漲價` → `「暗面」的人提到時會漲價`

### content/lore/characters/mina-darzi.json

- `背面的熟客請她帶小箱子` → `暗面的熟客請她帶小箱子`
- `"背面"` → `"月之暗面"`

### content/lore/characters/neris-venn.json

- `背面新加坡端的接貨與落地安置中人` → `月之暗面新加坡端的接貨與落地安置中人`
- `背面找上她` → `暗面找上她`
- `卻管不到背面其他攤主` → `卻管不到暗面其他攤主`

### content/lore/characters/old-ben.json

無需改：body 與 relations[2].note 都指空援券反面的簽名。

### content/lore/characters/old-pigeon.json

- `「背面」的骸片販子` → `「月之暗面」的骸片販子`
- `這是「背面」的規矩` → `這是「暗面」的規矩`
- `「背面」這張網的頭幾個結` → `「月之暗面」這張網的頭幾個結`
- `"背面"` → `"月之暗面"`

## 殘留

依交接書執行全 content 的指定 git grep，全文暫存 `/tmp/cx-rc-06/residuals-all.txt`；只對本批 17 檔逐處裁定。範圍外命中不改、不傾印到報告。以下位置的陣列索引從 0 起算。

- `content/base/world/dialogues/yusuf-demir-exit-map.json`：`topics[0].topic`「寫在背面的出口」、`topics[0].lines[0]`「古紋背面全是退路」、`topics[1].topic`「寫在背面的出口・後話」；三處都是筆記紙張本義（guide dark）。
- `content/base/world/events/port-raft-lantern.json`：`text`「名單背面」；名單紙張本義（dark）。
- `content/base/world/events/ship-locker-debt.json`：`text`「背面寫著」；畫紙本義（dark）。
- `content/base/world/lineages/jinghai-stolen.json`：`traits.silhouette`「背面拼的機。」；勢力義，應改為「暗面拼的機。」，但 base 未開放此欄。
- `content/base/world/lineages/universal-longspear.json`：`traits.silhouette`「背面走私網」；勢力義，應改為「月之暗面走私網」，但 base 未開放此欄。
- `content/lore/characters/eugenia-ferrero.json`：`body`「月面背面裂開」為地理、「照片，背面寫著」為本義（dark）；「合挖浦那外的舊陣列」為內陸掘墟、「三年後浦那陷落」為既有陷落事件，沒有內陸新裂說法（sea）；「歸還黨要它」是爭取刑天的既有行為，未否認三支，且本批只處理 dark（politics）。
- `content/lore/characters/jonas-halvorsen.json`：`body`「背面裂開」；月面地理（dark）。
- `content/lore/characters/m3.json`：`summary`「月面背面深處」；`body` 開頭「背面遺跡帶」、第一節「在背面遺跡帶挖了兩年」、三號節「背面封鎖線」、「蔡明珠每年去背面一次」；五處都指月背位置或到訪月背（dark）。
- `content/lore/characters/old-ben.json`：`body`「空援券，背面有德米爾」、`relations[2].note`「空援券背面」；兩處皆為券紙本義（dark）。
- `content/lore/characters/old-pigeon.json`：`body`「月面背面遺跡帶流出來」、「第一批從背面遺跡帶流到黑市」；兩處皆為貨物產地的月背地理（dark）。

其餘本批檔無指定詞殘留；「潮差」「複本」「迦梨」「九闕」「聖保羅」在本批皆無命中。

## 沒做到或證據不足的

兩處 base traits.silhouette 改名尚未執行，固定驗收第 3 條因此未完成。已用 inbox PROGRESS 將具體舊→新及授權缺口回報 lead-reconcile；不把通過工具檢查當作全部完成。
依交接書不跑 npm test、typecheck、MCP、試玩或額外驗收；不動索引、manifest 或其他檔。

## 需要決定的事

請上游明確授權上述兩個 base 檔的 traits.silhouette 並同步閘門，才能完成剩餘勢力改名。交接書「只改文字欄」段只為 lore 放行 silhouette，與固定驗收第 3 條對這兩處的要求衝突。
另外逐檔閱讀發現以下既有內容待上游另排，均未擴寫本批：`universal-longspear.json` 寫 2101 年銀環墜機，guide fix 的長槍流出錨點為 2102；`jonas-halvorsen.json`「再二十六年背面裂開」接在 2089 第一次蝕潮後，與 2097 月面裂開錨點不合；`port-farside-sealed-crate.json` 販子宣稱機魂「替駕整場」，尚無證據可判斷是否只是虛假推銷，與 essence 的不能獨駕需要後續釐清，這次保留人物傳聞與事件原意。

## 子代理

未使用。成本：0 個子代理、0 次委派；閱讀、判讀、改稿與驗收均由 cx-rc-06 親自完成。品質限制為兩處欄位授權缺口，已逐處揭露。

## 以後交接書該點名的工具

無。
