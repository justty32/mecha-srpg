# talk-decide 收線報告（2026-10-25，Fable 對談線）

[handoffs](../README.md)｜交接書 [HANDOVER](HANDOVER.md)｜前一場 [talk-world](../talk-world/HANDOVER.md)

## 結論

交接書八題全部拍板，沒有留到下一場的題。使用者的大頭是 **B4 無人化與精粹改人**，三條新裁示改動最大：精粹核不耗損、只有人在座艙裡才驅得動核；**機魂能驅核、能獨駕、成長很慢**（推翻上一場「機魂不能獨駕」，機魂與 AI 的分界只剩「不可複製」）；傳統 AI 開有核機甲、在大潮時刻或古代機半徑內有極小機率變成機魂。B6 的世界觀題中，**大潮全球同一時刻**為裁示，其餘按本線提案暫值（使用者「隨意」「都 OK」）。B10、B3、B7、B5、B8、B9 全部「都按照建議」。

本線只聊不改檔；所有落地由頂層派線。各題原話、結論、【可落地】、仍未決見下表。

<!-- wf-nav -->
| 檔 | 題 |
|---|---|
| [decisions/unmanned-souls.md](decisions/unmanned-souls.md) | B4-A 無人化、機魂獨駕、AI 變機魂；B10 白手套原型；B3 表示法 |
| [decisions/essence-pilots.md](decisions/essence-pilots.md) | B4-B 精粹改人：不老、能力、三系代價、點名五人 |
| [decisions/world.md](decisions/world.md) | B6：大潮同一時刻與五推論、7.8 門檻與塞勒涅、S 級天花板、第 40 蝕月、其餘暫值 |
| [decisions/misc.md](decisions/misc.md) | B7 孤兒年表、B5 翻譯腔批次、B8 黃金與勢力欄位、B9 STRUCTURE 規則 |

## 落地時的注意

- 「機魂不能獨駕」散在 `design-notes/world/essence.md` 第 13 段、`specs/world/machine-souls.md` 檔頭與協作段、`mechs/bonds.md`、`mech-lifecycles.md`、world-pillars M5 附近、style 詞表；改寫時「不可複製」照舊，只把「不能獨駕」改成「能獨駕、成長慢」。原話照錄進 essence.md 或 pilots.md。
- 數值全是暫值（老化倍率、機魂成長倍率、AI 變魂機率、無人機武器傷害），使用者說數值之後微調；落地寫「暫值、可改」。
- 引擎工作合併：backlog 第 30、35、46 列（無人單位）＋新「座艙狀態」判定；第 47、48 列（人帶能力、接觸計數）改為已定案可評估。
- 「No Russian」字樣不要出現在任何落地文字（使用者：「兩個沒有可比性」）；talk-world open.md 7.5(e) 要改寫。

## 驗收

無 commit、無檔案改動（只寫本資料夾）。`wf-lint --strict` 見收線時頂層跑。
