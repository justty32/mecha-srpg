# battle-interface／在場單位與守牆迎戰（SPEC-GAP 補）

[battle-interface](../battle-interface.md)

2026-10-26 lead-engine-next 補，由 battle-interface.md 拆出（原文不改）。

`UnitSpawn.presence?` 與 `UnitInit.presence?` 承接 `{aura:EffectRef,engageable?:boolean,captureLocked?:boolean}`；runtime 保存 `rt.presences`，`UnitStatus` 增加 presence。這是佔邊格的公開在場單位，`isActive=false`：不進初始或後續 order／currentActor，不能移動、wait、撤離、棄機、發能力、作單體／部位／AoE／捕捉目標，但 unitAt 仍阻格。UI 顯示「在場／不可交戰」marker，點格、循環、部位及目標選取排除它。偵察部署 engageable=false；普通護送／「守牆但牠不來」不部署此 S。

光環引用既有 effect/kx-tidal-dread，原 accuracy -10、dc40 士氣檢定、ownerTurns=1 與 refresh 均不改。戰鬥開始給敵我 active 單位，真正新回合在 ownerTurns 清理後再施；wait resumed 不重施。來源 presence 或迎戰後 active 時有效，死亡／捕獲／撤退後停止。presence 不算殲滅、守區或其他勝負人頭，battleResult 排除仍為 presence 的單位，fuzz 仍驗池、格、隊列與 result 排除不變量。

`Sortie.lordEncounter?:{lord:Id,beat:"gate"}` 標識第40蝕月唯一守牆戰。營運驗 pending id、gateSortie、當日、灣內且未結算；遠端灣內援防只改 sortie.loc，不傳送船、不開艦砲。接受守牆後 S 仍是 presence；明確玩家指令 `{kind:"engagePresence",actor,target}` 才能把 engageable=true 的目標改 active，保留原數值與怪獸控制，不扣 AP，只插一次當輪隊列末端、不搶目前回合，發 PresenceEngaged。拍二強送拒絕，AI auto／spectate 不替玩家迎戰。迎戰後玩家目標改為此 S 的 killTarget 或 capture 兩條 win，敵方仍以玩家全滅為勝。

唯一捕捉權威為 CampaignState.namedLords[lord].captured。setup 將 gate 可捕捉與鎖帶進 runtime；canCapture 仍守原 species/tidespine 的核完整與部位破壞條件，且本場須已迎戰、未鎖。首次 Captured 即鎖 runtime；applySortieResult 在去重後、入庫前驗證唯一 S 戰果，原子寫 captured／battleFinished，其他 sortie 或重送不能多獸或酬金。拘束位不足、釋放、出售或丟棄都不解鎖。setup／snapshot／command 存讀重播保持同 hash；campaign 重播仍只套戰果，不重跑戰鬥。無 presence 的舊戰場不新增空 metadata 或光環事件。

守牆結算只記 wallOutcome=held／won／withdrew／lost／timeout 與當時城市快照，gate 關閉且王跡 gone；不覆寫吉大港歸屬、不自動建立第四核心。四情報來源商品／誤報、前40月如何累積城市最終存亡、S 世界 AI、MCP 專用迎戰工具仍未實作；現有通用輸出可讀王跡與戰果，headless 呼叫者可明確送迎戰指令。
