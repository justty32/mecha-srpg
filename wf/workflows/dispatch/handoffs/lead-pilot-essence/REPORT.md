# lead-pilot-essence 收線報告（2026-10-24）

[handoffs](../README.md)｜待討論筆記 [design-notes/world/pilots](../../../planning/design-notes/world/pilots.md)｜盤點 [pe-scan](pe-scan/REPORT.md)｜撤回的 spec 草稿 [specs-pilots-draft](specs-pilots-draft.md)

> 由頂層代存（harness 擋子 agent 寫報告檔）。撤回的 spec 草稿由頂層從 scratchpad 搬進本資料夾，連結改純文字。

## 結論

做到一半時，使用者改了裁示：「A 無人化與 B 精粹改人都先放著，下次由 Fable 對談一起想、一起改」。所以本線最後**什麼都沒落地**：

- 只留一份「待 Fable 討論（尚未定案、不落地）」筆記，附一個 codex 工人做的盤點清單。
- engine-backlog 加了三列，都標「待 Fable 對談定案後再評估」。
- spec、world-pillars、style、lore、`content/base`、`src/` 都沒有因 A／B 改動。
- polish／add 批次都還沒開，沒有 lore 改寫被帶回或提交，所以沒有東西要回滾。

## 做了什麼

**commit dda624a（本線唯一一個）：**

- 新增 `design-notes/world/pilots.md`（6,960 bytes；essence.md 已 8,125 bytes 放不下）。開頭寫明「尚未定案、不落地」；照錄使用者 A 原話、B 原話、B 補充原話與收件裁示原話；讀法草稿（未經使用者確認）；提案 P1–P9 當討論素材，寫在 B 補充原話之前，有出入時以原話為準。
- `design-notes/world.md` 加一節指標，標「待 Fable 討論」；`design-notes.md` 索引行同步。
- engine-backlog 第 46–48 列，都標待評估（見下）。
- 盤點產物：交接書 `cx-pe-scan.md`、`pe-scan/{scan.json, candidates.json, REPORT.md}`。
- ROSTER 一格已改「已收線」；`teams/pe` 已關隊。

**寫了但收工前還原（沒提交）：** world-pillars 新增的 M12／M13 與條數；`style.md` 的無人機與不老兩段；specs/world 的 resistance、machine-souls、README 改動；`design-notes/mechs/bonds.md` 的註記。都用 `git checkout` 還原成 HEAD。新寫的 `specs/world/pilots.md` 草稿沒有刪，現存為本資料夾 `specs-pilots-draft.md`。

**CLAIMS**：上線時加了自己那列，收線時移除；現在 CLAIMS 和 HEAD 一致。

## A：盤點到的說法（沒有改動）

既有 lore 大多已和 A 相合：白手套寫成「沒有精粹核、照術式行動、只打得了人、對獸無效」的無人鐵偶，等於「照規則行事的傳統 AI」。**白手套搬魂**在 lore、spec、年表都寫「搬七號的魂進鐵偶失敗且死了人」，沒有寫成成功或讓無人機變強，不需要改讀。

討論時要處理的點：

- 年表 2106「女武神入型錄：白手套專用 **A 級**型錄鐵偶」，以及 selene／whitegloves 勢力檔的「A 級鐵偶」。沒有精粹核就談不上等級，和「戰力一定比人駕差」有張力。
- 「全面無人化」「仿它不需要人的部分」（lunar-blockade）這類句子沒有寫明限制。
- 與 A／B 無關的既有矛盾：`design-notes/mechs/bonds.md` 與 `specs/world/mech-lifecycles.md` 仍寫「座艙裡可以只有機魂」，和「機魂不能獨駕」衝突。
- scan.json 共 35 列：A 有 2 列矛盾、23 列宜點明；B 有 10 列宜點明、0 列矛盾。

## B 的提案清單（只是素材，寫於補充原話之前）

| 提案 | 內容 | 開關 |
|---|---|---|
| P1 | 能力等級上限＝開過的最高等級機甲 | 綁最高等級／綁累計時數／不分等級 |
| P2 | 出擊 20 次長出第一個能力，之後每 40 次一個；大潮夜算三倍 | 首個門檻 10／20／40 次；大潮倍率 1／3 |
| P3 | 一人最多 3 個，種類依系別偏向 | 上限 2–4；系別偏向開／關 |
| P4 | 只有輕副作用 | 戒斷（預設關）；生物系反噬（預設開） |
| P5 | 現役期間老化約為常人 1/4 | 倍率 1/2／1/4／1/8；是否只有 B 級以上機才明顯 |
| P6 | 不影響認主；機魂不長這種能力 | 能力是否算進共鳴 |
| P7 | 無人機用不了人長出的能力與精粹招式，所以戰力比人駕差 | 遙控機能否用機體的精粹招式 |
| P8 | 社會連帶（「不老的」、勢力搶老手、沐蝕會的讀法） | 社會是否普遍知道開機甲會不老 |
| P9 | 退役後恢復常速老化、能力保留 | 退役後能力保留／隨時間消失 |

使用者的補充原話已定方向：能力分 SSS～D，精粹等級愈高能力通常愈強；機械系沒有代價；古代系帶來神性與天人之貌；生物系帶來小變異與獸性。P1、P3、P4 要依補充重寫。

## engine-backlog 新列（都標「待 Fable 對談定案後再評估」）

- **46（P2）無人單位不能用精粹能力、戰力低於人駕。** 現況：6 個白手套情境用機甲 frame 坐 `seat:"soul"` 的 `person/glove`；`skirmish-whitegloves` 一場 4 台、`rift-edge-nest` 5 台坐同一個機魂，等於同時違反「機魂不能獨駕、不可複製」。和第 30、35 列一起做。
- **47（P3）人帶能力。** 現況：人物的屬性、特質、perk、等級本來就存在人身上，換機會跟著走；但主動能力只來自機體與部件（`abilitiesOf` 只收 `innateAbilities` 與 `ComponentDef.abilities`），人物沒有自己的能力欄。
- **48（P3）精粹接觸計數與老化。** 現況：引擎沒有人物年齡，也沒有接觸精粹的計數。

## 候選不老駕駛員（交使用者決定要不要點出）

| 人物 | 出生 | 年資與狀態 |
|---|---|---|
| 丹增・卓瑪 | 2037 | 2089 認主夸父，約 19 年；body 有「十九年被抽乾」、被稱「老太」，但她上機時已 52 歲 |
| 伊內絲・瓦曼 | 2068 | 2092 認主維拉科查，在役 16 年 |
| 尹瑞英 | 2072 | 至少 16 年 |
| 格雷格・奧爾森 | 2055 | 約 15 年起跳；body 有「比任何時候都老」 |
| 伊爾瑟・布蘭特 | 2073 | 15–16 年 |
| 茉莉・范・德・貝格 | 2060 | 12–17 年 |
| 薩米爾・卡恩 | 2063 | 自稱認主，12 年 |
| M-3 | 不明 | 傳聞，9 年 |
| 金河娜 | 2074 | 8 年 |

其餘 14 人年資在 6 年以下或不明，全表見 `pe-scan/candidates.json`。

## 驗收（乾淨 worktree，dda624a）

`npm test` 912/912；`npm run check` 0 錯 8 警告（既有）；`npm run typecheck` 綠；`node content/lore/check.ts` 0 錯 2 警告（既有）；`node src/ops/content/check.ts content/base` 0 錯；`wf-lint --strict` oversize 0，broken=2 為舊相對路徑只在 scratch worktree 出現，biglist_links 3 處既有。

## 未清

- 工人信 2 封留在 `wf/inbox/mail/lead-pilot-essence/`，沒有 ack。
- 暫存：scratchpad `pe/wt-verify`（detached worktree）、`pe/logs/`。

## 以後交接書該點名的工具

- `style.md` 現在正好 8,192 bytes，下一條要往裡加字的線得先拆檔或精簡。
- 收件裁示可能中途改向。先做盤點與筆記、晚一點才開批次，這次因此不用回滾任何東西。

## Commits

dda624a
