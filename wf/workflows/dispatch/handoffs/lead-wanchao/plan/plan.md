# 萬潮葬王填充計畫

已讀清單（cx-wc-plan 親讀；路徑相對 repo 根）：

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/README.md`（含可見度與 occurs）
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/plan-wanchao/plan.md`（全文含文末使用者裁示）
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md` 第五節
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/planning/design-notes/world/great-tide.md`
- `content/lore/events/wreck-crown.json`
- `content/lore/events/aegir-wakes.json`
- `content/lore/places/chittagong.json`
- `content/lore/characters/captain-hamid.json`
- `content/lore/characters/rashid-ironmouth.json`
- `content/lore/characters/anil-chowdhury.json`
- `content/lore/characters/fatima-begum.json`
- `content/lore/characters/molly-van-den-berg.json`
- `content/base/monsters/tidespine-chittagong.json`
- `wf/workflows/dispatch/handoffs/lead-wanchao/cx-wc-plan.md`

另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、data-files、inbox 入口與支柱細則。以 tabledb 查 engine-backlog 序 57–61，以 Python 讀 timeline.entries；查既有目錄、引用及蝕月長度。

## 固定處置

只交本目錄六檔。工作表 25 列、審核表 25 列，共 50 列。以下列號從 1 起；base 依賴指 backlog 的「序」。

| 件 | 落點 |
|---|---|
| F1 | inserts 1–2：封灘、少灘、南移交屍、市場／招募傳話、葛西 蓮；base-drafts 1–3：王跡三句 |
| F2 | new-events 1；base-drafts 4–5 路線、6–8 契約、9–13 五則 news |
| F3 | new-events 2；base-drafts 14 守牆情境 |
| F4 | inserts 3–7：哈米德、拉希德、阿尼爾、法蒂瑪、茉莉各一句 |
| F5 | timeline-ops 1–2：拍二 2109、拍三 2111 |

[新事件](new-events.json)、[插入](inserts.json)、[年表](timeline-ops.json)、[遊戲草稿](base-drafts.json)、[白話審核](review-draft.json)逐件對應。

兩個事件根欄固定 `occurs: possible`、`visibility: rumor`；三小節標題已列資料表，正文與 summary 均用條件語氣。年表照埃吉爾的 event＋rumor 掛法，不照抄它的 hidden。兩事件不互作先決條件，玩家不在場也可發生。

## 畫面與停筆

**海上移燈。** 第 8–24 蝕月某次大潮，且玩家已經歷至少一次大潮；2109 只是代表年。人沿吉大港外灘→鹽灘外海→第七哨外海→達卡北郊通海水道的河口追燈。哈米德守砲台、法蒂瑪接人、茉莉按一小時撤離、阿尼爾賣帶日期的目擊；另有拆船船工、殘聯聯絡員、解拘者各自做事。拉希德只派船，候鳥號不是必要條件。砲火只寫人看見的火光，不寫擊退或激怒牠。

封口／未封口各一句條件見聞，未封才寫當夜裂縫抬級，不是牠的選擇。改區固定「第七哨外海、孟加拉灣北岸一區轉淺蝕」，不兼做外灘解封或第二區。收在哨兵移旗、泥水滴到靴尖；不追殺、不撿核。

**城門未開。** 第 40 蝕月連珠潮，吉大港城門；拆船幫守門人、鐵砧駕駛員、殘聯軍械庫聯絡官三方同在牆上，均不具名、不立人物檔，不重用前兩拍的個人。三人搬傷員、托橫梁、傳補給。只藉天網消息交代同夜古代機影像，內容留白；不新增吉大港古代機或聲稱人人親見。

末句固定：「若那夜站在門邊，守門人會看見萬潮葬王停在城門外，手仍按著門閂。」到此停筆。回海與主動守牆開打只列情境出口，不寫結果；正面戰可選不必選，捕捉機會全遊戲僅此一次。前四十蝕月與當夜結果決定守住或第四核心。

第 40 蝕月按每月 28 日粗估約 1120 日，自 2108-01 起約三年，代表年取 2111；首月計數與朔望落點可能跨年，不以代表年替代旗標。依據為 great-tide、tide-sky、world/omens。

## 兩步命名

英文原名｜意涵｜中文名（均提案，送既定基調審閱）：

- Lights Along the Northward Shore｜人沿海岸挪燈撤人，看見黑脊｜海上移燈。
- Hands on the Gate Bar｜門閂仍在人手裡，下一步未定｜城門未開。
- The Crown's Last Sighting｜人留下的末次目擊，不是獸的意志｜王跡（沿已允提案名）。

其他草稿名為場面與任務的直述工作標題，不另造術語、二名或人物名。

## 風險與需要決定的事

既有 wreck-crown 有斬擊，且只列拆船幫與裂獸，不能宣稱它已滿足「不交戰／三方人員」；照不可改一字的明令保留。新增 F1 的 2108 碼頭場面安排拆船幫、鹽鷗、殘聯三方，不倒推為 2107 在場證據。原纜工不再登場、不升格；這是上游既有落差，非本線重寫授權。

葛西 蓮已有既有人物引用；本任務「無人物檔」按不新增、不改該檔執行，狀態只插地點文。法蒂瑪、茉莉標「待 tf-03」；合入後若錨不再唯一，領導先更新錨再套，禁止覆蓋 body。舊字詞不順手修。

base 草稿留交接區，世界移動與改區座標交 E1–E5 接入，產出線不猜格子、不設數值。來源、核心與意圖留白；不綁埃吉爾，不調來朝廷、北美、夸父或刑天。沒有待使用者補答的新題；新名字送既定審閱。

## 固定三條驗收

1. 六檔存在，五份 JSON 可解析。
2. F1–F5 每件均在對照表指定列落地。
3. 七列錨在各自原 body 恰好一次；兩事件引用 id 均有既有檔。

完成即停，不增加驗收。件數 2／7／14，未超交接 gate；目錄內容未超 60 KB。
