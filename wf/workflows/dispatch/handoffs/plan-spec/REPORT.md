# plan-spec REPORT：核心引擎 spec 第一版寫完（README＋12 子檔＋3 資料檔，148 KB，core 目錄 lint 全綠；全 repo 剩 world/ 另一線的 2 條壞連結）

[交接書](../plan-spec.md)｜spec 入口 [specs/core/README.md](../../../planning/specs/core/README.md)｜不可違反清單 `constraints.json`（57 列）｜採用對照 `adoption.json`（131 列）｜術語 `glossary.json`（44 列）

## 做了什麼

22:03 開工，22:27 收線（24 分鐘，未碰 90 分鐘 gate）。親自讀完 AGENTS.md、planning.md、design-notes 與兩個子檔、decisions、user.md、STRUCTURE.md、data-files.md、conventions.md、lead-techstack REPORT、world/README；兩卷機制表只用 tabledb 讀 meta 與壓縮欄位（id／domain／mechanic 前 60 字／recommendation／note），沒整份進 context。沒派子代理（內容量在自己掌握內，對照與一致性檢查自己做）。

先把 design-notes 與 decisions 逐條抄成 `constraints.json`（57 列：DN-M 12、DN-W 19、DC 2＋C 11＋T 9、PW 暫定 4），再寫 README 與 12 個子檔，每檔結尾都有「替使用者做掉的決定」5 條；最後生成 `adoption.json`（BB 卷 71 列＋ToME 卷 60 列全數）與 `glossary.json`。寫完跑 `wf-lint.sh --strict`，修掉自己的 2 個 BIGLIST（ai.md、architecture.md 的編號清單改成段落）。

## 產出

| 產物 | 路徑 | 大小 |
|---|---|---|
| spec 入口 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/README.md` | 4,960 B |
| 12 子檔 | 同目錄 `data-model-{people,mech,abilities-effects,world}.md`、`rules-{turn-and-actions,attack-resolution,resources-effects,people,battle-flow}.md`、`ai.md`、`content-format.md`、`architecture.md` | 4,958–7,668 B，全 ≤ 8,192 |
| 不可違反清單 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/constraints.json` | 57 列 |
| 採用對照 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/adoption.json` | 131 列（採用 27／改造 93／不採用 11） |
| 術語表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/glossary.json` | 44 列 |

總量 148,908 B（gate 300 KB）。子檔數 12（gate 10–14；三個 json 算資料檔不算子檔——若頂層把 json 也算進去就是 15，超 1 個，合併候選是 glossary 併進 README 改成 ≤1 KB 短表，但會砍掉八成術語，我選擇不合併）。

## 沒做到或證據不足的

- **全 repo `wf-lint.sh --strict .` 不是 exit 0**：剩 `specs/world/README.md` 與 `factions.md` 指向尚不存在的 `machine-souls.md`（22:13–22:17 由另一條線寫入，world/ 在使用者修訂中、不在我的寫入範圍）。**core 目錄單獨 lint exit 0**（broken=0 oversize=0 biglist=0）。對方寫出 machine-souls.md 後全 repo 自然轉綠；頂層收線前請再跑一次。
- 營運層（契約、金錢、修理、招募、科研日結）只留 `BattleResult` 與 `SoulTree` 兩個掛點，沒寫規則——範圍外，但實作者會立刻問「誰寫 research／companionship 進去」。
- SS／SSS、合體技（SRW-06）、套裝效果（TM-59）、傷害類型轉換（TM-40）標為第二版。
- 沒有任何數值：常數檔只點名（命中上下限、XP 60%、band 0.8、permanentThreshold…），數字是佔位。
- BB 卷 OPS 22 列與 CHR 的營運列（03／05／07／09／14／19／20）、DAT 的營運列（05／08／10／12／13／15／16）未進 adoption——營運層範圍外，寫營運 spec 時再開線對照。

## 需要決定的事

1. 子檔計數口徑（見上）：json 算不算子檔。
2. 全 repo lint 綠燈要等 world 線寫完 `machine-souls.md`；還是由頂層先暫時拿掉那兩條連結。
3. 營運層 spec 何時開線——戰鬥引擎可先動工（`BattleResult` 介面已定），但機魂成長沒有營運層就測不到。
4. `rules/constants.json` 的第一批數字由誰填：建議實作線先用 BB 原值（命中 5–95、疲勞回復 15）跑黃金測試，平衡線之後再調。

## 最想請使用者看的 5 個設計決定

1. **部位沒有獨立 HP、HP 全在層上，部件本身也是一層**（data-model-mech）：一條層序列演算法同時處理護盾、裝甲、肉、內臟、座艙殼與掛在上面的武器；「打壞武器」與「打穿裝甲」不是兩套規則。代價：UI 顯示的部位 HP 是加總值。
2. **沒有池＝付不起**（data-model-abilities-effects）：古代機甲不宣告 heat 就永遠不受熱量限制、也用不了需要 heat 的部件能力；「很多古代能力不產熱」靠這一條自然成立，不需要例外。
3. **失控＝換陣營 slot＋換 AI profile，不是新規則**（rules-people、ai）：承擔超限的生物機甲被移到 `berserk` slot、由 berserk Policy 接管、友傷懲罰歸零——「敵我不分」完全由既有能力與既有 AI 表達。玩家單位士氣逃跑也走同一條（flee Policy 接管）。
4. **機魂的天賦樹方向是戰鬥中人機關係的籌碼**（rules-people）：`autonomy` 節點數直接加進控制檢定；研發「自主」的機魂會真的跟駕駛員搶指令權，研發「輔助」的不會。四種控制模式（pilot／soul／shared／contested）讓「人機合擊」「代駕」「爭奪」都是資料。
5. **玩家 UI 與 AI 讀同一份 FactionKnowledge**（ai）：未偵察的敵方內層雙方都只看到 body plan 公開情報；偵察部件對雙方等價，不需要 UI 專用迷霧邏輯，AI 也沒有作弊面。

## 替使用者做掉的決定清單（彙整，可逐條推翻；各子檔結尾有理由）

**data-model-people**：單一 Person 型別、kind 只分流成長；屬性名在資料登記、規則只引用 role；機魂也有士氣欄；控制模式四種＋berserk／none／disabled；承擔上限預設引用 resolve。
**data-model-mech**：部位 HP 全在層上；部件可往層序列插層；部件本身是一層；同 id 池合併上限相加；古代機甲每台一個 FrameDef。
**data-model-abilities-effects**：NumExpr 結構化、不開字串 DSL；HookAction 動詞封閉（約 10 個）；沒有池＝付不起；reaction 模式納入 AbilityDef；效果帶 `ui.badge`。
**data-model-world**：族 family 開放字串；菌絲族 `territorial` 行為改地形；`telegraph` 掛族上；陣營 slot 與 FactionDef 分離、失控專屬 slot；地圖 cells 字串＋legend。
**rules-turn-and-actions**：同分先攻依 unitId；輪中加入排隊尾；Wait 每輪一次；移動不足整步不扣；反應能力不耗 AP。
**rules-attack-resolution**：命中採 BB 門檻不採 ToME 曲線；不做散射；溢出傷害不傳鄰部位；armorPen 統一成 passThrough；十分之一規則放全局修正表。
**rules-resources-effects**：派生值局部重算；帶效果 whileSource 互斥；sustained 鎖 max；效果撤除在資源更新前；pending 再加入忽略。
**rules-people**：人物 HP 是池；共鳴是信念比對分數；失控是換 slot；承擔超限先檢定後必失控；控制檢定用 autonomy 節點數。
**rules-battle-flow**：個別單位各自撤離；棄機→infantry＋derelict 兩個 MechState；捕捉條件可由族改寫；勝負在輪末與死亡／撤離後評估；BattleResult 是唯一出口。
**ai**：玩家與 AI 同一份知識；評分公式固定、權重在資料；意圖宣告為族可選；前段加權抽；預估走 previewCommand。
**content-format**：一檔一筆檔名即 id；後載入 pack 覆寫同 id；Schema 由 TS 型別產生；能力 `ai.tactics` 必填；信念標籤開放、其餘列舉登記。
**architecture**：指令序列是存檔真相；payload 只放 id 與數字；RNG 選 PCG32；黃金日誌當 review 材料；ViewModel 以 dirty set 局部重繪。
**本 REPORT**：json 不算子檔；OPS 列不進 adoption；常數先用 BB 原值。

## 建議的實作切線（按資料夾／檔案清單切，給 dispatch 用）

專案根：`src/{core,content,rules,ai,sim,ui-adapter}/`、`content/base/`、`test/scenarios/`、`schemas/`。每線交付＝檔案清單＋`node --test` 綠＋（規則線）黃金日誌。

1. **線 core-types**（先行，其他線的前提）：`src/core/{ids,types-def,types-state,events,rng,numexpr,eventlog}.ts`＋`numexpr.test.ts`、`rng.test.ts`。依 data-model-* 四檔與 architecture §狀態與事件。
2. **線 content-loader**（依賴 1）：`src/content/{loader,registry,schema,contentdb}.ts`、`schemas/*.schema.json`（由型別產生的腳本）、`content/base/registries/*.json`＋`content/base/rules/{constants,damage-modifiers,morale-events,injuries}.json`、content-format 的五個範例落成真檔。依 content-format。
3. **線 rules-core**（依賴 1、2）：`src/rules/{state,contribs,pools,effects,hooks}.ts`＋表格驅動測試。依 rules-resources-effects。
4. **線 rules-combat**（依賴 3）：`src/rules/{turn,movement,command,attack,layers,conduct}.ts`＋層序列表格測試＋ 3 個黃金情境。依 rules-turn-and-actions、rules-attack-resolution。
5. **線 rules-people-flow**（依賴 3，可與 4 並行）：`src/rules/{morale,injury,will,control,flow,objectives}.ts`＋黃金情境（失控、棄機、捕捉各一）。依 rules-people、rules-battle-flow。
6. **線 ai**（依賴 3、4 的 preview 介面）：`src/ai/{knowledge,strategy,agent,policy,score,danger}.ts`、`src/ai/policies/{tactical,berserk,swarm,sentinel,flee,scripted}.ts`＋煙霧測試。依 ai.md。
7. **線 sim**（依賴 4、5、6）：`src/sim/{run,replay,save,cli}.ts`、`npm run sim`、不變量／屬性測試、重播一致性測試。依 architecture §決定性、§存檔、§headless。
8. **線 ui-adapter**（依賴 7；可提早用假 state 開工）：`src/ui-adapter/{viewmodel,viewport,render,input,text}.ts`、`index.html`、happy-dom 測試、Playwright 2–3 條。依 architecture §ui-adapter。
9. **線 content-base**（依賴 2，與 3–6 並行）：`content/base/` 第一批資料——2 個 body plan（biped-light、quadruped-beast）、3 台機甲（機械 C、生物 C、古代 S 各一）、6 個部件、1 族怪獸（潮狼 D–B）、4 種地形、2 個情境；驗收＝loader 零錯誤＋sim 跑完 AI 對 AI 不拋錯。

建議派法：1→2 由同一條 Opus 領導線帶 codex 工人；3／4／5 三線可由一位領導分三工人並行（共用 1、2 的型別）；6、9 並行；7、8 最後。每線交接書點名本 spec 的對應子檔與 `constraints.json` 列號，驗收寫「黃金日誌 hash 不變」或「新增黃金檔」。

## 驗收逐條證據

1. README 含 Mermaid 模組圖（`flowchart LR`）與 `<!-- wf-nav -->` 子檔導航表 12 列；子檔 12 個，bytes：people 6,395、mech 7,668、abilities-effects 7,233、world 5,841、turn 4,958、attack 5,882、resources 5,087、people-rules 5,759、flow 5,084、ai 5,622、content-format 6,937、architecture 6,715——全 ≤ 8,192。
2. `constraints.json` tabledb 可讀（contract wf-table/1，57 列）、`check` 零壞連結；欄 `source`（連到 design-notes／decisions／plan-world REPORT）與 `spec_section`（連到子檔＋真實 heading slug）每列非空；design-notes 兩子檔 26 個粗體裁示段各對應 ≥1 列（mechanics 11 段→DN-M-01..12，world 15 段→DN-W-01..19）。
3. `adoption.json` tabledb 可讀、131 列、`check` 零壞連結；每列 `id` 為 BB 卷（CMB／CHR／AI／DAT／SRW）或 ToME 卷（TM）id、`status` ∈ {採用,改造,不採用}、`spec_section` 指到子檔節、`table_path` 連回原表。
4. `content-format.md` 含「新增一台機甲／一個部件／一個駕駛員／一種地形／一族怪獸」五段各列要改的檔，並有 frame／component／person／terrain／species 五個 JSON 範例。
5. `bash wf/tools/wf-lint.sh --strict wf/workflows/planning/specs/core` exit 0；全 repo `--strict .` 剩 world/ 另一線的 2 條 BROKEN（非本線檔），本線產物零 finding。
6. 本 REPORT 含「最想請使用者看的 5 個設計決定」「替使用者做掉的決定清單」「建議的實作切線」三段。
