# 方案與時間軸

本頁由 [`../team-model.md`](../team-model.md) 拆出。

這頁是 **project-owned**——隨每月帳單與錢包變動，**每次改動要標日期**，kernel 升級不會覆蓋它。

| 角色 | 現在（2026-10-23）| 變動後 |
|---|---|---|
| 頂層 | Fable 5.1（主 session）| Fable 額度吃緊 → Opus 5.5 暫代頂層，規劃仍盡量留給 Fable |
| 領導 | Opus 5.5（Agent tool 行程內）| Opus 不可用 → Sonnet 只做指揮與匯報（規劃已分給 Fable 才可降級）|
| 工人（大量、便宜）| codex `gpt-6-astra`／`gpt-6-sol` | GPT 方案到期 → 改 Sonnet 子 agent，工人層消耗速度整體上升兩級，headcount 下修 |
| 工人（重要部分）| codex `gpt-6-sol`，或 Opus 子 agent（要與 Claude 頻繁來回時）| 同上；重要部分改 Opus |

某一層的模型要消失時（方案到期、漲價、下架），先在這裡寫替代方案與連帶效果，並標日期。
