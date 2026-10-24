# lead-content-ancient REPORT — 古代機甲 12 台＋人物 30＋機魂樹 4，全進 main（2026-10-24，頂層代存）

[設計表](design.md)｜[內容一覽 catalog.json](catalog.json)｜工人 REPORT：[cx-anc-a](cx-anc-a/REPORT.md)、[cx-anc-b](cx-anc-b/REPORT.md)、[cx-anc-c](cx-anc-c/REPORT.md)

## 做了什麼
領導寫設計表與三份交接書，派三個 codex 工人（`gpt-6-astra`）：A 組 6 台、B 組 6 台、人物線。轉發四則頂層 order（太空歌劇風格、機魂個性只限 S 級、armorPen 坑、與機械系血統對齊）。領導親自跑自動對戰 smoke，修掉五類「資料合法但戰場上用不到」的問題，每台每個能力都在 AI 對戰中用過、無拋錯。

## 產出（137 件）
frames 12、bodyplans 5、abilities 31、effects 55（古代機能力 19、人物 24、perk 12）、persons 30（古代機駕駛候選 12、駕駛員 6、技師 5、科研員 3、機魂 4）、soultrees 4（守護、獵手、獨駕、野魂）。commit `3687a2d`、`392d614`、`0da1183`。藍本對齊機械系六血統殼：潮衣＝芬里爾、潮鰭＝提亞瑪特、斷臂＝佩倫、風鈴＝庫丘林、靜海＝阿特拉斯、多目＝海姆達爾（以 catalog 為準）。機魂個性只給 S 級的空茶杯、鏽鳶。

## 最得意的 5 件
1. 阿努比斯「喚屍・冥途步」：用有限的「卡」叫起戰場死者當肉盾。
2. 提亞瑪特「生十一怪・母海裂腹」：從不回復的原初鹹水生出潮狼。
3. 庫丘林：倒棘之槍每擲扣駕駛自己的血；「守淺灘」反應技。
4. 佩倫：唯一會積燼的古代機，「雷橡」重砲系的發熱血統。
5. 空茶杯（S 級機魂）：「再陪我說一杯茶的時間嘛……你睡著了？那這次換我帶你回家。」鏽鳶：「叫我搭檔，別叫我資產。」

## 驗證
check 0；typecheck 過；乾淨 worktree `npm test` 454/454（主工作樹 507/508 的 ops 黃金失敗來自別線未提交改動）；measure skirmish seed 1–3 pass。

## 平衡
對白手套 4 seed 勝場：刑天 2；芬里爾、阿努比斯 4；哪吒、庫丘林、提亞瑪特、毛伊、須佐之男 3；阿特拉斯 2；佩倫、海姆達爾、魁札爾 1；迦樓羅 0（其餘平手）。對巢母幾乎全平。都在刑天 ±2 勝之內。

## 引擎事實
1. armorPen 是 0–1 比例。
2. AI 只用 activated，不用 sustained、line、cone、友軍範圍增益、純減益。
3. 打怪獸時掛 person-scope 效果會讓引擎拋「缺少人物」中斷整場。
4. passive 是死資料，被動效果只能走池 bands。
5. 1 對 1 小地圖相鄰仍各自結束回合。

## 沒做到
傷勢 6 件未登進 `rules/injuries.json`；技師刻意不加 `craft`；`content/README.md` 件數留頂層。

## 需要決定（頂層 2026-10-24）
1. 獸緣／殼緣升格正式屬性 → 交規劃線（牽動 ops 招募與遺跡）。
2. 機魂等級正式欄位 → 採用，排入引擎缺口線。
3. frame 別名欄 → 採用，排入引擎缺口線。
引擎事實 3 → 已轉 lead-rules-fuzz；2 的純減益與 passive → 已轉 lead-ai-objective；5 → 交試玩改進線。

## 以後交接書該點名的工具
`scenarioToSetup(db, 動態情境, seed)` 吃記憶體情境（`structuredClone` 換一格單位）；`getPolicy("tactical").propose/score` 單步檢查評分；scratchpad 共用，臨時檔放 `scratchpad/<線名>/`。
