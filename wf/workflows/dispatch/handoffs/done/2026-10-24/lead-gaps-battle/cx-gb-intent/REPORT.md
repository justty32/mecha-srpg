# cx-gb-intent 完成回報

STATUS：**DONE**。固定五條驗收完成；120 場平手率從 **41.67% 降至 2.50%**，玩家方勝率 **45.83%**（只算 player 亦有 39.17%）。未 commit、未重產黃金、未開子代理。

## 做了什麼

親讀交接書指定 AGENTS、wf 規矩、資料表、裁示與前線報告；依五個工作步驟收 orders。只動本線範圍，其他線工作保留。

規則：BattleOutcome 新增可選 detail。eliminate 的敗方含撤離者才附 `detail:"repelled"`，全死保持舊 payload；既有目標之後、timeout 之前補通用擊退。無明列出口時四邊可撤，有明列出口仍只准指定格，noRetreat 照舊。

AI：每輪由 strategy 推導陣營意圖，以可見戰力比、己方 HP／單位損失、守區進度、觀察到的傷害與停滯、剩餘輪數和撤離路程評估。撤離模式跨輪保留，僅對 AI 建立計畫；人類玩家不經此流程。可動單位切 flee，往出口移動並下 retreat；巢穴／潮錨標記、失去 locomotion 或 AP 上限零者不撤。參數 DEFAULTS 可由 profile 覆寫，物種既有 aiProfile 供個體逃跑門檻。

意圖推導表（依來源優先序；共同撤離門檻＝戰力比低、損失高或時間不足）：

| 來源 | 意圖 | 判斷補充 |
|---|---|---|
| slot 的非 lose objective | 該目標種類 | hold 讀進度；escort／reachExit 估路程；survive 讀輪數 |
| params.intent | 數值代碼 | 0 殲滅、1 獵食、2 守巢、3 守點、4 護送、5 撤出、6 斬首、7 捕獲、8 生存 |
| 怪獸 behaviors／tags | spawner 守巢；territorial 奪點；其餘獵食 | 守巢不因停滯撤離，仍可因戰損撤護衛 |
| 勢力預設 | 殲滅 | 以傷害進展估時間 |

**意圖兩層設計摘要。** 個體層已完成：怪獸總層 HP 過低逃跑，駕駛重傷或 breaking／fleeing 自退，接既有 retreat 門檻入口；berserk 保留原策略，不新增發狂規則。指揮者層已完成：人類由有指令權人物按 resolve、等級、id 排序選領隊；重傷、缺乏能力消耗資源、shaken 或已知負面狀態者後撤，靠近友軍後方、遠離敵人，不離場，恢復或輪替期限到便再前壓。怪獸選母體／潮錨標記／S 級以上個體；母體命令護巢集結，其他沿既有 focus target 圍攻。指揮者或其人物死亡後不再下整隊意圖，依可調比例潰散，其餘回 tactical 本能。潰散以 id 穩定分位，不消耗規則 RNG。未做指定指揮者 tag 的 profile 語法（採交接允許的規則選人方案）；未新增治療／補給能力，只利用現有恢復或輪替期限。

固定五條驗收證據：

1. repel 3 條＋intent 7 條全過；固定合跑 rules／ai／sim／golden **173 tests、173 pass、0 fail**。反證：開工規則使前兩條紅；Node registerHooks 停用意圖邏輯並錯加全殲 detail，7 條 AI＋第 3 條規則轉紅，聯集涵蓋全部 10 條，兩次 exit 1。
2. 開工／完成皆 **24 情境×5 seed**，沒有 error／stop。開工 player 65、enemy 5、draw 50；完成 player 47、ally 8、enemy 55、third 7、draw 3。平手 50/120→3/120；player＋ally 65/120→55/120（54.17%→45.83%）；單算 player 為 39.17%，兩種口徑均落在 35%–80%。每情境勝方分布表與逐 seed 原始結果在 [sweep-results.json](sweep-results.json)（24 列）。
3. 六個黃金 combat-conduct／combat-layers／combat-tenth／people-berserk／people-capture／people-eject 全部維持原 hash，未設定 GOLDEN_UPDATE。
4. skirmish seed 1–5 Wait 比例全部 **0**；bench **31.96→12.09 ms／步**，上限為 47.94。行為變更使指令 60→57、hash 7dcff3308145c454→42803a3e8b3c498d。最終 typecheck exit 0，check exit 0（既有內容 warnings 38）。
5. 本 REPORT、改動檔清單、意圖推導表、兩層摘要、情境表與 SPEC-GAP 均已寫檔。

anchored 同一 frozen.json 前後 15 場：勝場 **0→2**、巢母命中 **37→3**、平均輪數 **6→2**。收場因撤離而提前，不代表輸出火力提高，營運沒有回寫。

## 產出（改動檔清單）

完整絕對路徑列於 [changed-files.json](changed-files.json)。共 **19 檔**，原始碼／測試 patch 34,195 bytes，連報告資料約 **86 KB**；以開工快照計差異，未拿其他線既有 dirty 檔算本線改動，低於 55 檔／200 KB gate。

情境改動表：

| 範圍 | 本線改動 |
|---|---|
| scenarios 全部 | 無；現有目標配合通用擊退已達量測門檻 |
| skirmish-whitegloves、rift-edge-nest | 目標語意未改 |
| aiprofiles、maps | 無；用 DEFAULTS 與既有 params／behaviors |

開工、完成 sweep 為 `/tmp/cx-gb-intent/sweep-before.jsonl`、`sweep-after.jsonl`；中間一輪 `sweep-v1.jsonl` 亦為 3 平手。其他原始證據同目錄：`suites-final.log`、`repel-red.log`、`mutation-red.log`、`intent-tests.log`、`typecheck-ai.log`、`check-ai.log`、`wait-after.log`、`bench-{before,after}.log`、`anchored-{before,after}.log`。`own.patch` 為本線原始碼／測試相對開工快照差異，沒有還原共用工作樹。

## 沒做到或證據不足的

仍有 nest-core-assault seed 1／3／5 到 30 輪 timeout；總平手率已達標，依固定驗收不再擴修。這張圖有固定巢母、出口只在西邊；保留不可動單位不撤的限制。未另做逐指令追蹤，不宣稱已定位三局卡住的精確單位／路徑。

可達性是啟發式：進攻估值用可見敵方總 HP 差，不是每種斬首／捕獲目標的精確完工時間；守區與撤出另算進度。flee 以本回合可達格縮短出口距離，沒有全地圖繞障路線規劃。負面狀態支援既有控制 tags／負屬性 contrib，未泛化所有 EffectDef 語意。這些不影響本次五條驗收通過，但不是所有地圖都保證無平手。

前後量測使用共享工作樹、當下內容與主機負載；不是隔離 worktree 的因果實驗。初次 typecheck 曾因誤用 morale 名稱報錯，已改為現有 shaken，後續與最終檢查均為零錯。

依 AGENTS 跑文件 lint：broken=0，本線 REPORT／資料表無違規；全樹仍有共用 ROSTER.md 28,357 bytes 超限、CLAIMS.md 1,940 bytes 表格超限（`wf-lint.log`）。未越界改這兩份文件，交領導處理。

## 需要決定的事

**SPEC-GAP 提案。** 無出口地圖以四邊為撤離格，僅套撤離指令，不改 escort／reachExit 的指定出口語意；有明列出口完全沿用。多方通用擊退只讓仍有 active 的 slot 勝，敵對 active 必須全無且至少一敵曾撤離；同時符合的盟軍依既有多人 lose 規則選字典序第一 slot。故結果可能是 ally，玩家方統計包含與 player 結盟的 ally。既有目標優先、通用擊退其次、timeout 最後。

params 僅能放數字，intent 以 0..8 對應表達；指揮者潰散採穩定 id 分位，人類按 resolve／level 選人，預設輪替 2 輪、冷卻 3 輪。以上請規劃線補 spec；若需要字串意圖或指揮者 tag，另案擴 schema。本線不改 spec／schema，也不改營運 BattleResult 消費端。

領導同步 code map 新增 intent.ts／regroup.ts 與兩個測試，並負責 commit；此類共用文件不在本線可寫範圍。

以後交接書該點名的工具：Node registerHooks（不改工作樹的 mutation 反證）；psweep 以 TMPDIR 指向本線臨時目錄，避免臨時檔散落。
