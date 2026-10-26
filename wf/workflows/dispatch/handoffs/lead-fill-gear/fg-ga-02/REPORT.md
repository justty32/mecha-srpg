# cx-fg-ga-02 REPORT

## 已讀清單

以下20份皆親讀；JSON以指定工具分片讀取，未將整份索引倒入context。

- [AGENTS.md](/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md)
- [wf/workflows/common/user.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/user.md)
- [wf/workflows/content/README.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/README.md)
- [wf/workflows/content/batch.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/batch.md)
- [wf/workflows/content/mechs.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/mechs.md)
- [wf/workflows/content/abilities-effects.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/abilities-effects.md)
- [wf/workflows/content/numeric-bands.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/numeric-bands.md)
- [wf/workflows/content/numeric-bands.json](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/numeric-bands.json)
- [wf/workflows/content/engine-facts.json](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/engine-facts.json)
- [wf/workflows/content/world-pillars.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/world-pillars.md)
- [wf/workflows/content/polish.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/polish.md)
- [content/lore/README.md](/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/README.md)
- [content/lore/style.md](/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style.md)
- [wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md)
- [wf/workflows/dispatch/handoffs/fill-rulings.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/fill-rulings.md)
- [wf/workflows/planning/specs/core/data-model-mech.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/data-model-mech.md)
- [wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md)
- [wf/workflows/planning/specs/core/data-model-abilities-effects.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/data-model-abilities-effects.md)
- [wf/workflows/dispatch/handoffs/lead-fill-gear/plan-ga/plan.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-ga/plan.md)
- [wf/workflows/dispatch/handoffs/lead-fill-gear/plan-ga/fg-ga-02.specs.json](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-ga/fg-ga-02.specs.json)

另讀本線交接單、manifest、WORKFLOWS、SESSION-LOG、WAIT_USER、conventions、code-map、dev-env、testing、data-files，及世界支柱的機械命名／人機關係／基調子頁。已分片查既有部件索引並讀同槽部件、能力與效果範本、實際骨架及相關結算實作。開場待辦計數各1、inbox/new無信；本線範圍限定，未改共用狀態檔。

## 結果

**FAILED**。已新增恰14個內容檔（10部件、2能力、2效果）。第1、4條通過，第2、3條未通過；不得據此收為整批DONE。基底 `a1463faeb0712226b1e537e48844e6727829f83f`，正式收件與manifest記錄由領導處理。

## 固定四條驗收

1. **PASS：範圍、id、欄位與registry。** [gate.json](gate.json)批准14檔、violations=[]。所有新id各出現一次；10部件origin均mechanical，能力與效果依現有合法欄位，未添加origin等未知欄。attrMods／contribs的source均為自身id。與逐檔規格逐節點比對，只有etymology潤飾，英名、中名、數值、引用均未變。既有追蹤檔與黃金／營運fixture未改；[verification.json](verification.json)逐檔留件數、容量、比對證據，最大內容檔1085 bytes，均≤16KB。node_modules為開場既有連結，gate另忽略工具快取。

2. **FAILED：固定npm驗證未全綠。** 三條指令各跑一次。check exit 0，末行 `OK 0 errors, 10 warnings`；typecheck exit 0。npm test exit 1，原始TAP有14個檔案級not ok，其中11個SIGTERM，未產生最終tests/pass/fail總表。不能證實「無新增失敗」，也未把它們冒稱基底既有失敗；未改引擎、測試或fixture，未加跑整套。原始紀錄：[check.log](check.log)、[typecheck.log](typecheck.log)、[test.log](test.log)，結構摘要見[checks.json](checks.json)。逐檔數值與命名照規格。

3. **FAILED：8件常駐修正未生效。** 已實裝10件於frame/bulwark-ii／bodyplan/mx-biped-c的torso.system-1（systemMount、容量1），各留核心、人類駕駛及既有兩把精粹武器；正式frame與scenario未改。逐件與不裝系統件的同配裝對照，部件HP層存在，但8件的poolMods或attrMods未套用。例如AV-2預期heat.max=120／regen=-12，實際100／-15；沉盞流光槽預期charge.max=75及initiative=3，實際50與5。8件16項不符的實際值完整列在[smoke.json](smoke.json)的observed.components／failures；不得以scratch手動加貢獻補過。

   runBattle seeds 1–5完成數：5；例外數：0。各場結果：1：9輪／0次新能力／outcome；2：10輪／2次新能力／outcome；3：10輪／2次新能力／outcome；4：9輪／3次新能力／outcome；5：9輪／2次新能力／outcome。初版15單位同場runner在第四場期間exit137，該次未算完成；保留中斷紀錄後，以獨立程序、小配裝場完成seed4與5，未重跑已完成的1–3。兩個後續場各裝汲光卷與開燼閘；前3場各裝齊10件。AI的AbilityUsed：ability/fa-draw-light＝4；ability/fa-open-vents＝5。人工有效使用數：2；人工與AI分列，未混計。人工tryCommand分別驗AP扣3、實際效果與非零池回復差值、負面發動條件、兩次owner-turn更新及效果移除後還原。既有時鐘在回合開頭先減ownerTurns再regen，因此n=2的第二次後續更新先移除效果，只觀察到第一次後續regen增益；保留規格，不私改n。完整逐seed事件、命令與hash及人工事件紀錄均列於smoke.log；原始runner見[smoke-runner.mjs](smoke-runner.mjs)，中斷前輸出見[smoke-runner.log](smoke-runner.log)，續跑程式與輸出見[smoke-resume.mjs](smoke-resume.mjs)、[seed4](smoke-seed-4.log)、[seed5](smoke-seed-5.log)。純輔助招不以單挑勝率退件。

4. **PASS：交付證據與審核表。** 本REPORT開頭列親讀清單及四條結果；[review.json](review.json)為wf-table/1、14列、白話最多23字（上限60）；[naming.json](naming.json)14列保留提案英名、意涵與中文名。smoke.json、原始runner、逐seed及人工事件紀錄齊。REPORT≤12KB，內容檔恰14個。scratch僅在/tmp/cx-fg-ga-02，報告與原始紀錄僅放指定報告目錄。

## 數值帶與需求

無自行超帶調整。D hp12/mass2、C hp16/mass3、B hp18/mass4；非武器systemMount size1沿計畫指定槽容量。純輔助packets=[]，AP3／cooldown3／每戰2次；池與短效幅度照逐檔底稿暫填，數值統調留後續。

需要領導接引擎線：ComponentDef.poolMods與attrMods在本基底未套用，影響本批8件；src/rules/state.ts的makeUnit建立池與部件層後未安裝部件修正，src/rules/pools.ts的poolDecls僅合併部件pools。這不是內容格式錯誤，依交接單不得修改src、追加替代效果檔或重設機制繞過。兩個新能力皆有AI有效使用紀錄（汲光4次、散燼5次），smoke.aiGaps=[]；不需擴修AI。另需由領導確認npm test的檔案級失敗／SIGTERM原因，再判「無新增失敗」。

命名皆為提案；塞勒涅部件聲望35門檻及上架需後續營運支援，本線未放入ComponentDef的非法欄位。未commit、未carry、未更新索引、未執行領導專用content_accept或另建基底worktree。
