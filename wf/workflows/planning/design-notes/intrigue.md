# design-notes／intrigue — 局勢與掙扎（規劃線提案，2026-10-24）

[design-notes 入口](../design-notes.md)｜[planning](../../planning.md)｜守則 [world-pillars](../../content/world-pillars.md)｜REPORT [plan-intrigue](../../dispatch/handoffs/plan-intrigue/REPORT.md)

**這不是裁示，是規劃線（Fable，線名 `plan-intrigue`）寫給使用者拍板的設計筆記。** 與 design-notes 其他子檔不同：那些是使用者原話，這份是提案，每一條都可以推翻。不改 spec、不改 `src/`；要動 spec 或引擎的地方全標成「提案」，彙整在 REPORT。

## 出發點

使用者 2026-10-24 重溫 Modern Warfare 初代三部曲，說吸引他的不是表面特徵，而是「背後錯綜複雜的局勢，以及主角在其中的掙扎」：每一方都有站得住的理由（謝菲爾德失去三萬部下、扎卡耶夫覺得國家被出賣），前一代的結局成為下一代的動機，仇恨一路接力；主角是棋子、只看得到局勢一角（Roach 與 Ghost 被燒掉、No Russian 的艾倫、普萊斯與 Soap 脫離體制），服從與良知、忠誠與真相互相撕扯。

## 核心論點（一句話）

**局勢不是寫出來的劇本，是讓每個勢力的理由、舊帳與需要互相咬合；掙扎不是選項題，是玩家永遠晚一步才知道自己剛替誰做了什麼——而船上有人早就知道。**

本作天生適合這件事：玩家是傭兵，站在勢力的縫隙裡，先收錢、後知道；契約本來就有資訊迷霧（敵方快照只寫族與寬度）；蝕潮本來就是所有人擴軍與奪權的理由；古代機是核武級的籌碼；債務是逼人接單的現實；船員各有來歷。缺的不是新系統，是把這些東西**接起來**，並且**延後揭露**。

## 子檔導航

<!-- wf-nav -->
| 子檔 | 回答什麼 |
|---|---|
| [intrigue/references.md](intrigue/references.md) | 參考作品各自怎麼做「局勢」與「掙扎」、抽出的六條手法與四個陷阱；明細在 `references.json`（codex 查證，附來源連結） |
| [intrigue/motives.md](intrigue/motives.md) | 本作的勢力動機網：四條主軸、誰需要戰爭、誰從蝕潮得利、蝕潮怎麼被拿來當藉口；逐勢力表在 `motives.json` |
| [intrigue/fog.md](intrigue/fog.md) | 契約的三層真相與揭露管道：先收錢、後知道，但在下一張同雇主契約之前 |
| [intrigue/chain.md](intrigue/chain.md) | 後果怎麼跨蝕月、跨年連鎖：記憶回頭咬人、作戰的名目與動機、債務逼單、紀念日 |
| [intrigue/crew.md](intrigue/crew.md) | 機師與船員的忠誠與掙扎：牽掛、艦橋門口的反對、良知累積、機魂的租約 |
| [intrigue/systems.md](intrigue/systems.md) | 落到引擎：哪些現在內容就做得到、哪些要新做；對照表在 `engine-gaps.json` |
| [intrigue/arc-sample.md](intrigue/arc-sample.md) | 劇情弧樣本「鹽灘三約」：一張清剿契約連到三個蝕月後的揭露 |
| [intrigue/tide-sky.md](intrigue/tide-sky.md) | 與天象設計 [tide-sky](tide-sky.md) 的交會：蝕訊四來源就是情報版本、星候是藉口、三種聲音是三個勢力的政治、連珠潮是局勢最密的一夜 |

## 四條不碰的線

守住 world-pillars：勢力不只等玩家（W4）、勢力會互打也會和（W5）、沒有強制主線與劇情鎖（W6）、戰場上每一方有意圖、達不到就撤（B8）。所以這份筆記裡沒有「主線任務」——劇情弧樣本是**沙盒裡會自然長出來的一種路徑**，不是關卡。揭露靠事件、信、酒艙、戰場物件與買來的情報，不靠過場；玩家可以永遠不知道真相，也可以花錢早一步知道。

## 最值得拍板的五件事

1. **揭露要不要延後**：建議一律在收錢之後、下一張同雇主契約之前（約 3–10 天）；立即揭露會變成選項題，永不揭露會變成運氣。
2. **船員能不能走**：建議能——良知累積（strain）到 3 就擲離團，人帶機走的機率看牽掛種類；不能走的話所有兩難都沒有牙。
3. **雇主能不能在戰場上撤走空援**：建議能，但只有歸還黨這種「有理由」的雇主會做，且事後 memory 會記 `abandoned-you`，玩家可以討回。
4. **情報要不要當商品賣**：建議要——哨所潮訊、鹽鷗紙條、背面名單同一件事三個版本；這也是與天象線最自然的交會。
5. **玩家要不要能「請夸父下山」**：這是本筆記唯一碰到古代機頂層的提案——守寢人拒絕用答案，有人出錢請你去逼他們；建議留作中後期一條線，不急。

## 交接

- 使用者裁示 → 寫回 design-notes 對應子檔，規劃線再補守則（world-pillars）。
- spec 改動與引擎工作 → REPORT 的提案清單；要動工時開 feature-dev 線，切線按 `engine-gaps.json` 的列。
- 與 [tide-sky](tide-sky.md) 的交會 → 兩線各自 REPORT 點名，由頂層合併；共定兩件事見 intrigue/tide-sky.md 末段。
