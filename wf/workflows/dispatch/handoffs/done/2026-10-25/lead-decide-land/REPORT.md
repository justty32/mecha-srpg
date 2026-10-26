# lead-decide-land 收線報告（2026-10-25，頂層代存）

[handoffs](../README.md)｜裁示來源 [talk-decide](../talk-decide/REPORT.md)｜B5 批次草稿 [b5/](b5/)

## 結論

talk-decide 裁示全數落地；中途加入使用者命名修正：機甲上那顆叫「機甲核心」，「精粹核」只指原料。驗收：wf-lint strict 違規全 0、lore check 0 錯、npm test 912／912。B5 三批只排未跑；引擎只更新 backlog。

## commit

`d2f96a3` talk-decide 收線｜`9ce8af7` design-notes｜`05c34ef` specs/world｜`cf9deda`＋`5e8fa69` 守則與 style｜`fc704a6` engine-backlog 與 B8｜`0572ec2` STRUCTURE B9｜`df81efe` B5 排批｜`5d37b1d` 用詞殘留｜`d7efc03` 收線

## 落地的設定

- 機甲核心不耗損；座艙有人（或機魂）才驅動，驅動才有招式與能力。
- 遙控與傳統 AI 只能「普通開」：精粹武器打獸只算材料傷害。
- 無人機兩種：鐵偶無核心、只能打人；遙控機有核心、能打獸但弱。
- 機魂能獨駕、成長慢（暫值 1/10）；「不可複製」照舊；推翻「不能獨駕」。
- 傳統 AI 在大潮時刻或古代機旁極小機率醒成機魂（暫值萬分之一）。
- 駕駛員老得慢（暫值 1/4）、能力跟人走、三系代價、lore 點名五人。
- 大潮全球同一時刻（晝潮／夜潮）；精粹天花板 S，SS／SSS 只在人的能力。
- 第 40 蝕月景象與反應、月面人口門檻約百萬、塞勒涅三階段知情。
- 新檔：`design-notes/world/drive.md`、`design-notes/world/great-tide.md`、`specs/world/pilots.md`、`content/lore/style/people.md`；守則加 M12、M13（共 37 條）。

## B5 翻譯腔三批（未開跑）

dl-01 勢力全部＋開局人物 41 檔、dl-02 人物 40、dl-03 人物／時代／年表／事件／地點 40；三批不重疊可並行，lore 裡「精粹核」「獨駕」殘留都在內。manifest 與交接書在 `b5/`（brief_lint 0），開跑時填 `base`、把 `$WT` 換成 worktree 路徑。`allow.proseFields`：consequences、role、scale、doctrine、ideology、mechSeries、status2108。事件 56＋地點 48＝104 檔記在 codex-batches 第 14 列未排。

## 引擎 backlog

第 30 列併 35、46（機甲核心與座艙狀態、白手套六情境改寫），可先派，小到中，改完重產黃金；原「移除機魂獨駕」作廢。47（人帶能力）、48（驅動時數與外貌年齡）、新 49（AI 醒成機魂）小規模，接在 30 後。45 與勢力草稿 `ancientMech` 合一；38 補大潮同一時刻。

## 範圍外殘留（未動）

- 「不能獨駕」：`specs/core/rules-people.md:29`、`specs/ops/time-and-tick.md:47`、`specs/ops/constraints-ops.json:286`、`wf/workflows/content/ancient-people.md:27`、`wf/workflows/content/templates.json:77`。
- 機甲上那顆叫「精粹核」：`ancient-people.md:27`、`constraints-ops.json:272`；`src/`、`content/base/` 無。
- `content/README.md:7` 守則條數仍寫 35（現 37）。
- 「No Russian」只剩 `design-notes/intrigue.md:9`（使用者重溫原作的劇情摘錄，非類比，未刪）。

## 待使用者決定

1. SS／SSS 怪獸去留：建議怪獸照掛旗，只是取不到可煉精粹。
2. 終局「駕駛員為零」是否算機魂：建議算；要改 specs/core 與 specs/ops，派第 30 列時一起授權。
3. 照建議寫進 `drive.md`「仍未決」：機魂成長慢只影響長能力；AI 醒魂後原程式保留。

## 注意

`essence.md`（8178 B）、`scale.md`（8184）、`terms.md`（8191）逼近 8 KB，下次加內容先拆。
