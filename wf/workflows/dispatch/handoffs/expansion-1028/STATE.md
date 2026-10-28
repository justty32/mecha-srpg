# expansion-1028 — 本輪狀態

由 gpt-6.1-sol 主持機甲／怪獸／人物三隊；gpt-6-astra 規劃後再由 sol 產出。基底 `c09b026919eeee03cde68c0f1eb0d289ad4cbe7c`。只處理本輪新前綴，不續辦歷史 inbox、不裁決朴仁哲 P01 失腿矛盾、不把舊 draft 或索引 active 當作 verified。

## 已核定與現役

機甲原八台計畫、驗收收斂六台：`expansion-1028-plan/mechs-ready.json`，八 frame、八 model、兩展示共十八檔；原八機兩輪probe仍有兩弱A，不再開第三輪，僅M01/M02/M03/M04/M05/M07複製到 `/tmp/expansion-1028/wt/mechs-selected`（十四檔），原批rejected不混入兩排除候選。人物八位：`expansion-1028-plan/people-ready.json`，八 person、八 lore、兩展示共十八檔；工人 `characters_team_sol` 在 `/tmp/expansion-1028/wt/characters` 產出。怪獸八個形態已產二十檔於 `/tmp/expansion-1028/wt/monsters`，不是八個新species；菌絲只寫採集。三隊產出與獨立後查均交稿。

領導持有 manifests、briefs、索引、帶回與 Git；工人禁止 commit 或直接寫主樹 content。原生工具監看，最多三平行工人；本輪沒有外部 CLI agent／GUI／鍵鼠／螢幕操作。

## 驗證與待做

Node v24.22.1。必要測試依賴已獲本輪使用者明確授權，按 lockfile 從 npm 官方 registry 安裝，跳過 lifecycle scripts，不改依賴版本。基線 check 為零錯誤、十個既有 warnings；lore 零錯誤／零警告；typecheck 通過。wf strict 有兩個既有 legacy 外部斷鏈，未修只讀舊檔。

工人僅各做末次 focused check／lore／typecheck／gate。領導接手單一串行 probe（五 seed、一 CPU）、MCP stdio 與全批整合 suite；全套只跑一次，壓低 concurrency、nice priority；後續probe以兩CPU為上限縮短串行時間，仍一次一個重負載。原始 npm test 含兩條 ui_screenshot 測試，本輪禁螢幕而明確排除該檔，不冒稱原始 npm test 全跑。黃金與戰役 hash 七份基線在 golden-baseline.json，須逐位元不變。

三批技術ACCEPT、交稿後語義去重與帶回索引已完成；唯一一次整合suite終局1031案：1021通過、10失敗，23分28.6秒。九條內容失敗於乾淨原c09也失敗，七條同錯／實值，wait與ops-relic兩條軌跡受本輪影響；socket EPERM不重試。九項focused原基底對照已完成，無待監看程序。不可稱整合全綠；使用者裁決是否接受限制或另授權整合，暫不改engine／黃金或移成預設不可見optional。詳細證據見 [test-comparison.json](test-comparison.json)。可重播Git交付準備中，但不把尚待裁決說成完成無回歸驗收。
