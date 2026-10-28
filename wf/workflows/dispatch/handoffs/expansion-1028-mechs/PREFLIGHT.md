# 機甲隊前置盤點 — READY，未開始創作

2026-10-28；工人 `mechs_team_sol`（gpt-6.1-sol）；盤點 HEAD `c09b0269`。本階段沒有核定計畫或正式 worktree，僅親讀規矩、範本及查索引。完整逐檔已讀證據在 [readlist.json](readlist.json)，`full` 表全文、`query`／`count` 表限定資料查詢，不把索引狀態當驗收結果。

## 已讀與執行邊界

已親讀工作區與專案 AGENTS、兩層 WORKFLOWS／user／team-model、working／art、dispatch 與 content-batch；content 全部入口與原則 Markdown、world-pillars 全部子檔、lore style／people、core 類別契約與相關 world／design-notes 原文。範本與配套的全文閱讀分開記錄，沒有只讀上層摘要。

本輪以正式交接的限縮為準：只寫本目錄兩份報告，不跑測試、不改 content／引擎／schema／spec，不建分支、commit、push、刪檔、下載安裝、GUI、鍵鼠或螢幕；子代理 0。主樹既有 SESSION-LOG／CLAIMS 修改屬其他線，本線未動。歷史 inbox 未開啟或處理；P01 不裁決。正式內容須等待領導在同線交付核定計畫、manifest 與 worktree。

## 實際可參考的既有範本

**C 級通用線列／射手**：完整讀 `frames/bulwark-ii.json`、`longspear-v4.json` 與 `bodyplans/mx-biped-c.json`；同名 `world/models` 也已讀。C 骨架六部位、十二層，武器槽實際為 `left-weapon`／`right-weapon`，另有 `armor-mount`、`system-1`、`sensor-mount`、`back-1`；不是用部位名當 slot id。兩台現有 frame 均已有 defaultLoadout，可沿結構重用，但不可照抄成定位相同的新機。

**A 級隊長／王牌**：完整讀 `frames/bulwark-old-city.json`、`selene-aurora.json` 及同名 model。可參考命名、兩池、內建增益與登場／前代欄位的差異；兩者分別用 `mx-fortress-a`／`mx-ace-a`，不是 C 骨架的替代名。本階段未全文讀這兩個 A 骨架，也未核所有預設配件，正式選用後必須再讀直接配套。

**武器與效果鏈**：完整讀凡鐵連吼／紋刻連吼／裂鱗爆甲／縛獸拘束矢四個 component；能力 `mx-iron-burst`、`mx-rune-shot`、`mx-cloud-piercer`、`mx-bind-shot`、`mx-guard-stance`；效果 `weapon-jammed`、`mx-netted`、`mx-guarding`、`mx-airborne`、`rooted`。已有「武器＋自帶矢池＋AP 成本＋燼產出＋AI 鍵」、外掛裝甲 layersAdd、自身必中增益的範例，不必發明新動詞或 registry。紋刻連吼不帶 conventional-arms，可作對獸配裝的既有候選；實戰與平衡未驗。

**血統／機型**：完整讀 `world/lineages/jinghai.json`、`universal-bulwark.json`、`universal-longspear.json`。通用系列來歷、maker／generic／exportPolicy、requires／availableFrom 均有現成結構。frame 的 `lineage-*` 標籤與 ModelDef 的 lineage 引用不是同一欄位，不能把 `lineage-kuafu` 直接當 `lineage/kuafu` 路徑；本庫無同名 kuafu lineage 檔。新增機必依核定血統與可用 lineage 分別核對。

**古代類邊界參照**：完整讀刑天、佩倫 frame 及 ancient-warden 骨架；只確認 repair-only、共鳴、無部件槽、獨有能力／池的現成表達。佩倫是既有唯一積燼例外，不能把它當一般古代機模板。未因此授權本輪新增古代機或新設計。

## 索引、配套與 draft 風險

tabledb 限定查詢顯示：當前索引 frame 202 筆（active 170、draft 32）、model 91 筆（active 79、draft 12）、component 186、bodyplan 71。這是索引快照，不是 loader／整合驗收。十二個 draft model 分屬 `wl-mechs-1027` 六台、`wm-r7-mechs-1027` 三台、`wn-r3-mechs-1027` 三台；渡口、守燈、回舷、留像、開扇、留潮等定位已存在，正式候選要比對功能、情境與配裝，不只比名字。

content_index 反查可見 `frame/bulwark-ii` 被 11 檔引用、`bodyplan/mx-biped-c` 被 15 檔引用、`lineage/universal-bulwark` 被 19 檔引用。不可為了新內容直接改既有基底。查詢只讀，沒有重產索引。

七輪待驗收摘要明載 82 概念／124 新 JSON／六條年表仍為 draft／deferred-by-user；歷史 215 件與舊線亦未驗收，本線不接手或補判。索引 active 只是帳本推導狀態，不等同 verified。

## 過期說明與不可自行決定事項

EF-14／mechs.md 仍寫「沒有任何 frame 填 defaultLoadout」，但已讀四個機械範本都有；EF-16／numeric-bands 的抵抗性現況仍停在全局 0.1。較新 core 攻擊規則、constraints DN-W-14 與 world/resistance 已記 10/26 分級抵抗性落地。本線只記不一致，未修改任何一邊；正式產出遇此問題以直接相關 code／tests 核當前事實，不憑舊摘要補引擎。

範本本身也不能無腦複製：長槍-V4 沒有 lineage-* tag；極光缺 human／series tag，與 mechs.md 要求不完全一致。jinghai lineage 的 source 指刑天 frame、敘述卻稱月面靜海藍本，亦須留意既有表示法，不自行改寫歷史。共鳴／承擔、機魂不可複製與 S 級人格、鐵偶／遙控機、核心用詞均依使用者裁示；P01 失腿、未決機制、舊 lore 真偽與血統矛盾不在本線裁決權。

## 本階段三條驗收

1. readlist 記本人全文閱讀與限定查詢，未把未讀的 A 骨架冒列全文。
2. 本報告列現有範本、配套、draft 與矛盾，沒有產出新創意或冒稱內容驗收。
3. 只產本目錄兩檔；正式交接 `brief_lint --strict` 為 0 違規。沒有執行 npm／loader／lore／probe／sim／MCP／測試；等待原生 followup。
