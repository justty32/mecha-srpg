# slim-1105 超標拆檔（F）與 tidy（G）

[slim-1105-plan](slim-1105-plan.md)｜流程依 [refactor](../refactor/README.md) 與 [tidy](README.md)

## F 超標拆檔

門檻照 STRUCTURE 觸發 A。19 個超標項逐列寫在 [slim-1105-split.json](slim-1105-split.json)，欄位是 `path`、`lines`、`kind`、`split_direction`、`conflict`。

- **程式碼 > 300 行**：18 檔，從 301 到 599 行。最大的是 `e2e/battle.spec.ts` 599 行和 `src/ops/world/lords.test.ts` 454 行。
- **workflows 文件 > 8192 bytes**：A～C 刪除範圍以外 0 份。wf-lint 基準是 oversize=0；要刪的 handoffs 裡有超標，但不必處理。
- **手冊 > 300 行**：只有 `legacy/docs/` 的 part2、part4、part6（318 到 375 行）。另外 legacy 有 6 份超過 8 KB，隨 legacy 的去留決定，不拆。
- **條列區塊 > 1 KB**：wf-lint 基準是 biglist=0，只有 4 份 BIGLIST-LINKS warning，都是給人點的導航表，照規則留在 md。`find_big_lists` 另外抓到 playtest-1105 和 audit-paused-1105 報告裡的散文清單，那是報告，依新保留期會自然刪掉，不抽成資料檔。

**和試玩修正線的衝突。** fix-playtest 的 worktree 已經 commit 的 diff 碰了 `src/mcp/*`、`src/ai/knowledge.ts`、`src/ui-adapter/vm/{viewmodel,labels}.ts`、怪獸、effects 和 scenarios，以及 code-map.json。尚未 commit 的改動沒有去看，因為規定不碰那棵樹。Fable 三題的實作也會動戰鬥核心。

所以有 8 檔要排在這兩條線 merge 之後：

- `src/ui-adapter/vm/viewmodel.ts`：已經被改過。
- `src/ui-adapter/vm/controller.ts`、`src/ui-adapter/dom/render.ts`、`e2e/battle.spec.ts`：戰鬥 UI。
- `src/core/types-def.ts`、`src/rules/state.ts`：核心型別與規則。
- `test/ai/intent.test.ts`：AI。
- `src/content/loader.ts`：怪獸與效果內容的載入。

現在就能做的 10 檔都在 ops、sim 和 wf/tools，與戰鬥無關：lords.test、sortie/scenario、actors、content/check、sim/policies、ops render.test、sim/probe、brief_lint、content_index、content_gate。注意 `content_index.py` 改完要讓 index.test 綠燈；sortie/scenario 會產生戰鬥情境，風險低但不是零。

拆法照 refactor 工作流：先跑測試記基準，一次拆一檔、拆完就驗，最後更新 code-map。驗證要跑 node，全機一次只准一個程序，所以要由頂層排程，不能和 fix-playtest 的測試同時跑。

## G tidy

**不同用途混放的資料夾：**

- `handoffs/` 頂層：活的 backlog、內容批次狀態表、交棒散檔和 42 個舊線目錄混在一起。A～C 刪完後只剩 3 個 1105 目錄和 README。`engine-backlog.json`／`.md` 不是交接書，建議搬到 `planning/`。src 註解只用「engine-backlog N」稱呼它，不寫路徑，搬了不會斷。
- `wf/workflows/content/tools/stats.ts`：工作流文件夾裡放了程式碼，建議搬到 `src/sim/` 或 `scripts/`。
- `wf/notes/`：刪掉兩份 close 之後，剩下 investigations、art-review 和 github-pages-1029。建議 github-pages 併入 dev-env，art-review 併入 `art/README.md`，notes 就只剩 investigations。
- `art/` 的四個試作各自把 evidence 圖混在原型旁邊，見 D 類的建議。

**小檔（< 1 KB）太多的地方，結論是不用合併：**

- content 有 1489 個小檔，但一實體一檔是 loader 的設計，不能合。
- `test/golden`、`test/campaigns` 的 hash 和 `src/ops/world/fixtures` 是測試資料。
- `art/mech-blueprint/parts` 有 39 個小檔，是原型的零件，隨 D 類決定。
- `wf/inbox/orders`、`handoffs/state` 會隨 C 一起刪。

**handoffs 頂層 42 個未歸檔目錄的去向：** 全部歸 B 或 C，直接刪，不再搬 done。plan-\* 和 talk-\* 這 7 個屬 D，先確認是否已被 design-notes 吸收。四條暫停線先依 audit-paused-1105 結案。

**導航和實際結構不一致的地方：**

- `wf/INDEX.md`：src 那列漏了 `ops`、`mcp`；content 那列漏了 `lore`、`index`、`batches`；`tools/`、`workflows/` 兩列沿用模板的根目錄路徑，實際在 `wf/` 底下，而根目錄沒有 `tools/`；沒有列出 `art/`、`e2e/`、`scripts/`；`wf/archive/` 那列要隨 A 一起刪。
- `art/README.md` 漏了 mech-blueprint。
- `wf/notes/README.md` 漏了 close-night、github-pages、art-review。
- `dispatch/README.md` 的內容表沒列 lessons-leading 和 lessons-evidence。
- 這幾份的狀態敘述停在 10/28：`handoffs/README.md` 底下四節、`handoffs/STATE.md`、CLAIMS 的「活躍工人」，以及「四條舊線」。刪 C 時一起重寫成空表或一句話。
- wf-lint 基準有 broken=2，要在 tidy 時一起修。
