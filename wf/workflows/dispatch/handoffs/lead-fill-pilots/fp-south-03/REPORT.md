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
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/cx-fp-south-03.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`

以上由主工人親讀；相對路徑依交接書以主 repo 為準，既有同版本檔讀隔離 worktree。規劃產物、fp-common、fp-rulings 與 deep-rulings 讀主 repo。people／pools／batch-files 用 tabledb 依 batch=fp-south-03 查詢；review-draft 以 tabledb 取本批對應 28 列。三個範本目錄全部親讀：38 個 person、13 個背景、4 個池。另讀 wf/WORKFLOWS.md、wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/workflows/common/data-files.md、wf/workflows/content/world-pillars.md、本批 manifest、所用地點／事件與勢力資料；核 src/ops/crew/shared.ts 的 employment 預設職類。

狀態：DONE。線名 cx-fp-south-03；batch fp-south-03；起點 27e6ea2f3481a4df855b19bfbf2760a65433fbf1，與領導已填實值的 manifest.base 及 worktree HEAD 一致。

完成內容與掛點

新增 8 個背景、8 個 human person、8 個 character、4 個池，恰好 28 檔。personSpec 與 backgroundSpec 全欄逐值相同；新池的 place、size、refreshOn、sources 與 pools 本批列相同。lore 均為三段、public，body 319–345 字，逐人保留崩前／崩後、招牌瞬間及原定引語。新專名只在審查名稱標「（提案）」。完整逐檔白話與掛點見 [review-rows.json](review-rows.json)。

維迪卡掛孟買門／歸還黨、底色1.11、F/G、N06與N08：用橙漆留下撤船方向。伊姆蘭掛同地同勢力、底色1.3/1.11、C/F、N09：拆開卡死機掌救人。南迪塔掛孟買門／沐蝕會、底色1.9、H/B、N06與N07：把供糧車推出倒塌牌樓。蘇哈斯掛同地同勢力、底色1.1/1.9、C/H：以醫護學徒身分留住傷者，不寫成駕駛。

卡莉亞妮掛舊陣列／稽古學會、底色1.3、A/B、N08：收回拓紙先扶撤民；只見刻痕餘光。普拉納布掛舊陣列／鐵砧、底色1.2/1.8、C/G、N08：壓低堅盾-I讓探勘人越過背甲。蘇蒙掛北方山脊／稽古學會、底色1.5、A/F：讓犁側跪接起斷路，不證實地下傳聞。帕德瑪掛北方山脊／紡織公會、底色1.4/1.8、E/G：抱走最後一鍋重新生火，等人齊才算開飯。

數值暫值來源：四名駕駛以 adewale-balogun；伊姆蘭、蘇哈斯、帕德瑪以 hana-sato；卡莉亞妮以 leila-nasser。背景範圍與費率依序使用 anvil-salvager（五人）、seventh-watch-child（蘇哈斯）、shell-field-student（卡莉亞妮）、selene-soul-mender（帕德瑪），實際採用規劃表完整 Spec。背景 traits=[]，人物只帶指定既有 effect，無新增 abilities、effects 或平衡調整。屬性範圍會覆寫招募實例的對應 attrs，不宣稱紙面 attrs 為招募固定值。

固定驗收（僅原定四條）

1. 通過。manifest.files、batch-files 本批列與實際新增檔集合完全相同，均為 28。git diff 對 base 及 staged diff 均無舊檔修改；唯一非本批未追蹤項為開工前已有、領導提供的 node_modules symlink，未動它。背景 person、池 sources／base place、人物 lore places／faction／events 與 relations 引用均存在，沒有跨批新檔依賴。新增總計 29,201 bytes，單檔最大 1,672 bytes，未觸件數或容量 gate。
2. 通過工人指定檢查。npm run check exit 0：loader「OK 0 errors, 32 warnings」，ops「OK 0 errors, 10 warnings」；42 次警告輸出均指既有檔，本批新增檔警告 0。node content/lore/check.ts exit 0：「errors=0 warnings=8」，八個新警告均為本批 character 的「未登記欄位 places」：imran-kelkar、kalyani-deshmukh、nandita-shetty、padma-bora、pranab-bhowmik、suhas-bendre、sumon-debnath、vedika-kamat。npm run typecheck exit 0，含兩個 tsconfig。npm test＝領導跑；依 fp-rulings 與使用者禁令，本工人未跑全套／e2e／sim／fuzz，未重錄黃金，沒有拿未執行測試冒充通過或套黃金豁免。原始輸出：[check.log](/tmp/cx-fp-south-03/check.log)、[lore-check.log](/tmp/cx-fp-south-03/lore-check.log)、[typecheck.log](/tmp/cx-fp-south-03/typecheck.log)。
3. 通過。review-rows.json 為 wf-table/1，columns 完全照指定，恰好 28 列、每列白話最多 37 字；[inserts.json](inserts.json) 為合法 wf-table/1 空表，columns=[file,jsonPath,op,value,why]。以 tabledb 讀寫兩表。8 人 born=2108-age，與規劃相同，皆未填 activeYears。本批唯一16–19歲者蘇哈斯為19歲／2089生：孕婦先避內陸親族、自存糧撐過斷鏈、後入難民灶，寫成罕見倖存醫護學徒；其餘人物不擴年資、不老設定。禁題掃描無萬潮葬王、AI或aiprofiles，新 effect 檔為0。開工前 grep 新人名、kebab名、背景名及新池id，主repo全content與其他五區 names-claimed 均0撞名（grep exit 1）。記錄：[name-grep.log](/tmp/cx-fp-south-03/name-grep.log)。
4. 通過。REPORT 開頭逐字列完整指定已讀路徑，以上附前三條證據；船員職類與 places 限制見下段。最後訊息依規定5行摘要＋REPORT絕對路徑。

未做到、需要決定與引擎缺口

沒有阻塞本批內容交付的待決矛盾。全套 npm test 尚未由本線驗證，交領導收件後統一執行；新增4池會改營運亂數軌跡，不能據此預判所有未跑測試的失敗都可豁免。沒有執行 probe、playtest、MCP、上網、commit、push、建分支、依賴安裝、既有檔插入或索引重產。

船員技師、醫護學徒、廚務等只有 tags、背景名與 lore 的主題表達，沒有職業加成、職類篩選或禁駕機制；cmdHire 呼叫的 employment 預設 role="pilot"，所以蘇哈斯「非駕駛」屬人物設定，玩家仍未被引擎禁止安排入座。招募卡 bio 與 culture 粒度也未於本線補做；全部沿用既有 bengal 名表桶，不將它解釋成相同族裔。

character.places 是共同規格要求，現行 lore check 尚未登記此欄，只報未知欄警告。保留指定掛點，不改 check、schema 或引擎；後續格式線可處理。孟買池使用 base place/mumbai，人物使用 lore place/mumbai-gate；歸還黨總部仍在蘇拉特。舊陣列與北脊求工均是隨船短停，沒有新增村落或駐軍。

子代理、成本與品質

子代理0，子代理成本0；本次由主工人親讀、展寫及核對。環境未提供計費token／金額，無法據實填主工人費用。品質證據為指定Spec逐值相等、八篇三段字數合格、引用與固定驗收通過；沒有另起設計或追加驗收。

後續交接書應持續點名 tabledb（含 Python API）讀寫資料表、grep 核名、git status／diff 核範圍、npm run check、node content/lore/check.ts、npm run typecheck，並明寫全套 npm test 由領導跑。scratch、核對腳本與[結構證據](/tmp/cx-fp-south-03/evidence.json)均在 /tmp/cx-fp-south-03；worktree 僅保留核定新content。完成固定四條後停止，交付 REPORT.md、review-rows.json、inserts.json。
