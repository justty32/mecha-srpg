# 任務：lead-fill-gear 計畫段，軌 gl——戰利品：怪獸掉落（先查 content/base/monsters 與 rules 怎麼寫掉落／拆解／活捕材料；ops spec 的 LootBundle、stock:core-<級>、scrap）、遺跡遺物、材料與素材（stock:）、屍體拆解。盤點 56 隻怪獸的掉落分布，找出缺口；設計新材料、新掉落、新的『拆下的部件』（可裝上機的 loot 件），讓每族每級掉不同的東西；若掉落機制被引擎限制，如實記進需求

先讀並完整執行 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md`（共通規矩、軌道前綴、計畫段產出格式、先讀清單全在裡面；親自讀）。本線是軌 `gl`，plan 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/`，前綴照表。

## 本軌重點

戰利品：怪獸掉落（先查 content/base/monsters 與 rules 怎麼寫掉落／拆解／活捕材料；ops spec 的 LootBundle、stock:core-<級>、scrap）、遺跡遺物、材料與素材（stock:）、屍體拆解。盤點 56 隻怪獸的掉落分布，找出缺口；設計新材料、新掉落、新的『拆下的部件』（可裝上機的 loot 件），讓每族每級掉不同的東西；若掉落機制被引擎限制，如實記進需求

## 範圍（排除法）

只寫 plan-gl 目錄；其餘全唯讀。件數 gate：新件 40–60，超過刪、不足補；每批 ≤ 15 檔。容量 gate：plan.md 超過 40 KB 精簡，超過 60 KB 停下回報。其他三軌（gw／ga／gm／gl 中非本軌者）的範圍不碰，跨軌需求寫進「需求與待決」。

## 驗收（固定 4 條，做完就停）

1. plan.md 含已讀清單、盤點、理念、新件表、分批、掛接建議、需求。
2. review-draft.json 每件一列且白話 ≤ 60 字。
3. 每批交接書稿 brief_lint --strict 為 0，manifest 稿齊。
4. 回覆 5 行摘要＋plan.md 路徑。
