# lead-fill-gear 暫停報告（2026-10-26 晚）

## 做到哪
- 計畫段 4 條（astra）：plan-gw／ga／gm／gl；產出段 sol 約 19 條，已入庫：武器 48（gw 4 批）、裝甲系統 56（ga 4 批）、特色件 gm-01..04 共 56、戰利品拆件 20＋研究 20（gl）。合計新檔約 200（部件約 105、能力約 35、效果約 9、研究 20+）。
- 市場：新加坡、舊陣列、鹽灘、戰爭軍械庫插 13 列公開件（吉大港、達卡照舊規不動）。勢力件未上架（缺聲望門檻引擎）。
- engine-backlog 74–77 已追加。review.json（200 列）在本目錄。
- commit：6f20f4f1、352e589b（含大量原始戰鬥紀錄，史上膨脹 3M 行，無法安全改寫）。
- 盤點前：components 62（武器 31、背 8、甲 8、系 7、感 5）、abilities 190、effects 159、市場 6、研究 17。

## 未完成
1. 戰役黃金 5–7 紅：npm test 顯示 5 紅（campaign_act sortie、recruit 弦月、idle 12 蝕月、黃金戰役 hash、ops-war-assault／ops-relic）。成因未確認：f3592fef（lead-fill-pilots 的 40 招募池）與本線市場上架都可能；lead-fill-pilots 也有 cx-fp-golden 在跑，需只留一份。本線 cx-fg-golden 在 worktree /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-gear/wt-fg-golden 進行，報告在 wf/workflows/dispatch/handoffs/lead-fill-gear/fg-golden/（REPORT.md、golden.patch）；結果未收，勿直接套用，先看是否與 pilots 的 patch 重疊。
2. ga／gl 部分件的 poolMods／attrMods 常駐修正引擎未套用（約 16 件被動為死資料）；gl 有 3 件 size 2 甲件無相容槽位（見 fg-gl-01、fg-gl-04 REPORT）；gw-03 巡天長弩煙霧載體缺 pilot 座。引擎議題在 engine-backlog 74–77。
3. 未跑全套驗收數字（最後一次 npm test 1023/1028；check 0 錯 10 警告；typecheck 過）；wf-lint 未跑。
4. 未做：去重線、Fable＋使用者審、命名審查、數值統一調、worktree 清理（`git worktree list` 中 wt-fg-*）。

## 下次怎麼接
收 fg-golden 的 patch（對照 lead-fill-pilots/golden），重錄一次後提交；跑 npm test、check、typecheck、wf-lint；移 CLAIMS 與 SESSION-LOG；移除 wt-fg-* worktree；done 索引追加。

## 需要使用者決定
勢力特色件要不要先放行無聲望門檻上架；活用 poolMods 的引擎修復優先序；gw/ga/gm 是否開去重與命名審。
