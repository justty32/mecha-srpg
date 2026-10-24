# lead-impl-content-base REPORT：第一批 base 內容包（spec 切線 9）

**STATUS：BLOCKED（只卡在驗收 4）**。內容全部交付且已 commit，`npm run check` 0 errors。驗收 4（`npm test` 0 fail）過不了，原因有兩個，都在本線碰不到的 `src/`／`test/`：一是 foundation 的 `src/content/content.test.ts` 用 `assert.equal` 釘死 base 件數，二是規則線還沒做完的黃金情境。解除方法見「需要決定的事」2。

## 做了什麼

- 照「先讀」讀完規矩、foundation REPORT、schema、既有 base、spec 與世界觀。我先自己凍結 id 命名表與跨檔引用，寫在 [contract.md](contract.md)；registries 的追加也由我直接做。
- 派三條 codex 工人（gpt-6-astra，`codex exec -s workspace-write`）。`cx-content-mechs`、`cx-content-world` 並行，各寫 31 檔，各約 2 分鐘交件，由我在沙箱外驗證並 commit `31b83cc`。`cx-content-scenarios` 寫 4 檔＋README，由我 commit `a12bd83`。三條都回 `DONE`，自報數字與我重跑的一致。
- 開工後發現**既有內容檔被規則線測試釘死**：`src/rules/state.test.ts` 斷言 `biped-light` 左臂只有 1 層，`hound-mk2`／`ren-kasai`／`unit-07`／`tidewolf` 也被引用。所以我**一個既有內容檔都沒改**。交接書要求 biped-light／quadruped-beast 改成多層，我改成新建 5 個多層 body plan，這是偏離交接書的地方，見「需要決定的事」1。
- 規則線把 `terrain/plain` 移進它的測試包 `test/scenarios/pack`，base 因此少了平地。我把它補回 `content/base/terrains/plain.json`；base 與 `rtest:terrain/plain` 的 id 不同，不會衝突。
- 調度者補充裁示：已把 `frame/ancient-rearguard` 的 name 改成神話稱號「刑天」（中國神話中斷首仍戰的戰神，合殿後不退的信念）。frame schema 沒有描述欄也沒有別名欄，所以「人取的名、原始無名」只寫在 `content/README.md`，見 SPEC-GAP 1。
- 寄 PROGRESS 情報給 `lead-impl-rules`、`lead-impl-ai`：`content.test.ts` 紅一筆是預期中的，不是它們的程式錯。ROSTER 四格已登記並標為已收線；團隊 `contentbase` 已 close；信件全數 ack。

驗收逐條（沙箱外重跑）：

1. ✅ `npm run check` exit 0，`OK 0 errors, 0 warnings`。件數：frame 7、bodyplan 7、component 7、ability 14、effect 20、person 7（human 4、soul 3）、soultree 2、terrain 6、map 2、faction 3、species 4、monster 3、scenario 2、aiprofile 5。
2. ✅ `frame/ancient-rearguard` 為 `pools: []`，獨有能力 `ability/rearguard-oath`＋`ability/shell-lance`，兩者都要求共鳴 ≥ 0.5。`frame/bio-reaper` 有 `burden: 6`。`grep -l '"resonance"' content/base/components/*` 得到 `shell-shard-lens`，`grep -l '"burden"'` 得到 `reaper-scythe-graft`。
3. ✅（有偏差）monsters.json 的蟲族只有三列：D 蝕蟲、C 鐮肢、**A** 巢母，沒有 B 列。交接書寫「D–B 三列」，我取的是實際這三列。名稱一致，`species/nestmother` 的 behaviors 含 `spawner`。
4. ❌ `npm test`：tests 133、pass 128、fail 5。
   - 1 筆是 `src/content/content.test.ts`「指定內容種類件數正確」：它把 base 件數斷言成 frame 2、component 1、person 2、terrain 1、species 1，**base 只要長大就一定紅**，與驗收 1 直接矛盾。
   - 另 4 筆是規則線工作樹中未 commit 的黃金測試：`people-berserk`、`people-eject` 缺 hash 檔，`people-capture` 事件序列不符，黃金情境數為 0。它們用的是測試包的 `pp-*` 內容。我判斷不是本線造成的，但沒有在拿掉本線內容的條件下對照重跑，證據不足。
5. ✅（就本線而言）`wf-lint.sh --strict .`：`residue=0`、`local=0`，但 `broken=8`。8 筆壞連結全在 `wf/workflows/planning/specs/ops/`（`plan-ops-spec` 進行中）；本線檔案 0 壞連結。
6. ✅ commit `31b83cc`、`a12bd83` 與本 REPORT 那一筆，都是 `content: ` 開頭、只含明確路徑。`git status --short content/` 為空；無殘留 `codex exec`；團隊已 close；ROSTER 已標已收線。

## 產出

- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/`：新檔 68 個，另有 4 個 registries 檔做了追加；全包 102 個 JSON、約 83 KB。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/README.md`
- 本目錄：`contract.md`、`cx-content-{mechs,world,scenarios}.md` 與各自的 `REPORT.md`。工人 log 已搬到 `/tmp/lead-impl-content-base-trash/logs/`。

## 內容清單（id／檔名／一句）

| id | 一句 |
|---|---|
| registries | layer＋`structure resonant-shell`；damage＋`energy thermal pierce`；part-function＋`spawner`；slot＋`soulCore armorMount sensorMount` |
| `bodyplan/biped-standard` | 標準雙足，5 部位，每部位外甲＋內結構；座艙殼層把腦震盪傳給駕駛員 |
| `bodyplan/ancient-warden` | 守殼者：殼層→肉→核，只有駕駛座（殼不認機魂）、無部件槽 |
| `bodyplan/insect-{mite,reaper,nestmother}` | 蟲族三體：甲殼→肉→核，核部位預留 restraint／cockpit 槽；巢母 3 個囊口帶 `spawner` 功能 |
| `frame/moji-tern` | 摹機・燕鷗（機械 C），有熱量＋電能池 |
| `frame/bio-reaper` | 生物機甲・鐮肢（生物 C），burden 6，有本能池 |
| `frame/bio-mite`、`frame/bio-nestmother` | 捕獲後的機體（D／A），species.capture 需要它們 |
| `frame/ancient-rearguard` | 「刑天」（古代 S），無池、repair-only，共鳴信念是 never-retreat、bring-them-home |
| `component/soul-core-std` | 魂核：機魂的身體 |
| `component/heat-lance` | 熱矛：近戰熱傷，扣電能、產生熱量 |
| `component/composite-plate` | 外掛複合裝甲：往 torso 插一層 armor |
| `component/shell-pin-restraint` | 殼釘節鎖：蟲族拘束件，毀損後本能 +30 |
| `component/reaper-scythe-graft` | 鐮肢移植臂：生物部件，burden 3 |
| `component/shell-shard-lens` | 殼片透鏡：古代部件，resonance 0.4，感知 +3，可標記目標 |
| 10 個 ability | 熱矛刺、移植臂劈、殼片凝視、殿後之誓（古代獨有）、殼槍、蝕蟲群咬、鐮劈（telegraph）、鐮衝、產卵（spawn 子體）、根拖 |
| 13 個 effect | 誓、標記、拘束斷、產卵、根縛、蝕地啃、三個特質、四個機魂 perk |
| `species/{mite,reaper,nestmother}`、`monster/{mite-d,reaper-c,nestmother-landlord}` | 蟲族三族與個體；巢母個體名「房東」 |
| `aiprofile/{swarm-mite,reaper-vanguard,nest-anchor,glove-line}` | policy 分別是 swarm、tactical、sentinel、tactical |
| `terrain/{ruin-wall,rubble,shallows,erosion,plain}` | 殘牆（擋視線、打壞變瓦礫）、瓦礫、淺灘、蝕地（啃 armor 與 component）、平地 |
| `soultree/moji-std` | 摹機魂樹，算、手、心三根，共 4 節點 |
| `person/{mara-okoye,chen-xiaohai,ilse-brandt}` | 三名人類駕駛員；伊爾瑟的信念與「刑天」共鳴相符 |
| `person/glove`、`person/ash` | 手套：塞勒涅登錄機魂，開了 3 節點但零陪伴；灰：野魂 |
| `faction/{migrant-crew,selene-whitegloves,rift-insects}` | 候鳥號獵團、塞勒涅白手套、裂獸蟲群 |
| `map/skirmish-20`、`map/rift-edge-60` | 20×20 廢墟淺灘圖；60×60 裂縫邊緣圖，帶蝕地與酸沼帶 |
| `scenario/skirmish-whitegloves` | 4 對 4：獵團對白手套 |
| `scenario/rift-edge-nest` | 10 對 10：獵團＋白手套對蟲群，含巢母 spawner |

## SPEC-GAP

1. FrameDef 沒有 `description`／`aliases` 欄（`additionalProperties:false`）。古代機甲「人取的名、原始無名、各勢力叫法」目前只能寫在 README。
2. `UnitSpawn` 沒有部件配裝欄，情境裡的機甲一律空槽出場（魂核、武器都沒裝）。
3. 同一個 PersonDef 在一個情境裡被多台機甲引用（手套複本），spec 沒說實例 id 怎麼產生。這合世界觀，但要規則／sim 線定案。
4. `FactionDef.strategy` 的值域未定，暫填 `"strategy/default"`。
5. Objective `params` 的鍵（`target`、`rounds`）與 `for`／`onComplete` 的語意由我自定；情境沒有預留 `berserk` slot。
6. 蟲族子體（spawned）在 schema 沒有欄位，只用 tags 表達。

## 需要決定的事

1. **biped-light／quadruped-beast 要不要改成多層**：規則線測試釘住它們的層數，我改用新建的 `biped-standard` 等。判準：規則線收線後，若測試不再斷言既有 base 檔的形狀，就把多層移回原 id。
2. **解除驗收 4**：把 `src/content/content.test.ts` 第 28–32 行的 `assert.equal(counts.X, n)` 改成 `assert.ok(counts.X >= n)`。這需要有 `src/` 權限的線或調度者動手，是一行級修改。規則線那 4 筆等它收線再判。
3. 交接書寫的「蟲族 D–B」與 monsters.json（D／C／A）不符，要不要在世界觀補一列 B 級蟲族。
4. `wf/workflows/inbox/ROSTER.md` 已超過 8 KB（OVERSIZE），已收線的格子該封存，這屬調度者。

## gpt-6-astra 這次觀察到的癖好

- 契約把 id、件數、欄位要點寫成表時，31 檔約 2 分鐘就交件，且零 SPEC-GAP；它照抄不加料，數值量級合理。
- 碰到缺依賴（`terrain/plain` 被移走）時，它先發 `PROGRESS` 請領導處理，然後繼續寫，沒有自己去補別人的檔；orders 補指令後一輪收斂。
- 並行兩條線互相引用 id 時，它分得出「暫時的 missing reference」和「自己的錯」，最終零錯誤才交件。
