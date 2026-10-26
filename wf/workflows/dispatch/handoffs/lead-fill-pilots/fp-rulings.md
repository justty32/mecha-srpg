# fp 領導審計畫的修正（產出段必照；與 plan 衝突以本檔為準）

[共同規格](fp-common.md)

1. 計畫的人物表、年齡分布、池設計都核過（148 人、40 池、16–19 歲 3.4%、不老老手 16 人），照做，不加碼不減。
2. **用詞**：「殼」不當古代機或機甲外層的意思（外層叫裝甲；古代機本體直接叫古代機）；怪獸的甲殼可寫「甲殼」。潮→蝕（蝕潮、漲潮）。人物話裡避免直譯腔。
3. **資源禁令**：全套 `npm test` 一律不跑（領導收件後跑一次）；只准 `node --test <相關單檔>`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`。同時最多 3 條產出工人。worktree 的 package.json 與 scripts 以 HEAD 為準（worktree 由領導從 HEAD 開）。
4. **不要檔間互相引用別批新檔**；lore 人物 `relations` 只引用 HEAD 已有的 id 或同批新檔。
5. 每人 lore body 250–450 字，須含「崩前」「崩後」「招牌瞬間」，招牌話用引號；崩前（2090 前出生）者要寫得出崩前記憶，崩後出生者沒有。
6. 完成後最後訊息 5 行摘要；REPORT 列已讀清單、check 數字、`review-rows.json` 列數。
