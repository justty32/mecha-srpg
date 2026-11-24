# review 定義

[使用方式](../../README.md)｜[角色](../../../org/verification/README.md)

由 agent_def 從 agent-fsm 模板複製，供 mecha-srpg 按需唯讀審查。model 為 sol、reasoning_effort 為 high；tools 僅有讀取與通信能力。system 指向角色及開場必讀規範，任務細節由每次 brief 提供。

修改定義後先 agent_def check，通過才啟動；完成即回收執行個體。本檔取代模板內只適用 aos 原始碼樹的說明連結；通用操作文件見 AOS_HOME 下 knowledge/aos/agents.md 與 body.md。
