# plan-intrigue REPORT — 設計筆記「局勢與掙扎」（2026-10-24，Fable 規劃線）

[handoffs](../README.md)｜筆記入口 [design-notes/intrigue](../../../planning/design-notes/intrigue.md)｜子線 [cx-intrigue-ref REPORT](cx-intrigue-ref/REPORT.md)

## 做了什麼

照頂層指示親自讀完 AGENTS → user → planning → PROJECT／SPEC → specs/world 全部子檔 → specs/ops 的契約、作戰、外交、傭兵參戰、經濟債務、tick、內容格式 → world-pillars → terms → `content/lore` 的勢力（31）、人物（64）、事件（68）、年表摘要 → `src/ops` 的 `opseffect.ts`／`cond.ts`／`types.ts` 與既有事件、契約。網路查資料依使用者指示全部交給 codex：寫交接書 `cx-intrigue-ref.md`（brief_lint 0 違規），`codex --search exec`（gpt-6-astra、reasoning high、`-s workspace-write` 只放 `handoffs/plan-intrigue/`＋`wf/inbox`），約 11 分鐘、20 萬 tokens 回 DONE；我只讀它的 `references.json`（18 列、每列 2–3 條來源）與 REPORT。筆記本體（勢力動機網、迷霧、連鎖、船員、系統落地、劇情弧、天象交會）與 codex 並行寫成。

**核心論點一句話**：局勢不是寫出來的劇本，是讓每個勢力的理由、舊帳與需要互相咬合；掙扎不是選項題，是玩家永遠晚一步才知道自己剛替誰做了什麼——而船上有人早就知道。

## 產出

全部新增檔，`git commit -- <路徑>` 只提交自己的路徑，未碰別線暫存。

| 產物 | 路徑 |
|---|---|
| 筆記入口（論點、導航、五件待拍板） | `wf/workflows/planning/design-notes/intrigue.md` |
| 參考作品六手法四陷阱 | `wf/workflows/planning/design-notes/intrigue/references.md`＋`references.json`（18 列，codex 查證） |
| 勢力動機網 | `intrigue/motives.md`＋`motives.json`（20 列：訴求／舊帳／需不需要戰爭／從蝕潮得利／留給玩家的縫／既有或提案） |
| 契約迷霧與延後揭露 | `intrigue/fog.md` |
| 後果連鎖 | `intrigue/chain.md` |
| 船員忠誠與掙扎 | `intrigue/crew.md` |
| 系統落地對照 | `intrigue/systems.md`＋`engine-gaps.json`（13 列：需求／現有／缺口／提案／kind／size） |
| 劇情弧樣本「鹽灘三約」 | `intrigue/arc-sample.md` |
| 與 plan-tide-sky 交會 | `intrigue/tide-sky.md` |
| codex 交接書與 REPORT | `handoffs/plan-intrigue/cx-intrigue-ref.md`、`cx-intrigue-ref/REPORT.md` |
| 索引一列 | `design-notes.md` 加一列，標「規劃線提案（非裁示）」——已由頂層隨 commit e537727 收進，本線不再提交 |
| ROSTER | `cx-intrigue-ref` 一格（已收線） |

驗證：`bash wf/tools/wf-lint.sh --strict .` 結果見末段「證據」；所有 md ≤ 8 KB；三個 json 都是 wf-table/1、`tabledb.py` 可開。

## 沒做到、或證據不足的

- plan-tide-sky 收線後已把 `intrigue/tide-sky.md` 改成對著它的 `OmenDef.forecast`（蝕訊四來源）、`OmenEffect.faction`、`rule` 開關與連珠潮寫；兩件需兩線共定的事（`IntelDef.reveals` 指向 `forecast` 來源；Cond `omenActive`／`calendar.tide`）列在該檔末段，未與對方互審。
- `calendar.json` 特殊日在實作裡有沒有被讀，只查 spec 沒跑程式，engine-gaps 第 11 列標「未查證」。
- codex 的 Front Mission 5 一列證據最弱（角色頁只讀到索引摘錄）；其餘各列有百科＋訪談或官方頁。codex 文字帶翻譯腔，但它是資料檔不是文案，筆記正文全部重寫。
- 劇情弧樣本只到設計稿，沒寫成 content JSON、沒跑過；systems.md 建議先派內容線把它寫出來再定 spec 欄位。
- codex 的 DONE／PROGRESS 信已 `inbox_ack.sh --apply` 歸檔，但 `wf/inbox/done/2026-10-24/messages.*` 有別線未提交的改動，**我沒有 commit 它**，留給頂層一起收。
- 沒碰 spec、`src/`、terms.md、既有 content（照授權）。

## 需要決定的事（最值得使用者拍板的五件，附建議）

1. **揭露要不要延後**。建議：一律在收錢之後、下一張同雇主契約之前（3–10 天，大潮前後最密）。判準：若七成契約接約前就能看穿，迷霧失效；若三成揭露永遠不來，變運氣。
2. **船員能不能走**。建議能：違背牽掛 strain +1、補償 −1，≥3 每蝕月第 1 天擲離團，仇類牽掛帶機走。不能走的話所有兩難沒有牙；門檻 3 可改 2（更狠）或 4（更寬）。
3. **雇主能不能在戰場上撤走空援**。建議能，只限有「理由」的雇主（歸還黨、曝光的代理戰），機率量級 15–25%，事後 `memory: abandoned-you` 可討回。
4. **情報要不要當商品**。建議要：哨所／殘聯／沐蝕會三版本，價格一個蝕月薪水量級；這也是與天象線最自然的接口。
5. **要不要開「請夸父下山」這條線**。建議留中後期，不急；它是唯一碰到古代機頂層的提案。

另有七條勢力層提案（motives.md 末段：通緝可被操作、債務抵償契約、沐蝕會假旗、鐵砧的愧、奈洛比默許養裂、同一出資者雙面代理、請夸父下山），全不新增勢力、不改年表。

## spec 與引擎提案摘要（細節在 `engine-gaps.json`，編號對應 systems.md）

**零程式、現在就能派內容線**：戰後揭露信、同業紙條、債務抵償契約（事件→`spawnContract`，`onComplete` 對 `debt` 帳記負）、船員牽掛第一版（人物 `tags` `tie:*`＋對白 `when`）、紀念日第一版——合起來能做出劇情弧樣本八成。

**小（各一條工人）**：(1) `spawnEvent.afterDays`／`onPhase`；(2) Cond `factionRemembers`＋OpsEffect `forget`——讓已寫入的 `FactionState.memory` 被讀；(3) `ContractTemplate.hidden {intent, grudge, reveals[]}`＋`ContractState.revealed`＋OpsEffect `reveal`；(4) `OperationDef.pretext／motive／exposeOn`＋`ContractState.payer`；(5) `calendar.anniversaries`＋Cond `onAnniversary`。

**中（領導帶線）**：(6) 接約前的反對 `Prompt`（`accept` 前查 objection 對白）；(7) `Employment.strain`＋離團擲＋出戰注入 optional 目標；(8) `JoinTerms.supplyRevokeOn`（雇主撤空援）；(9) 市場 `intel` 列＋`IntelDef`；(10) `UnitSpawn.provenance`＋戰後寫 `lore`。

依賴：(1)→(3)→(9)(10)；其餘並行。建議第一輪：內容線寫劇情弧＋小 (1)(2) 一條工人線；第二輪看試玩再開中型。不建議：全局業力值、對話樹審問、結局分支、為揭露加動詞。

## 以後交接書該點名的工具

`codex --search exec`（web search 旗標放在 `codex` 與 `exec` 之間，`exec --help` 看不到它）；`python3 wf/tools/tabledb.py` 驗 wf-table/1；`wf/tools/inbox_mail.sh <線> --to plan-intrigue` 讓不編隊的工人回報到規劃線而非頂層。

## 證據

- wf-lint：見下方貼入的 SUMMARY 行。
- codex 終局信：`wf/inbox/mail/plan-intrigue/20261024T1620-cx-intrigue-ref-DONE.md`（已 ack）。
