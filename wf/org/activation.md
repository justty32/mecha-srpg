# 最小按需啟用記錄

[組織](README.md)｜[執行設定](../aos/README.md)

## 授權與範圍

使用者在本對話表示：「規劃好之後就可以開始用了」。因此啟用既有方案的最小靜態路徑，不再等待整體組織採用裁示。這不是接手既有程式碼 dirty 檔、改平衡、執行 Node、遷移資產或擴大對外授權的指示。

main 保留直接對話入口，跨 repo 資源與彙報交 eca_main。正式遊戲工人沿用 codex 偏好；本次只建立獨立 review 的 agent-fsm 定義，不改 main 的 astra、不建常駐部門。提交規則維持既有，每批 brief 限定；本輪不 commit／push。

## 實際設定

已新增自身 agent_def 與 subagent 工具。用 agent_def new 從 agent-fsm 複製 `wf/aos/defs/review`，設定 `model=sol`、`reasoning_effort=high`；aos-llm ls 已列出此 pack 對應 gpt-6.1 sol。

tools.json 僅含 look、mailbox、index 及 self_state，沒有 shell、修改檔案或擴權工具。首次 check 發現 self_state 註冊需包在 path 欄位，修正後 check 的 problems 為空；沒有繞過錯誤。能力限制只作防失誤，不宣稱安全沙箱。

## 唯讀交接與結果

以 subagent add 啟動 `org-review`，workspace 為本 repo；以 say 交辦、listen 收回，信件識別為 `000000000001.01795423495139119364.2321901.3147700`。基準 HEAD 引用規劃階段的 `fd9756b28681001b93fe2c7bfa7ee6bdbd99cdf2`，候選為尚未提交的 org 文件；要求唯讀、無可寫路徑、子代理上限 0、不執行命令、不 commit／push，只回三項結果。

reviewer 回 DONE：全機 Node 序列限制不可照搬 arena 的 repo 私有鎖；未發現阻擋最小靜態啟用的實質矛盾；建議先有界唯讀交接，再按需開 lead／作者／獨立 reviewer。它已親自讀指定規範；未操作 git、跑 lint 或 Node，因此其結論只涵蓋靜態方案，不代表遊戲驗證。

收回結果後已執行 subagent rm，subagent ls 回報 `0/4`。定義留在 repo 可再次使用，執行個體已移除；stack 依工具預設保留，不做 purge。

## 規則對齊

team-model、dispatch、inbox 已增加 aos 通道例外：subagent ask／say 用原對話回傳，mailbox REQUEST 回原 reply_to／letter；不雙投舊 inbox。CLAIMS 補充唯讀線無寫入權、wf 寫入仍需 main 明列委派。org 與 INDEX 已從待核准改為最小按需啟用，WAIT_USER 已移除整體組織採用問題。

## 未做與下一步

未改遊戲程式，未接手 CLAIMS 舊線，未跑 Node／npm、遊戲測試、commit 或 push。全機 Node 互斥仍由 eca_main 協調；確認前只執行靜態工作。eca_main 後續來信（01795424522142477292.2482911.3250400）確認已轉使用者，將另提共用鎖方案；收到裁示前不自行修改 heavy-lock.sh，共用鎖位置也尚未定案。下一個正式切片要先確認需求、現役檔案擁有者與驗收，再按需啟動，不讓空閒部門自行找工作。

## 文件驗證

agent_def check 最終 problems 空，模型交接實測通過。wf-lint --strict 最終 broken、oversize、biglist、querycmd、local 均為 0；保留既有三處 BIGLIST-LINKS 與五處 STALE 提醒。初次 lint 發現複製模板 README 的相對連結失效，以及追加文字使三份工作流超標；已改寫本地定義 README、把通道細節集中 org/letters，只留工作流入口連結。diff --check 曾指出派線入口檔尾多空行，已修正後重驗。
