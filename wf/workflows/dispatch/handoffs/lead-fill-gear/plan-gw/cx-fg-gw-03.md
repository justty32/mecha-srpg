# 任務：cx-fg-gw-03 產出稿——拘束與單體壓制，新增固定12檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，親自讀，不靠摘要。其餘逐檔先讀清單在配套 manifest 的 report.mustRead（含本檔），全部是 repo 相對路徑，根為 `/home/lorkhan/repo/game_dev/mecha-srpg`；JSON 大表使用 tabledb 查詢。REPORT 開頭逐行列出原路徑。另親讀 worktree 的 AGENTS.md 與各選中列的既有範本、引用到的既有效果。先讀導航見 [計畫已讀清單](read-list.json)；manifest 亦列所有工作流入口，不能只讀本交接書。

## 背景與唯一目標

使用者要更多有差別的武器；本批是「拘束與單體壓制」。依 [新件表](new-items.json) 的批次 `fg-gw-03`，新增6個 component、6個 ability；不加新效果檔。這是經領導審定後才執行的產出稿，規格已定，數值照同級暫填，不為勝率重設計。

## 逐檔規格

完整12檔清單見 [fg-gw-03.manifest.json](fg-gw-03.manifest.json) 的 files；逐鍵數值、中文名、nameEn、掛點、必留代價、聲望門檻與新名詞標記，見新件表以「批次」篩選的12列。每列「欄位規格」可直接寫成一個 JSON 定義；只允許繁中文筆微調，保留 name／nameEn 與提案標記。不寫臨時佔位、不改 id、引用或數值。

### 扣足矢／扣足

逐檔主鍵：`component/fw-ankle-pin` 與 `ability/fw-ankle-pin-use`。新件表中這兩列的「檔」即完整檔案路徑，「欄位規格」是逐鍵定稿；不能把計畫的廠商、等級、聲望欄塞進 ComponentDef。

零傷收捕，不把已經打殘的目標補死。只有四矢，三格射程；需滿足物種捕捉部位條件。掛點：共用拘束修造棚；崩年後活捕要壓住而非馴養。中文與英文依表保留，etymology只潤飾語句、不改因果、成本或效果承諾。

### 停步索／拋索留步

逐檔主鍵：`component/fw-stayline` 與 `ability/fw-stayline-use`。新件表中這兩列的「檔」即完整檔案路徑，「欄位規格」是逐鍵定稿；不能把計畫的廠商、等級、聲望欄塞進 ComponentDef。

不耗矢的短距拘束，空矢後仍能留獸。必須逼近，命中仍會造成4點傷害。掛點：護勘隊短距拘束器；學會授權修造棚製索。中文與英文依表保留，etymology只潤飾語句、不改因果、成本或效果承諾。

### 千鈞拘束槍／沉矢鎮步

逐檔主鍵：`component/fw-weight-harpoon` 與 `ability/fw-weight-harpoon-use`。新件表中這兩列的「檔」即完整檔案路徑，「欄位規格」是逐鍵定稿；不能把計畫的廠商、等級、聲望欄塞進 ComponentDef。

六格外零傷收捕，避開瀕死獸的反擊距離。貼身不能開，四矢用盡就得換備用武器。掛點：合印拘束工位；家族護港隊承接拘束材料生意。中文與英文依表保留，etymology只潤飾語句、不改因果、成本或效果承諾。

### 凡壓陣砲／凡矢壓陣

逐檔主鍵：`component/fw-press-gun` 與 `ability/fw-press-gun-use`。新件表中這兩列的「檔」即完整檔案路徑，「欄位規格」是逐鍵定稿；不能把計畫的廠商、等級、聲望欄塞進 ComponentDef。

對單一射手壓制準頭，替近戰同伴開接近的空檔。兩格盲區與冷卻，不能把壓制寫成解除武裝。掛點：護糧與貨車保全的凡鐵火力；不新增國家專屬型錄。中文與英文依表保留，etymology只潤飾語句、不改因果、成本或效果承諾。

### 抱礁拘束鉗／合鉗抱礁

逐檔主鍵：`component/fw-reef-jaw` 與 `ability/fw-reef-jaw-use`。新件表中這兩列的「檔」即完整檔案路徑，「欄位規格」是逐鍵定稿；不能把計畫的廠商、等級、聲望欄塞進 ComponentDef。

近身破甲兼拘束，耗光矢時仍有帶精粹的鉗口。可能誤殺瀕死目標，不是零傷捕捉槍。掛點：留燈-合印護撤工位；護港隊將近身鉗做成壓獸器。中文與英文依表保留，etymology只潤飾語句、不改因果、成本或效果承諾。

### 留岸拘束柱／立柱留岸

逐檔主鍵：`component/fw-shore-stay` 與 `ability/fw-shore-stay-use`。新件表中這兩列的「檔」即完整檔案路徑，「欄位規格」是逐鍵定稿；不能把計畫的廠商、等級、聲望欄塞進 ComponentDef。

不用實體矢的零傷近距拘束，供晚期昂貴配裝。三次上限、流光40；不保證捕捉S獸或不可捕物種。掛點：護勘隊重拘束器；外購S級精粹而非把低級料聚煉成S。中文與英文依表保留，etymology只潤飾語句、不改因果、成本或效果承諾。

共同規格：只使用既有 weaponMount 與 kinetic／energy／pierce／thermal；所有新件 origin mechanical，不是假冒的古代殘肢或生物移植。能力 activated，AP/person、其餘池/mech；燼成本為正值加燼。凡鐵在能力與本體皆標 conventional-arms，不設 essence；其他能力明填 essence D–S。效果引用原檔，不複製或改數字。partAim只提高指定部位的選擇可能，不保證命中。line／cone／ball都用已實作形態，不宣稱擊退、拉位、燒地形、面向或固定障礙。

控制與捕捉：有 capture tag 且命中並滿足 species.capture 部位條件才轉捕獲；精粹品級不額外限制捕捉資格。fx免傷並不保證收捕。只傷shield/component的照海紋砲不當主殺傷槍。對獸減益沿mech scope既有效果，避開person scope死資料。

## 範圍（排除法）

只可新增 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-gear/wt-fg-gw-03/` 裡 manifest.files 的12檔，及報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gw-03/`。報告產物固定 REPORT.md、review.json、smoke.json、smoke-log/原始紀錄。暫存腳本在 `/tmp/cx-fg-gw-03/`。

不做：不改任何既有 id；不寫新件表以外的 content；不寫 src、schemas、specs、design-notes、content/lore、content/base/world、市場、frame、model、loot、registries、test、content/index、content/batches、其他 wf 路徑。市場與配裝只在 REPORT 引用既有 hooks／needs 建議，不代 gm、ga、gl 寫檔。

件數 gate：內容固定12檔，少了補齊、多了撤回本線多做的草稿（不刪既有檔），不得跨批借件；上限仍小於15。容量 gate：單一內容檔超過8KB先精簡，超過12KB停止回報；REPORT超過20KB精簡、超過30KB停止回報，原始log另存。不把工具檢查列數擴大成任務範圍。

## 必用工具

| 工具 | 用途 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 以批次查new-items、讀數值帶、寫review與smoke表 |
| `rg` | 查新id與名稱衝突、既有引用與禁用詞 |
| `npm run check`、`npm run typecheck`、`npm test` | 固定驗收第一條；在worktree執行並存原始輸出 |
| `node`（本地TS runner） | import現有loadContentDirs、scenarioToSetup、runBattle，執行固定煙霧；不用MCP |
| `git diff --name-status`、`git status --short --untracked-files=all` | 核對僅新增指定檔，黃金不改 |

## 煙霧做法（對應下方第三條）

在 `/tmp/cx-fg-gw-03/` 寫 TS runner，從 worktree `src/content/loader.ts` 匯入 loadContentDirs、`src/sim/run.ts` 匯入 scenarioToSetup／runBattle。只載入該worktree content/base；scratch情境用記憶體DynamicScenario傳入scenarioToSetup，不寫repo scenario檔、不改既有frame。

每把新武器各一個配置，用 grade-coverage 的同級機械frame、右臂right-weapon掛本武器，pilot/person chen-xiaohai；components是整組取代，只配此武器，其他能力沿frame原有。雙方戰術用既有tactical。凡鐵對同級基準機；其他對D mite-d／C reaper-c／B bulwark-b／A mirror-a／S暫用mirror-a（只驗可用性，不當S平衡證據）。使用既有map/rift-edge-60的可走格，距離取能力射程內；範圍件部署兩個相鄰敵人於其有效形狀內。拘束件允許未達捕捉條件時先施加減益，禁止改物種條件去假造捕獲。

每配置seed 1–5、上限20輪、maxSteps 2000，共30場。記錄例外、結局、輪數、每個新能力的AbilityUsed次數。0次不可寫成已覆蓋；查成本／槽／射程／tactics，修本線錯字或runner部署後只重跑受影響配置，規格本身不能擅調。若仍0次，在REPORT明記FAILED及原因交領導；不追加MCP、平衡試打或戰役重錄。

## 資源與禁區

可寫程式碼線（本批只寫內容JSON），只寫上述worktree新檔與報告。子代理上限1個，模型隨意；不要求啟用，若啟用也須親讀相同規矩、寫入同受限制，REPORT如實記錄。領導在啟動前建立worktree、將manifest base的TBD換成實際HEAD；本線不建分支或worktree。

不 commit、不 push、不 rebase／reset、不刪檔、不 rm -rf、不改 ~/.codex/config.toml、不裝依賴、不碰鍵鼠螢幕、不開GUI、不上網、不用MCP。數值後期統一調，無授權不改參照與黃金。工具壞掉／沙箱拒寫回BLOCKED，自己打錯自己修。

## 工作

先親讀規矩與12列規格，確認manifest已填實際base。依序寫能力與部件，兩者成對交付；沿現有範本補語句但不補新機制。完成後只跑固定四條，寫REPORT與review，回覆五行摘要及REPORT路徑。

## 交付

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gw-03/REPORT.md`：開頭已讀清單，正文做了什麼／產出／沒做到或證據不足／需要決定，附四條驗收結果及原始log位置。若REPORT檔名被擋，用同目錄report.md並明記。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gw-03/review.json`：wf-table/1，欄位「檔、類別、名稱、白話、掛到」，12列、每列白話≤60字。`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gw-03/smoke.json`：wf-table/1，每場一列，配置／seed／輪數／結局／例外／新能力使用次數；原始輸出放smoke-log。

## 驗收（固定4條，做完就停）

1. worktree npm run check含OK 0 errors、typecheck成功、npm test無新失敗；原始證據保留，遇環境失敗照實回報，不改黃金或擴張修復範圍。
2. 固定12新檔存在，檔名=id尾段，與new-items本批欄位規格一致；只有指定新增，既有檔未改。
3. 固定6配置各5 seeds共30場，0例外，每條新能力至少1次AI AbilityUsed；不把結果當平衡驗收。
4. REPORT有已讀清單與上述證據；review.json合法且12列、白話≤60字；smoke.json與原始輸出齊。

## 失敗與回報

測出錯誤先在本線範圍修；規格或AI缺口修不了回FAILED，工具或環境測不出回BLOCKED，寫清解除條件。完成回DONE，不以舊證據冒充本次結果，不增加驗收條件。此稿未授權對外寄送訊息，交回領導由既定派工流程收線。
