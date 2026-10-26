已讀清單

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/planning/design-notes/world/pilots.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`
- `src/ops/crew/recruit.ts`
- `content/base/world/recruit-pools/`
- `content/base/world/backgrounds/`
- `content/base/persons/`
- `AGENTS.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/people.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/pools.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/batch-files.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/review-draft.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/cx-fp-south-01.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`

相對路徑以主 repo 為準；既有檔讀隔離 worktree 同版本，規劃及裁示讀主 repo。三個範本目錄全部親讀：4 池、13 背景、38 person。people／pools／batch-files 用 tabledb 的 batch=fp-south-01 查詢；review-draft 只取本批 31 列。另讀 wf/WORKFLOWS.md、wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/workflows/content/world-pillars.md、wf/tools/tabledb.py、wf/tools/tabledb_table.py、src/ops/crew/shared.ts、package.json，以及本批所用既有地方／勢力／事件與 character/rokeya-karim。

狀態：**DONE**。我是 cx-fp-south-01。完成本線核定 31 個新增 content 檔與報告交付物；全套 npm test 依 fp-rulings 與使用者指示交領導跑，未宣稱全套已綠燈。

## 做了什麼與產出

隔離 worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-south-01`。實際 base=`27e6ea2f3481a4df855b19bfbf2760a65433fbf1`，與 HEAD 一致；沒有使用 TBD。新增 9 組 person／background／character 及 4 個池，引用只用 HEAD 既有內容或同批新增檔。三角洲人物只在短停過路船求工，未建立村落或駐軍。

9 人完整掛點、出生／年齡／年資、職能、口號、字數與數值範本記於 [people-evidence.json](people-evidence.json)。每人 body 依崩前、崩後、現在與招牌瞬間三段展寫，323–335 字，既有 events 只作生命背景；里亞茲在 2102 年仍是撤離孩子，沒有幼年參戰。全批為 public，沒有揭露隱藏真相。

personSpec／backgroundSpec 全欄逐值採用 people.json；attrs 與 growth 參照 irina-sokolova／hana-sato／mitali-das／adewale-balogun／leila-nasser，費率與範圍參照 selene-test-retiree／anvil-salvager／seventh-watch-child／farside-navigator。背景 traits 空，person 使用指定既有 effect，perks 空，沒有新增 ability 或做平衡。招募實例的 attrRanges 會覆寫相關 attrs，故紙面 attrs 不是雇用固定值。

[review-rows.json](review-rows.json) 恰好 31 列；[inserts.json](inserts.json) 保留草稿唯一一列：向既有公會勢力 $.places 追加 place/dhaka-sail-court，尚未套用。其餘驗收機讀證據見 [acceptance.json](acceptance.json)，撞名證據見 [name-grep-evidence.txt](name-grep-evidence.txt)。

## 固定四條驗收

1. **PASS**：核定清單與 manifest.files、batch-files 本批列完全相同；git 追蹤檔修改 0、暫存修改 0，新增 content 恰好 31 檔。所有 places／faction／events／relations、背景 person、池 sources／base place 與既有 effect 引用存在。開場已有的 node_modules 為領導提供的依賴 symlink，非本線新增。總量 32,749 bytes，最大 1,759 bytes，均在 gate 內。
2. **PASS（本線檢查）**：npm run check exit 0，loader `OK 0 errors, 32 warnings`、ops `OK 0 errors, 10 warnings`；全部警告指向未修改的既有獸／effect／frame／species／ability，本批 base 新警告 0。node content/lore/check.ts exit 0，`errors=0 warnings=9`；9 筆均為本批 character 的「未登記欄位 places」，依共同規格保留。npm run typecheck exit 0。完整新輸出在 `/tmp/cx-fp-south-01/check.log`、`lore.log`、`typecheck.log`。**npm test：領導跑**；未跑全套、e2e、sim、fuzz、probe、MCP，未重錄黃金；沒有本線實測黃金失敗或豁免清單可主張。4 新池會改營運亂數軌跡，領導需依實際失敗判斷。
3. **PASS**：review-rows 31 列、固定五欄、白話最長 37 字（≤60）；inserts 合法且只有 1 列 append，與草稿一致。9 人年齡／出生／年資逐值相符，只有塔赫米娜帶 activeYears=17；14 歲阿爾皮塔未駕核心、61 歲比馬爾正常老去。三段均含崩前／崩後／招牌瞬間及指定引號口號。主 repo content 與其他五區 names-claimed 以 grep 查姓名、id／背景名／池 id：0 命中；禁止題材與新 effect／AI 檔為 0。
4. **PASS**：本報告開頭原樣列出全部指定先讀路徑及 fp-rulings，附前三條新證據；船員與 character.places 限制見下。子代理 0。最後訊息以 5 行摘要及 REPORT 絕對路徑收線。

## 未做到或證據不足、需要決定與引擎缺口

本線無 BLOCKED／FAILED 項。全套 npm test 尚待領導，沒有用舊輸出代替。未新增驗收條數，未執行一般 content 工作流的額外 gate／probe／試玩／wf-lint。

船員的 technician／navigator／gunner／crew／apprentice tag 只表達主題，沒有獨立職業加成、職類篩選或禁駕機制；cmdHire 呼叫 employment 預設 role=pilot。阿爾皮塔的「非駕駛」、比馬爾未驅動核心及里亞茲未獨駕是敘事設定，不能保證玩家不能安排入座。character.places 目前未登記為正式欄位；依共同規格保留，check 只警告，沒有修改 checker。文化暫用已存在的 bengal 桶。招募 bio、職類、禁駕與欄位登記如需落地，另交引擎／格式線；不阻塞本輪核定純內容交付。

refreshOn=quarter 逐值照計畫，實作 recruitsDaily7 依 neap 與當日去重刷新，不能解讀成固定每三個地球月。每池不重複抽未占用人，換輪不保證換人；雇用仍需停泊、現金與鋪位，並受 recovering／blight-lost 限制。

## 子代理、成本與品質

子代理：0。本線單一工人親讀、展寫與核對；token／金額沒有可讀的計費量測，不虛報。三個檢查各跑一次，依序耗時 0.42／0.05／0.44 秒；沒有重負載測試。一次臨時 tabledb 腳本把 Path 傳進僅收字串的 API，已改用 str 後繼續，非工具故障。

以後交接書應繼續點名：tabledb.py（含 Python API 的 load／Table.add／save）、grep（主庫及跨區占名）、git diff／ls-files／rev-parse（只讀邊界與 base）、npm run check、node content/lore/check.ts、npm run typecheck；全套 npm test 明列「領導跑」。本輪未寄 inbox、未 commit，交檔完成即停止。
