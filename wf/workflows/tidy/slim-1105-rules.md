# slim-1105 防止再長的規則草稿（未套用）

[slim-1105-plan](slim-1105-plan.md)

原則只有一條：**git 歷史就是封存**。現行樹只留還在用的東西，證據交給 commit 訊息和 git log。以下是逐檔的修改草稿，「→」後面是新文字。

## 1. STRUCTURE.md「archive 規則」整段換掉

→ **過時就刪（git 歷史即封存）**

- 過時或被取代的文檔直接 `git rm`，不再搬進 `archive/`、`done/`、`superseded/`。commit 訊息第一行寫 `docs(tidy): 刪 <路徑>，由 <取代者> 取代`；沒有取代者就寫原因。
- 活文件裡指向被刪檔的連結要拿掉，改成純文字或刪掉那句；要追溯就寫 commit hash。
- 已經存在的 `archive/` 一次清空，以後不再建立。

同檔「觸發 A」最後一句「已完成的 spec/plan 一律移 `archive/` 凍結」→「已完成的 spec/plan 併入 `specs/core` 等現役契約後刪除」。

分層原則第 4 條追加：→「`SESSION-LOG.md`、`WAIT_USER.md` 各 ≤ 4096 bytes；超過代表有已完成的項目沒刪，先刪再說，不要拆檔。」

## 2. planning.md「Done when」

「動工完成後移 `archive/`」→「動工完成、規格併入 `specs/core` 後刪除 spec 與 plan 檔」。

## 3. dispatch/README.md 收線 checklist ④⑤

④ → 「收線證據（驗收逐條的結果、commit 清單、終局訊息摘要）寫進收線 commit 訊息。剩餘工作每件追加一列到 engine-backlog。然後 `git rm -r handoffs/<線名>.md handoffs/<線名>/`。」

⑤ → 「把該線那一列從 CLAIMS 刪掉；CLAIMS 不保留歷史表。」

「內容」表的 handoffs 列 → 「現役 `handoffs/<線名>.md`，收線即刪」。

## 4. handoffs/README.md

- 刪掉 `done/`、`superseded/`、`done/README.md` 這三列。
- 加入 → 「附件夾只放交接書、REPORT 和必要的小型結果（每線合計 ≤ 1 MB）。原始 log、tap、jsonl、gz、截圖、MCP 錄音放 `handoffs/<線名>/raw/`，這個目錄不進版控。」
- 加入 → 「報告保留期：線收掉，報告就跟著刪。審查、驗證、試玩這類單次報告，在下一份同類報告產生時或 14 天後刪除，先刪到的為準；結論要先併入 backlog、decisions 或 spec。」

## 5. `.gitignore` 追加（歸調度者）

```
wf/workflows/dispatch/handoffs/*/raw/
wf/workflows/dispatch/handoffs/**/*.tap
wf/workflows/dispatch/handoffs/**/*.jsonl
wf/workflows/dispatch/handoffs/**/*.gz
wf/inbox/done/*
!wf/inbox/done/.gitkeep
art/*/evidence/
art/*/viewer/evidence/
```

inbox 的 done 只留在本機：信件已辦的證據是 commit。`inbox_ack.sh` 照常寫入，不用改程式。

## 6. 長度上限（寫進 tidy README 的 Done when）

- `decisions.md` 加上 `decisions/` 合計 ≤ 16 KB。已經被推翻或已落實進 spec 的決定，就刪掉。
- `common/gotchas.md`、`tidy/gotchas.md`、`dispatch/lessons*.md` 每檔 ≤ 4096 bytes。滿了就淘汰最舊、已經被工具或規則吸收的條目，不拆新檔。
- `engine-backlog.json` 只放未完成列，完成就刪列。`codex-batches.json` 同樣處理。
- `notes/` 不寫收工流水（close-\*）。收工狀態只寫進 SESSION-LOG 一行和 commit。

## 7. wf-lint-local.sh 加兩個 warning（之後再實作）

- `STALE`：handoffs 頂層有檔案或目錄超過 14 天沒有 commit。
- `HEAVY`：`wf/` 底下有單檔超過 512 KB，或某條線的附件夾超過 1 MB。

只印 warning，不計入 strict，避免卡住其他工作。

## 8. WORKFLOWS 與 tidy README 同步

- tidy 的「四條原則」第 1 條「過時的就封存」→「過時的就刪（git 歷史即封存）」。
- tidy 的 Done when「`archive/README.md` 有它那一列」→「刪檔 commit 訊息寫明取代者」。
- WORKFLOWS 的 tidy 觸發詞「封存過時的」→「清掉過時的」。
