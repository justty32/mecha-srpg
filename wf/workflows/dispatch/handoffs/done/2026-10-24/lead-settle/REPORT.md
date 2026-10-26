# lead-settle 收線報告（2026-10-24）

[handoffs](../README.md)｜裁示整理 [guide](guide.md)｜來源 [lead-reconcile REPORT](../lead-reconcile/REPORT.md)

> 由頂層代存（harness 擋子 agent 寫報告檔）；領導原文為英文，頂層譯存。

## 結論

數字 v2 與所有已有暫定答案的世界觀題改為**已定**，落地到 design-notes、specs/world、world-pillars、style／terms。沒有暫定答案的題列在下面交使用者，沒有自行發明。九項 lore 矛盾以一批 codex polish（12 檔）加一批 add（聖馬洛）清掉，`places` 引用由領導手改。`src/` 未改，引擎影響寫成 engine-backlog 第 38–45 列。

使用者裁示（2026-10-24）：第 15 條 v2「OK」；世界觀未定題「就用暫定答案」。

## 做了什麼

**裁示整理**：`guide.md` 把兩句裁示展開成 D1–D16。D15、D16 是中途追加（落地清單 A′ 第 17、18 條也是暫定），已另發 order 給兩個 docs 工人。

**領導親改**
- design-notes：
  - `world/essence.md`：「未定」段只留凡鐵數值與精粹矢價格；詞表、魂核、祕法三形狀移進新的已定段並照錄原話；第 8 段由暫值改已定，保留「之後可微調」。
  - `world/scale.md`：v2 段改「已定（2026-10-24）」，未定段改已定，另加一行「仍未定」；`scale-v2.json` 狀態更新，創始 31 城語意照 R08。
  - `world.md`、`design-notes.md` 索引行。
  - `tide-sky.md` 加「使用者裁示（已定）」段，更正 52 月週期與讖語失真成因；`spec-proposal.md`、`mechanics.md`、`omens.json` 拿掉「每 52」。
  - `intrigue.md` 五題標已定；`terms.md` 指向天象詞表。
- talk-world：
  - `handover/open.md` 第 1、8、9 條標已定；第 1 條更正為南亞傘＋南亞／撒南雙籤城；7.5 和解項關閉。
  - `landing.md` 的 A′、14.3、B 註記已定；`rulings.md` 補記兩句新裁示原話；`HANDOVER.md` 第 0 節、表格、新 session 建議第一句。
- world-pillars：新增 W12（裏側的聲音）、W13（天象）；W2、W3、W5 更新，M5 加魂核天花板；守則 33→35 條，入口、`world.md`、content README 同步。
- style 與詞表：`style.md` 裂晶重新定義為未精煉的核（獸出或墟出皆是）、殘聯 31 為創始城；`glossary.json` 裂晶列更新、新增精粹與天象詞組兩列（23→25）；`numeric-bands.md`、`engine-facts.json` 暫值改已定。
- engine-backlog：第 38–43 列天象引擎工作（含 spec-proposal ops 第 13–20 列，屆時一併寫進 specs/ops）；第 44 列局勢五題；第 45 列 lore「隱藏真相」資料結構標記；第 28、34 列註記已定。

**codex 工人**（gpt-6-astra，reasoning high，交接書過 `brief_lint --strict`，隔離 worktree）

| 線 | 範圍 | 結果 |
|---|---|---|
| cx-st-01（polish st-01） | lore 矛盾 | 第 2 輪 ACCEPT，12 檔；領導在 worktree 補兩處，記在 leadNote |
| cx-st-02（add st-02） | 新地點 `place/saint-malo` | 第 2 輪 ACCEPT；領導移除空的 `aka`（地點不登記，會出警告） |
| cx-st-spec | specs/world | 新增 `omens.md`、`voices.md`；更新 README、setting、resistance、machine-souls、ruins、rifts、monsters、bio-mechs、factions，每檔 ≤ 8,192 bytes；領導補一處空格、還原「S 級以上」 |
| cx-st-lines | history-lines 八篇＋三個資料檔＋和解欄 | 暫定標記全改已定；領導另把工人留下的海洋推論也改掉（「其餘隨意」授權），圖例指向 D1–D16 |

## 暫定改為已定（逐條）

1. 數字 v2（「OK」）：人口 40 億；城邦 400；活躍裂縫 150（環太平洋 96）；衍型機 24,000；生物系 1,200；B 級以上衍型機 580（B 600、A 60）；古代機已知 120、醒 30；登記機魂 1,000；駕駛員 25,000、同期可用 72%；十五把傘。
2. 殘聯是南亞傘，創始 31 城；奈洛比、蒙巴薩、三蘭港為雙籤城（南亞傘＋撒南傘），奈洛比是中立會場（open.md 第 1 條）。
3. 詞表：源流／裂晶／精粹，不造「墟晶」之類新詞。
4. 魂核：核的等級是機魂天花板，核不可換，只有 S 級機魂有自我。
5. 祕法三形狀與各自的持有者。
6. 抵抗性數值：每低一級傷害減半，凡鐵算最低級，祕法最多升一級。已定但仍可調。
7. 裏側的聲音七點（第 8 條），含「迦梨真的是古代機」屬隱藏真相。
8. 天象落在人身上的五種方式。
9. 年表對上天象的四處。
10. 天象五題：連珠潮只在開局後第 40 蝕月發生一次，不採「每 52 月」；讖語出錯是蝕扭曲了聲音，不是故意說謊。
11. 局勢五題。
12. 蝕域內的國家：孟買潮信教團神權、拉哥斯外的枯萎匪邦；新獸族維持擴充旗標；生物系機甲在撒南傘是主流。
13. 使用者說的末日「漲潮」讀作「大潮」。
14. 首例口徑：2101 老爹是第一個登記機魂；2104 七號是第一個有自我意志的。
15. 傘的三型與六種分配機制（A′ 第 17 條）。
16. 四個時代、人口 90→40 億、「持平」與成因（A′ 第 18 條）；第 10 條海洋推論在 history-lines 的暫定標記改已定。

## 沒有暫定答案、交使用者的題

- 凡鐵打人、打機甲的數值；精粹矢價格。
- 雙籤城在兩把傘之間的權限怎麼分（R08）。
- 墟裡能不能出 S 級精粹（R24）。
- SS（五）與 SSS、蝕壓源頭、S 領主（仍只是旗標）、第 40 蝕月的景象內容與各方反應。
- talk-world 未定第 5、6、7.5、7.7、7.8、7.9 條只有提案、沒有暫定。最可能要裁示的是人口門檻與塞勒涅何時知情（7.8）、大潮是否是全球同一夜（7.5）。
- 各長線的劇情空白刻意留給沙盒。

## 九項矛盾

| # | 處理 |
|---|---|
| 1 | `nine-gates` 的 `places` 改指新增的 `place/saint-malo`（領導手改；st-02 建地點） |
| 2 | 約納斯：「再二十六年」改「再八年」（2097）；塞勒涅正文「二十年後」改「二十六年後」 |
| 3 | `port-farside-sealed-crate`：機魂接手改成發生在駕駛員昏迷、人仍在座艙 |
| 4 | 白手套定本：2098 原型是人駕的女武神保全機；2105 女武神首次無人化；2106 無人版進型錄。改了事變、鄭維舟、塞勒涅、白手套、tranquility-strike 各檔 |
| 5 | 女武神 2106：讀作無人版進型錄（同 #4） |
| 6 | 安地斯壁不是堅盾祖先，改為高地守備重甲與光幕線之首（基多、的的喀喀） |
| 7 | 恩凱在裂谷西崖，照地點檔 |
| 8 | 薩米爾 2096 停留十九天，照 `kali-found` |
| 9 | 潮信教團 `ancientMech`：資料不改（lore 本來就寫迦梨是古代機），可見度標記進 backlog 第 45 列；`content/lore/check.ts` 未動 |

另修殘聯規模句（「世界三分之一」改「約 10 億人」），因與 v2 衝突。

## 領導代做的取捨

- 2098 白手套原型兩說取多數說（人駕女武神），因此 batch 清單外的 `tranquility-strike.json` 也加進 st-01 改寫，理由記在 manifest leadNote。若要保留「遠端監督自動機」說，這兩檔需還原。
- cx-st-spec 為壓在 8 KB 內，刪掉 `setting.md` 開頭四標記行裡一則歷史註記（「第二版：…」）。

## 驗收（乾淨 worktree，2b5e748）

`npm test` 904/904；`npm run check` 0 錯 8 警告（既有）；`npm run typecheck` 綠；`node content/lore/check.ts` 0 錯 2 警告（既有）；`node src/ops/content/check.ts content/base` 0 錯。`wf-lint --strict`：broken=2（舊相對路徑指出 repo 外，只在 scratch worktree 失敗）、oversize=1（ROSTER 8,580 bytes，本線的格造成，需調度層歸檔）、CLAIMS BIGLIST 既有。兩批內容都第 2 輪 ACCEPT。

## 其他

- 收線時 e508999 誤帶 lead-grid 在 CLAIMS 自己那列的未提交改動；cfeec78 把該列還原成先前提交版，lead-grid 的工作樹改動未受影響。
- 未提交殘留：各批 `accept/` 產物（同 lead-reconcile）；工人信 8 封留在 `wf/inbox/mail/lead-settle/` 未 ack（ack 會寫 lead-grid 有未提交改動的 `done/2026-10-24/messages.json`）。
- 聖馬洛地點檔只列 `faction/rift-beasts`，沒加其他勢力。

## 暫存 worktree（未刪，交頂層）

scratchpad `st/` 下：`wt-st-01`、`wt-st-01-base`、`wt-st-02`、`wt-st-02-base`、`wt-st-spec`、`wt-st-lines`、`wt-verify`。

## 以後交接書該點名的工具

- order 可能在工人收工後才到，補充裁示要一開始就寫進交接書（cx-st-lines 沒收到 D15／D16 的 order）。
- 暫存 index 提交流程（`tcommit.sh --blob`）照用，但提交共用檔前先 `git diff HEAD` 確認沒帶到別人的工作樹改動。

## Commits

b8c6484、bd1956b、dc63cda、86be77e、2b5e748、e508999（收線）、cfeec78（收線修正）。
