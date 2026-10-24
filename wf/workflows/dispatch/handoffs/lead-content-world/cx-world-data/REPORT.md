# cx-world-data：66 份營運資料完成，固定三條驗收通過

## 做了什麼

親讀指定 AGENTS、wf 規則、護欄、真實型別、世界觀與範本後，依命名→科研→市場→遭遇→契約順序新增資料，每類完成均跑指定 lint 與內容檢查、輪詢 orders。上線已寄 PROGRESS。未修改既有檔，未碰 src、spec、lore 或其他線資料，未 commit。

最終驗收僅交接書固定三條：

1. `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world`：退出碼 0，末行 `OK 181 files`（工具實際成功格式）。
2. `node src/ops/content/check.ts content/base`：退出碼 0，末行 `OK 0 errors, 0 warnings`。
3. `git status --short content/base/world`：本線 encounters 15、contracts 11、names 22、research 15、markets 3，合計 66，全部 `??`，沒有 ` M`。共享目錄另有事件線的 `events/` 新檔，未計入本線。

本線資料最大檔為 `contracts/join-faction-front.json`，1,754 bytes；未觸及 72 檔或單檔 6 KB gate。不擴大驗收，不跑 npm test。

## 產出

遊戲資料根目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/`。

逐檔清單依 wf 的大清單規則存為 CSV，以表格工具產生；每檔一行，含 id、定位與可解析的相對檔案路徑。四表合計 66 行：

- [命名 22 檔](outputs-names.csv)：十文化神話名、機械三階與塞勒涅型錄、四族凶名與二名。
- [科研 15 檔](outputs-research.csv)：另列方向、幣／工時成本、解鎖與前置。
- [市場 3＋遭遇 15 檔](outputs-places.csv)：港口型錄、鹽鷗交易、殼學會攤位與三族三深度、六種人類對手。
- [契約 11 檔](outputs-contracts.csv)：另列 kind、主／選做目標、報酬式與參戰三段。

全部地形、地圖、部件、節點與服務引用均取自 `git ls-files` 所列既有檔；沒有引用其他線未提交品項。古代魂樹節點依護欄指定字串。遭遇與契約按交接書維持休眠交付，沒有改發包勢力或行動牌。

最得意的 3 件：

- 命名庫區分工具代號、系列、冠名與四族凶名，所有 culture 均避開既有小名文化。
- 心向鏈由守望走到「罕見的自我」，把人格留給深處；算與手則接上追獵與獨駕古刻。
- 參戰模板以集結、破陣、固守三段表達受雇加入勢力作戰，保留按頭金與回港船殼獎金。

## 沒做到或證據不足的

SPEC-GAP 逐項如下；均保持資料型別與交接範圍，不擅改引擎。

1. encounter 型別目前只生成裂獸，人類對手需要 roster 欄。六份人類遭遇的 map 與預算只是休眠主題，不能聲稱已能生成獵團或白手套編成。
2. escort、killTarget、reachExit 需要執行期單位 id；依護欄列為 optional 並用 role／tags 象徵參數。護送、二名懸賞、奪回遺物目前仍靠 survive／eliminate 主目標，選做目標等待綁定。走私上月也沒有渡輪到站目標，只能表達接敵存活；完成旗標不等於已實現跨月運輸或遺物入庫。
3. 戰中友軍與勢力補給需要型別支援。參戰採 kind=defend、三段 stages、perHead=320、船殼≥60 額外600，supplies=[]；沒有假造友軍或補給 id。外交選邊後果也尚無模板欄可表達。
4. 異形設定沒有潮錨，但交接配方要求核層 anchorHere=true；`rift-alien-core` 照配方交付，待接線前由領導決定此欄對異形的含義。
5. ResearchDef 沒有描述／等級限制欄。只有「心」向深處的節點才可能長出鮮明個性，屬 S 級以上極罕見現象；一般機魂仍照本宣科。項目名保留「深刻／罕見」，實際稀有率與人格門檻不由本線假造欄位。
6. 新拘束研究重用既有殼釘解鎖，精煉重用既有 medbay 服務：資料可研究，但不代表新增拘束強度或醫療效能，既有項目可能已可用。後續若要獨立收益，需要新配方／服務支援。
7. MarketDef 無敘述、密封艙檢驗與二手耐久欄，已提交部件也沒有 sealed-pod；新加坡以昂貴型錄與殼矢價格表達定位，密封艙外櫃位只寫在產出定位。鹽鷗二手語感用低價既有件表達，沒有偽造破損品屬性。

本次兩項檢查皆零錯誤，沒有需逐條歸責的別線錯誤。以上是內容／型別落差，不是檢查失敗。

## 需要決定的事

領導決定十一份休眠模板分別接到哪些勢力的 contractKinds 與行動牌，以及人類遭遇的 roster 與觸發來源。接線前一併決定異形核層錨位、象徵目標綁定、參戰友軍／補給／外交，與拘束、精煉的獨立收益。這些不影響本線固定驗收完成。

以後交接書該點名的工具：保留 inbox_poll.sh、inbox_mail.sh、lint_world.py、ops/content/check.ts 與 git ls-files；補列 wf/tools/tabledb.py（逐檔清單）及 `git status --short --untracked-files=all`（精確件數）。也請註明 lint 實際末行是 `OK N files`、check 是 `OK 0 errors, 0 warnings`，避免把輸出格式誤認成失敗。
