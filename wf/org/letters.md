# 通信提案

[組織草案](README.md)

## 通道與過渡

aos 管理的 agent 使用 mailbox_send／mailbox_read。跨 daemon 指定對方 daemon；寄根窗口用 `to: eca_main`、`daemon: /home/guanyu/aos-home/.stack`。同 daemon 子 agent 並不繼承父 agent 的模型與工具。mailbox 是信箱，不是直接對話佇列；收到通知後仍須讀信，不能假設已看過正文。

原生 CLI 子 agent 與既有外部 codex exec 線沿用現行工具回傳／wf inbox，不雙投同一任務。每封 brief 指定唯一主通道；lead 跨通道轉交時保留原任務識別與證據，不把轉寄誤當第二份派工。team-model、dispatch、inbox 已追加 aos 通道例外；舊線規則不被取代。

## 開工信

REQUEST 至少寫任務識別、目標、先讀路徑、基準 commit 與既有 dirty 檔、明列可寫／不可寫路徑、獨佔期間、其他線、驗收項與負責者、模型與子代理上限、資源限制、提交權及 Done when。所有實質工作者親自讀適用 wf 規矩，不只看摘要。

不能只給 HEAD：dirty 檔若影響驗收，先由擁有者提供固定版本或差異證據。只有 main／lead 確認了寫入權才能開始；沒列出的路徑不可自行擴張。

工具或 runner 任務另列成功、失敗、逾時、取消、啟動中取消、清理失敗的預期結果；拒絕是決策，不能換名字或改用 shell 繞過。

## 回信

回原 aos 信用 `box: reply_to` 加 `in_reply_to: letter`；直接由對話交辦而無 letter id 時，用指定 to／daemon，不捏造 id。信件不是授權本身，對外或不可逆動作要能追溯使用者授權。

終局只用 DONE、BLOCKED、NEEDS-USER、FAILED。PROGRESS 是進度，不算收線。標題寫一句自足的結論；正文短列產物路徑、驗證與版本、沒做的事、待決選項，以及子 agent 是否已移除。寫完報告不等於測試通過或功能完成。

每個階段交界讀一次信；卡住超過十分鐘先回 BLOCKED。讀取一般 aos 信預設會移除，所以需要可追溯紀錄時用 keep 保存到工作區，不能自行寫別人的 stack。

## 唯讀與生命週期

唯讀 reviewer 沒有可寫領地，brief 明列「可寫：無」，不為符合 CLAIMS 形式而虛設寫入權；有寫入的線仍須先登記領地並通過既有 brief 驗證。最小 smoke test 的三項固定驗收與終局證據見 [啟用記錄](activation.md)。

臨時 helper 用 agent_def new 建自己的定義，設定模型、system 與最少工具，check 後才 subagent add。定義只放 wf/aos/defs，不混進角色卡。已建立的唯讀 review 定義與使用方式見 [aos](../aos/README.md)。

任務結束後先收成果與終局，再 subagent rm 移除自己建立的 helper；不直接改 stack、不手殺 daemon。check 不能驗證模型可用性，首次啟動還要小任務 smoke test。eca 的 CLI 工具不一定受 aos hook 約束，角色卡與工具裁減是防誤操作，不宣稱是安全沙箱。
