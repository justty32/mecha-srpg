# 已讀清單

AGENTS.md（親自讀取 /home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md）  
wf/workflows/common/user.md  
wf/STRUCTURE.md  
wf/workflows/planning.md  
wf/workflows/planning/specs/world/README.md  
wf/workflows/dispatch/handoffs/lead-settle/guide.md  
wf/workflows/planning/design-notes/tide-sky.md  
wf/workflows/planning/design-notes/tide-sky/spec-proposal.json（tabledb get 0–11 逐列讀取）  
wf/workflows/planning/design-notes/tide-sky/mechanics.md  
wf/workflows/planning/design-notes/tide-sky/lore.md  
content/lore/style.md  

以上除特別註記者均讀隔離 worktree。另親自讀 WORKFLOWS、SESSION-LOG、WAIT_USER、data-files、inbox README／PROTOCOL；收到 orders 後再讀主 repo guide 的 D15、D16。

## 做了什麼

完成 9 檔修改、2 檔新增，共 11 檔；只寫交接允許的 world 檔與本 REPORT。未 commit。筆記與 lint 原始輸出在 /tmp/cx-st-spec/。開工 PROGRESS 已寄，終局按指定指令寄送。原有未追蹤 node_modules 未動。

依固定五條驗收：

1. omens.md、voices.md 存在，README 第 21、22 行各有導航。
2. world 全部 14 個 md 均 ≤8,192 bytes；最大為未改的 operations.md（8,174 bytes）。
3. 「待使用者確認」「暫值」「歸哪把傘未定」搜尋均為 0；README 與 machine-souls 明定 2101 老爹首登錄、2104 七號首被認為有自己意志與唯一自行回港。
4. 本次 bash wf/tools/wf-lint.sh --strict . 已完成，specs/world 無任何 finding。整庫 exit 1：既有 legacy 兩處壞連結、ROSTER 8,580 bytes、CLAIMS 大表；無本線新違規。原始輸出 /tmp/cx-st-spec/wf-lint.log。
5. 本 REPORT 第一段逐行列出指定 11 個路徑，下方附第 1–12 列落點表。

## 逐檔摘要

### omens.md

0 → 6,882 bytes。D8–D11、D13；第 1–12 列全部集中落地，含年表、蝕訊與營運。D9 將第 5 列月隱改重蝕，D10 不採每 52 蝕月與故意說錯。

### voices.md

0 → 4,027 bytes。D5、D7 七點；三祕法歸屬、聲音媒介、迦梨隱藏真相、第 40 蝕月同夢與留白。

### README.md

6,233 → 7,772 bytes。兩列新導航；D1 數字 v2 指向既有資料表；D2 南亞傘與雙籤城；D14 首例；依新增 orders 落 D15、D16。

### setting.md

8,139 → 8,094 bytes。D1 人口 40 億、10／28／2 億與城邦 400 已定；D2 雙籤城、D6 已定；D10 第 40 蝕月與 omens 指標。

### resistance.md

4,345 → 4,636 bytes。D3 詞表、D6 每級減半與凡鐵外甲一成／內核零；保留數值微調原話；D5 指向 voices。

### machine-souls.md

7,451 → 7,806 bytes。D4 魂核天花板、不可換核、搬家照舊、鮮明個性限 S；D14 老爹與七號首例。

### ruins-and-ancient.md

6,749 → 6,976 bytes。第 12 列認主天象與五星星圖；D7 夢召改五月夸父醒來、指向 voices；D1 古代機已知 120／醒著 30。

### rifts-and-territory.md

7,597 → 8,069 bytes。第 1 列改時鐘段與三層；第 2 列退潮窗口與當夜錨；第 2、3 列其餘細節指向 omens；D12 兩國成立。

### monsters.md

7,219 → 7,793 bytes。第 9 列抬級與星候指標；D12 四族與第五族擴充旗；D5 蛻皮例外；SS／SSS 待裁示照舊。

### bio-mechs.md

4,182 → 4,426 bytes。D12 撒南傘生物系主流；D5 蛻皮指向 voices，修正原「三條都不動等級」與已定例外衝突。

### factions.md

8,187 → 8,154 bytes。D1 數字改已定並指向 README；D2 殘聯改南亞傘；第 10 列歸巢改退潮。整檔縮短，其餘天象在 omens。

operations.md 保持 8,174 → 8,174 bytes，第 6–8 列依交接集中 omens；其餘未列檔未修改。

## spec-proposal 第 1–12 列落點表

下表 O＝omens.md；R＝rifts-and-territory.md；U＝ruins-and-ancient.md。O 各段完整收錄對應內容。

| 列 | 落點／改寫 |
|---|---|
| 1 | R 時鐘；O 時鐘與天上的門 |
| 2 | R 裂縫；O 裂縫、蝕域與裂獸 |
| 3 | O 裂縫、蝕域與裂獸；R 時鐘留指標 |
| 4 | O 時鐘與天上的門；setting 留指標 |
| 5 | O 時鐘與天上的門；D9 改重蝕 |
| 6 | O 蝕曆、蝕訊與營運節拍 |
| 7 | O 時鐘與天上的門；只排第 40 月 |
| 8 | O 蝕曆、蝕訊與營運節拍 |
| 9 | O 裂縫、蝕域與裂獸；monsters 等級觀 |
| 10 | O 裂縫、蝕域與裂獸；factions 等長換詞 |
| 11 | O 蝕曆、蝕訊與營運節拍；三成錯因蝕扭曲 |
| 12 | O 星候落在人身上、墟與認主；U 先民／認主 |

## 沒做到或證據不足的

無本線未完成事項。整庫 lint 既有問題不屬本線；本次只驗固定五條，不據此宣稱整庫通過。core、ops、design-notes、content 與引擎未改；舊提案的每 52 蝕月、月隱與讖語說法在其原檔保留，由相應線同步，本線 spec 已按 guide 改正。

## 需要決定的事

無新增待決。guide 指定的雙籤城跨傘權責、S 級精粹能否墟出、S 領主／SS／SSS 與蝕壓源頭、影像內容及各方回應、凡鐵打人與機甲數字及精粹矢價格等留白照舊。

## 以後交接書該點名的工具

無。
