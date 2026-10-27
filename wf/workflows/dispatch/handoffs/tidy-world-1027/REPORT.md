# 七輪交接文件整理報告

已親讀 AGENTS、WORKFLOWS、STRUCTURE、common/user、common/data-files、tidy/README、tidy/gotchas 與 dispatch/README；依 tidy-world-1027 brief 執行。無子 agent，未 commit/push；主線既有 SESSION 變更與 brief 保留於交付。

## 整理結果

29 份根層交接書以 git mv 分入第一輪／第二三輪／第四至七輪各自 briefs/，檔名不變。[moves.tsv](moves.tsv) 逐件對照；各新目錄與既有缺導航的報告子目錄已補 README。briefs 是已執行創作契約與歷史證據，三批尚待整合，不搬 done/archive。

SESSION 只留待驗收與四舊線 open；CLAIMS 區分無活躍工人、三批待驗收與四舊線暫停。STATE／next-session 核對至 c9ce4e8，說明內容提交 8ba72b4、公司已獲授權完成創作、回家再整合。user／dispatch 的 remote 舊述與 push 規則已對齊既有授權，本線仍不 commit/push。

[待驗收摘要](pending.md) 承接 82 概念／124 新 JSON／六條年表、36 警告、年表 MODE 一次例外、legacy broken2、P01／Fable 與四條未收舊線。沒有改判 draft、accepted、gate 或使用者裁決。

## 修鏈與工具例外

全庫 fix_moved_links dry-run 在既有 wf-table 非 dict row 遇 TypeError，未 apply、未修改 JSON；工具原檔不改。改用同一工具模組，將 scan.files 限定 live wf Markdown（排除 done/archive/superseded 與本次證據），先 dry-run 再 apply；見 [MD dry-run](links-md-dry-run.txt) 與 [apply](links-md-apply.txt)。共七個既有 Markdown 入鏈由工具修補。

搬入 brief 的絕對總 brief 導航另依 moves 更新；搬入檔內 Markdown 相對鏈已由工具按舊位置解析、新位置重算。未改 JSON 歷史閱讀路徑、hash、退修內容、reportDir 或 manifest；舊 report 的純文字已讀路徑保留為當時證據，現址由 moves 查對。原報告僅修必要導航，結論保持原樣。

環境無 python，採 python3；tabledb 已定向讀取 round7-dedup 第 0 列核對有限查重證據，未 dump 全表。不安裝、不跑 npm 或整合測試、不改工具與 legacy，不清除 worktree。

## 驗證

檢查輸出見本目錄 verification.txt、brief-lint.txt、wf-lint.txt。strict 基線由主線確認為 legacy broken2，其餘0；broken2 不算通過，不能宣稱整合驗收完成。

最終 wf strict 回傳 1：TOTAL broken=2 residue=0 oversize=0 biglist=0 querycmd=0 local=0，與既有基線相同。brief strict 回傳 0／1 檔；無子 agent。worktree porcelain 證據僅去除尾端多餘空行以通過 diff check，條目與順序維持。29 份搬檔中 26 份逐位元不變，3 份只更新絕對總 brief 導航。

交付共 100 個文件（29 搬檔計一件），新增檔總量約 67 KB，低於 300 件／1 MB gate。內容／原始碼／legacy 與歷史 JSON、TXT hash 保全通過；git diff --check 與 cached 檢查最後結果均 0。所有結果僅文件整理檢查，主線仍需獨立核驗及回家整合。

主線獨立核驗：29 個搬移目的檔與 briefs/README 均存在，原位置已移走；Git 辨識全部為 rename（26 份100%、3份僅導航修正）。content／src／legacy 相對 c9ce4e8 無變更，SESSION 大小合規，兩種 diff check 為0；重跑 wf strict 仍只有既有 broken2、其餘0。整理 agent 已結束；整合驗收維持待回家。
