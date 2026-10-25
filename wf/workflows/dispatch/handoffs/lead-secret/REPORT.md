# lead-secret 收線報告（2026-10-26）

[handoffs](../README.md)｜engine-backlog 第 45 列

> 由頂層代存（harness 擋子 agent 寫報告檔）。

## 結論

隱藏真相已能標在 lore 資料上，百科不會洩漏（第 45 列完成）。hidden 在百科建索引前即剔除，搜尋、詳情卡、年表、反向引用與「其他原始資料」區皆不可見；`rumor` 照常顯示但標「傳聞」。剩兩處散文欄位的漏洞標記管不到（見「需要使用者決定」1、2）。

## 驗證

- `npm test`：乾淨 HEAD＋本線改動的暫存 worktree 942／942 全過。主工作樹 951 條、12 條紅，全是營運／戰役黃金 hash 測試，屬 lead-tide-cal／lead-resist 未提交改動，本線未碰 ops。
- `npm run check` 0 錯 8 警告；`npm run typecheck` 0；`node content/lore/check.ts` 0 錯 2 警告（既有「事件沒進年表」）。
- 反證：餵壞可見度值 check.ts 報 8 錯，還原 0 錯；拿掉 `index.ts` 過濾，測試立刻抓到塞勒涅 2086 外洩，還原轉綠。

## commit

- `36a0968`：標記格式、check.ts、lore README「可見度」一節、15 檔資料、百科過濾（`src/ui-adapter/vm/wiki/visibility.ts`，`index.ts` 掛上）。
- `c1077fa`：`cards.ts` 傳聞呈現＋測試（等 sonnet-name-en 交出 cards.ts 後才動）。
- `94d30c7`：收線（第 45 列完成、done 索引、STATE）。

## 補了哪些標記（15 檔，只加欄，原值未改）

格式三個可選欄：`visibility`（public／rumor／hidden；可放條目本身、`ancientMech`、關係列、`secrets` 每列、年表每筆；勢力草稿 `ancientMech` 同欄合一）、`fieldVisibility`（單一純值欄位）、`secrets`（不公開的真相或傳聞）。

- 傳聞：沐蝕會迦梨藍本（只有先知自己說）、薩米爾座機、育空古代機現況；整筆傳聞：赫卡忒之秘、M-3；6 列傳聞關係（例：阿鏽與七號互指的「同源」）；年表 7 筆。
- hidden：塞勒涅三層知情寫進 selene 檔（2086 地質報告、2095 七成確定、2097 確定人口降下來也關不了門），另附公開傳聞「清空月面就能結束蝕潮」；迦梨真的存在、聲音是先民記憶；三種聲音同源（沐蝕會、守寢人、稽古學會三檔各一）。
- 不洩漏證據：`visibility.test.ts` 用真實資料收集所有 hidden 句子，逐句確認不出現在任何詳情卡、年表、搜尋結果。

## 需要使用者決定

1. **散文已直接寫出的真相**標記管不到（例：selene 本文寫「複本」招攬在遮試驗失敗、租出去的魂核住的是真人；`ancientMech` 研發特色一句寫「秘密的第二台赫卡忒」）。兩條路：派潤飾線改外界口吻、真相搬進 `secrets`；或接受百科是全知視角。
2. 幾個檔本文直接寫英文「（rumor）」，建議潤飾改「（傳聞）」。
3. 前端打包帶整份 JSON，開發者工具仍看得到 hidden 原文；單機可接受，要真藏得改建置時過濾。

## 未處理

- code-map 百科段補 `visibility.ts`（頂層已補）。
- e2e 未跑（主工作樹有他線未提交改動）。
