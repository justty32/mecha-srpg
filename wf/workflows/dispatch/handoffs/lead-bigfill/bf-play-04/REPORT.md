# 已讀清單

本線 cx-bf-play-04 親自讀過以下交接書先讀路徑；主 repo AGENTS.md 與共同規格、裁決、計畫／review-draft 以主 repo 唯讀來源核對，其餘相對路徑在 worktree 讀取。正式 manifest 在主 repo，worktree 的內容基準 HEAD 與其 base 相同。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/polish.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`
- `wf/workflows/planning/specs/ops/content-format-ops.md`
- `wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`
- `wf/workflows/planning/specs/ops/content-format-ops/factions-war.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-04.md`

補讀 wf/WORKFLOWS.md、SESSION-LOG.md、WAIT_USER.md、common/data-files.md、inbox/README.md，以及 world-pillars/world.md、bio-battle.md；templates.json 的營運事件列與 engine-facts.json EF-20／21 用 tabledb 定向查。本批 review-draft.json 恰好 12 列透過 tabledb 讀取，沒有整表讀入。

逐件 lore 皆親讀：review-rows.json「掛到」的 place/faction id 各自對應 content/lore/places、factions 下的同名檔，另讀 characters/choi-mugyeom.json 釐清拖機事蹟。逐件範本 port-raft-lantern.json、news-tide-street-sermon.json 與取捨範本 ruin-before-tide-glow.json、rival-practice-banner.json、restraint-empty-rack.json 均整檔讀過；另讀 templates 指定的 restraint-night-knocks.json、ship-stowaway.json。用 content_index.py refs 查既有 place/dhaka、place/chittagong、place/singapore；沒有重產索引。

# 做了什麼

DONE：在指定 worktree 只新增 12 個營運事件。正文採第二人稱現在式、各 97–111 字，每件都有氣味、聲音與可吼的句子。所有遠方事蹟透過抵港者重述或舊影呈現，沒有把遠方地點寫成玩家已可航往。十二件皆有 b 吼句與 c 真代價；六類限額核心意象沒有新增件。

when、where、weight、兩選項的 effects／requires 全部依本批 review 欄位定案落地。第一選項無門檻、只記 seen；第二選項明示錢／修料／休息與士氣或科研工時的取捨；兩選項都記 seen，沒有 next 或發契約。沒有新增遊戲欄位或新專名，標題皆沿計畫普通詞組合。

# 產出

內容位置：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-04/content/base/world/events/`。逐檔路徑、顯示標題、白話定位、lore 掛點與崩年底色，完整存於 [review-rows.json](review-rows.json)，恰好 12 列，白話最長 30 字；標題意涵與命名方法存於 [naming.json](naming.json)，恰好 12 列，nameEn 留空，沒有回譯 aka。三筆去重 append 存於 [inserts.json](inserts.json)：達卡、吉大港、新加坡各追加其 bf-receive-* tag。

正式 manifest：`/home/lorkhan/repo/game_dev/mecha-srpg/content/batches/2026-10/bf-play-04.json`；base／worktree HEAD：`8a48e7ef3e982b278e382d8a166cfc05a8564428`。manifest 未改動，沒有 commit。單檔 1495–1795 bytes、12 檔合計 20871 bytes，件數及容量 gate 均未觸發。

git status --short 原文（node_modules 是領導預置）：

```text
?? content/base/world/events/news-bf-almaty-mountain-oath.json
?? content/base/world/events/news-bf-incheon-shoulders.json
?? content/base/world/events/news-bf-tiksi-lantern.json
?? content/base/world/events/news-bf-wardens-still-door.json
?? content/base/world/events/port-bf-busan-hauling-song.json
?? content/base/world/events/port-bf-court-wet-banner.json
?? content/base/world/events/port-bf-golmud-raised-arm.json
?? content/base/world/events/port-bf-khulna-iron-chorus.json
?? content/base/world/events/port-bf-sail-first-needle.json
?? content/base/world/events/port-bf-sermon-no-kneeling.json
?? content/base/world/events/port-bf-seventh-child-watch.json
?? content/base/world/events/port-bf-surat-keys.json
?? node_modules
```

固定五條驗收的結果：

1. 恰好白名單 12 個新 content 檔，沒有修改任何既有檔；上方 git status 為證。
2. worktree `npm run check` exit 0，末行 `OK 0 errors, 10 warnings`；core 子段 `OK 0 errors, 32 warnings`。另跑 `node src/ops/content/check.ts content/base` exit 0、`OK 0 errors, 10 warnings`；`npm run typecheck` exit 0。原始輸出：[check.log](check.log)、[ops-check.log](ops-check.log)、[typecheck.log](typecheck.log)。每次 node 檢查前已跑規定 pgrep，只有本次 sandbox／shell 指令文字匹配，沒有其他測試負載。
3. `npm test` 未執行，依 bf-common.md「重負載限制」緊急令：「工人不准跑全套 npm test……交接書驗收若寫了 npm test，改為『不跑，領導收件後跑』」。此項依裁決交領導收件後跑，沒有宣稱測試綠燈或使用舊證據。沒有觀察到可列出的黃金紅測試／fixture；不是以未跑推定全綠。
4. review 12 列、白話≤60 字，naming／inserts 皆為 wf-table/1；逐檔觸發、效果與條件核對定案一致。沒有新增萬潮葬王、AI、月面營運內容。唯一 lore 掛點歧義的處理見「需要決定的事」。
5. 本 REPORT 存在，開頭完整列先讀；黃金風險與尚未套 inserts 的狀態記於下段。

沒有指向本批新事件的警告。檢查所列警告均來自未改動的 core monster／effect／frame／species／ability；沒有另跑基準比較。為避免將既有警告當新內容問題或省略原文，本次 check 的所有警告如下（末十行是 ops check 重複帶出的既有捕獲警告）：

```text
WARNING [content-load] content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING [content-load] content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING [content-load] content/base/monsters/nestmother-b.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING [content-load] content/base/monsters/nestmother-c.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING [content-load] content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING [content-load] content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING [content-load] content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING [content-load] content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING [content-load] content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [content-load] content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [band-evasion] content/base/effects/mx-faded.json $.contribs[0].value value 25 exceeds upper limit 22; source numeric-bands.json rows[18]
WARNING [soft-overflow-band] content/base/frames/bio-breaksurf.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-foam-jaw.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-reef-antler.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-shelf-back.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-shell-ear.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-split-fin.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-storm-mane.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-surf-runner.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-trench-maw.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/breaksurf.json $.pools[1].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/foam-jaw.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/reef-antler.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/shelf-back.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/shell-ear.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/split-fin.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/storm-mane.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/surf-runner.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/tidewolf.json $.pools[1].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/trench-maw.json $.pools[0].bands instinct: no band covers values above max
WARNING [band-damage] content/base/abilities/kx-tide-crush.json $.packets value 28 exceeds upper limit 26; source numeric-bands.json rows[7]
WARNING [mechanical-unarmed] content/base/frames/infantry.json $.defaultLoadout mechanical frame has no defaultLoadout or innate attack
WARNING content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING content/base/monsters/nestmother-b.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING content/base/monsters/nestmother-c.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
```

# 沒做到或證據不足的

尚未套 inserts，三個接收 tag 在本批 worktree 尚未啟用；這 12 件是等待合併接線的事件，不能宣稱已上主線可達。合併線只在原 tags 不含該值時 append，不能覆寫陣列；到港後仍須月份≥1、指定日槽與未 seen 同時成立，與同槽事件競抽，並非保證立即出現。

是否改黃金：接線後會，因事件進入世界抽選；孤立未啟用時預期不變，這是計畫判斷，本線未跑全套驗證。沒有改期望、執行 GOLDEN_UPDATE 或 rerecord。接線後全批驗證與黃金重錄交領導統一處理。

# 需要決定的事

慶州古陵掛點有歧義：計畫把 faction/shell-wardens 與 place/gyeongju-tombs 並列，並說「守寢人的舊影」；既有古陵 lore 寫的是釜山城邦守衛輪值，守寢人主要在夸父之窩。本件保留兩個審定掛點，寫成「守寢人的來客在港邊看慶州古陵舊影，影中是釜山城邦守衛」，不把守寢人改成當地守軍、不增加遠方歷史事件，畫面止於內殿外。請領導審閱此掛點解讀；沒有修改任何舊 lore。

沒有新專名提案或需要補引擎的新增欄位。其餘未套接線與全套測試交領導，無需使用者先決策。

# 子代理

未開子代理；由本線親自閱讀、落稿與檢查。沒有子代理額外成本或交接失真，品質證據為定案欄位核對與上述檢查輸出。

# 以後交接書該點名的工具

沿用現有 tabledb.py、content_index.py refs、npm run check、ops content check、typecheck、inbox_poll／inbox_mail 即可。交接書的 npm test 驗收應直接寫成緊急令的「不跑，領導收件後跑」，並點名正式 manifest 位於主 repo；本批不需要額外工具、probe 或長測。
