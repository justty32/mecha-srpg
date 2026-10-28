# 最後小批：兩名展示駕駛

[review](review.json)｜[展示與驗收](SHOWCASE.md)｜[REPORT](REPORT.md)

固定2person＋2lore character＋1scenario，共5新JSON，單檔≤16KB、合計≤80KB。本線只設計，不派工、不測試。兩人皆成年現役人類，未認主；只用現有特質、屬性與機型，無新能力／perk，未加入戰役招募。

瑟琳・索韋追求主射席位，為了命中紀錄主動選錯目標；準但慢且脆。馬特烏斯・維埃拉想買貨車股，離隊貪獵再假報求援，只能自付拖機；快而滑但射得不準。兩篇獨立過往、無互相認識的新增要求。

精確寫集：

- `content/base/persons/night-p-serin-sowe.json`
- `content/lore/characters/night-p-serin-sowe.json`
- `content/base/persons/night-p-mateus-vieira.json`
- `content/lore/characters/night-p-mateus-vieira.json`
- `content/base/scenarios/night-p-two-ledgers.json`

person完整可寫配方在review；lore的name與person完全相同、gameRefs各只對應自己的person。characters relations/events均空；只引用既有勢力，不改任何反向關係或timeline。正文故事只普通過往勤務，不補既有重大戰役的勝敗。

兩概念與五檔已全核可。經原碼核對，makePerson自然路徑未自動掛載traits，展示依實際base值比較：瑟琳準56／反應5／迴避6／決心44，馬特烏斯準48／反應7／迴避9／決心56。特質標稱加減只作資料說明，不預填效果、不修引擎；主線明確接受此限制。
