## 已讀清單

- `AGENTS.md`
- `wf/workflows/dispatch/handoffs/night-combat-lead-1028.md`
- `wf/workflows/dispatch/handoffs/night-combat-plan-1028/CK-monsters.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/playtest.md`
- `wf/workflows/common/conventions.md`
- `wf/workflows/common/code-map.md`
- `content/lore/style.md`

其餘實際已讀與原始hash證據保留readlist.json；本次只整理報告導航，未重寫該附件。

## 做了什麼／產出

資料稿 DONE：隔離樹 `/tmp/night-combat-lead-1028/wt-ck` 恰十三個核可night-ck新JSON，合計17579 bytes；一般檔<16KB、bodyplan<24KB、整批<192KB。全部id尾段等於檔名，沒有既有內容修改、C寫集混入或營運接線。

偏弓C：380HP、5部位1核、唯一locomotion=strut；原生AP8/regen8、本能20/regen5 hard。只兩招：斜弓送棘unit min3–7、20穿刺/AP4，與鏡衣翻面AP2。生物frame burden6、僅本能；corpse burden0/pools空。

沉顎B：1000HP、5部位1核、前後足為兩個locomotion；原生AP7/regen5、本能25/regen7 soft。只兩招：沉顎銜節part-only range1、26穿刺/AP5、armorPen0.35、瞄準-10，以及既有AP3仰天喚星（指定友方加自身，非新增範圍吼）。生物frame burden8、僅本能；corpse burden0/pools空。顎破與弓冠破不封內建招。

species必填俗名name已保留；兩個B/C monster不設name/epithet。活捕、屍體與species用同新骨架／層／兩招，沒有原型額外攻擊，也沒有soul座。展示「斷艦龍骨下」用既有長槍-V7、堅盾-IV「城垣」、長槍-V4與核可駕駛，雙怪原生zone出生；seed102812、30輪。B展示與參照均為 `frame/bulwark-iv-rampart`。

review.json為兩物種與展示的白話審核；naming.json逐十三檔命名；readlist.json列完整已讀／沿用範圍；dedup.json逐十三檔附數據、近鄰及靜態差異，也保留未來必要驗證方案。資料附件均wf-table/1並以主repo tabledb API產出。

輕量驗證與真實退出碼：

- `npm run check` 一次，exit0；content `OK 0 errors, 45 warnings`，ops `OK 0 errors, 17 warnings`。完整stdout/stderr在 `check.log`。
- `npm run typecheck` 初跑exit1，既有 `src/mcp/ui.ts:70` 無法解析playwright；完整輸出保留 `typecheck.log`。
- 使用者授權補驗、領導接上既有node_modules symlink後，再跑 `npm run typecheck` exit0，兩組tsc均通過；輸出另存 `typecheck-retry.log`，無下載或安裝。

新稿警告兩條均為soft-overflow-band：沉顎species及bio frame的instinct為核可soft/inverted、max100、空bands，因此沒有超max對應帶。保留核可資料，不私加band效果、不提出waiver；其餘43條content警告與17條ops警告指既有檔。未另跑基底check，不冒稱完整前後差分驗證。

數值帶：C射程max7超一般C建議5，以min3、單體、無近戰／範圍補招及單足失移動為核可代價；B穿透0.35高於一般B建議0.2，低於硬上限0.5，以part-only、-10、5AP與群吼互斥為核可代價。HP380/1000、傷害20/26、burden6/8在各級建議帶內。這些是核可初值，未證平衡。

最終資料寫集（node_modules為領導提供的環境連結）：

```text
?? content/base/abilities/night-ck-crookbow.json
?? content/base/abilities/night-ck-keeljaw.json
?? content/base/bodyplans/night-ck-crookbow.json
?? content/base/bodyplans/night-ck-keeljaw.json
?? content/base/frames/night-ck-bio-crookbow.json
?? content/base/frames/night-ck-bio-keeljaw.json
?? content/base/frames/night-ck-corpse-crookbow.json
?? content/base/frames/night-ck-corpse-keeljaw.json
?? content/base/monsters/night-ck-crookbow.json
?? content/base/monsters/night-ck-keeljaw.json
?? content/base/scenarios/night-ck-broken-keel.json
?? content/base/species/night-ck-crookbow.json
?? content/base/species/night-ck-keeljaw.json
?? node_modules
```

## 重驗結果與尚未通過項

使用者GO後於 **22:08:16** 啟動唯一CK runner，`nice19`、`taskset -c 0,1`、串行；於 **22:09:45（Asia/Taipei）確認runner及MCP子行程均已退出，實際釋放重負載窗口**。執行入口 `bash /tmp/night-combat-lead-1028/ck-runner.sh GO all`，實際exit0；因窄fixture短ID比較誤報，修正runner後只補跑 `GO fixture`，exit0。沒有重跑完整自然或參照批、沒有改資料／AI／基準／hard或bands。

原始證據在 `/tmp/night-combat-lead-1028/ck-evidence/`；總表 `summary.json`，自然首筆 `natural-1.json`；逐seed原始events、commands、AP變化、實際候選與AI評分均保留。已將JSON改用緊湊排版，未移除任何欄位或事件。詳細機器可讀結果亦已寫回本目錄 `dedup.json` 的heavy_validation；本段不要求讀者找先前對話。

正式自然展示seeds1–5均跑到outcome，輪數9／11／10／9／10，玩家5/5勝；兩怪每場均撤退，並非擊殺。四招自然AI AbilityUsed合計：斜弓送棘25、鏡衣翻面19、沉顎銜節17、仰天喚星6，皆達>=1。新遠射11 Hit／14 Miss；新重咬7 Hit／10 Miss，17筆AbilityUsed全部帶part。seed1四招次數依遠射／鏡衣／重咬／群吼為4／4／4／1。全部自然出生，沒有預置buff/AP、沒有手動替AI施放。

同級參照共20場，均seeds1–5、同圖／zone／駕駛／AI／30輪上限，僅替換敵monster：

- CK01偏弓對長槍-V4＋堅盾-II：玩家5/5勝，輪數10／8／9／9／9；spitter-c參照同為玩家5/5，輪數8／8／8／9／8。
- CK02沉顎對長槍-V7＋堅盾-IV「城垣」：玩家5/5勝，輪數10／9／9／9／8；shelf-back-b參照同為玩家5/5，輪數9／9／8／5／8。

四組敵方均全數撤退，沒有timeout；所有25場自然／參照AI戰鬥均產生outcome、無戰鬥例外。**兩組新怪與兩組參照的5/5單邊勝旗標全部保留**；同向參照僅是觀測結果，未設waiver、未改AI撤退參數、未宣稱平衡通過。正式雙怪混級展示也保留玩家5/5勝的觀測，不拿它冒充同級平衡結論。

窄fixture補驗六項全部通過，詳 `fixtures.json`：距2拒絕／距3合法；偏弓strut斷後無移動仍可射、bow斷保留innate；沉顎缺part拒絕與固定-10；原生7AP吼後4不能咬、咬後2再regen5回7；沉顎單足仍走／雙足皆斷停、顎破不封招；兩species捕後骨架與層連續性；fresh bio用駕駛9AP咬後4，與原生7AP咬後2分開。初輪兩項失敗來自runner以短ID比對ContentDB全限定ID，已修正正規化比較；原結果另存 `fixtures-initial.json`，沒有掩蓋。fixture內直接施放／部位破壞僅作規則隔離證據，不列入自然AI覆蓋。

MCP stdio：auto seed1第9輪玩家eliminate，hash `4423529f5982ba44`，與自然seed1完整事件相同；auto原始response及逐步記錄在 `mcp-rpc.json`。另場同seed1完成三個完整round，觀察至round4；26筆合法battle_act、10次玩家攻擊，26次legal_actions與30次observe，無RPC錯誤，已觀察逼近偏弓兩格內。敵方全由AI出手。manual事件在 `mcp-manual-events.json`，session已battle_close，server子行程退出。

未執行全套suite、wiki、DOM/e2e或build；未執行領導的content_gate/content_accept與整合驗收，未宣稱accepted。兩條soft-instinct空bands警告照核可保留；只讀證據未造成內容SHA變更。

## 需要決定

CK執行終局：**DONE_WITH_FLAGS**（必要runner已完成；不是平衡或整合ACCEPT）。重負載窗口已於22:09:45釋放，不再啟動任何重驗。需領導收件裁決同級新／參照均5/5撤退勝的平衡旗標及兩條soft bands警告；無自授waiver、無資料調值。R2事件待另brief核可；未寫R2或未核可人物。

完整附件仍為REPORT、review/naming/readlist/dedup、check.log、typecheck.log與使用者另授的typecheck-retry.log；原始重驗證據保留上述/tmp路徑。子代理0，git只有讀取；content十三檔SHA與交資料稿時一致。

## 領導局部收件核對（不宣稱均勢）

主線按既有content/playtest.md matchesReference核可局部收件，無新增waiver。十個逐seed新/參照對比已從原始scenario及事件核對，唯一輸入差異為enemy.monster；同級、同map、同zone規則與seed、同玩家frame/person/defaultLoadout與AI/rounds，實際雙側都有移動的首移起點一致。每組五seed新/參照都player/repelled，CK01新8–10輪／參照8–9，CK02新8–10／參照5–9，見 [逐項核對](matches-reference-audit.json)。不同species固有AI屬monster唯一變因的一部分，未覆寫AI；不由同向撤退推斷根因或均勢。

自然五seed四招皆有AI實際使用，所有二十五自然/對照執行outcome無exception；最初fixture短ID比較失敗原樣保留，改canonical ID後六項過、內容無改。兩soft-overflow-band警告保留，不偷改hard/bands。gate、原check/typecheck、既有MCP/readlist evaluator實值均可查；界定 [局部verdict](local-verdict.json)。沒有執行npm content:probe或整套content_accept.sh，不能冒稱跑過；以既定有界runner五seed展示、兩同級配對、窄fixture與MCP替代相應範圍。bio/corpse只資料／同骨架／捕後層及AP fixture，未完整作戰。manifest draft/integration pending，只展示未營運取得。

可攜原始證據在 [evidence摘要](evidence/summary.json)，原先/tmp是執行位置，不是唯一交付。MCP表與判定在playtest.json、playtest-verdict.json、readlist-verdict.json，完整原始check及初次失敗log保留。
