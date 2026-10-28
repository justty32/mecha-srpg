# 怪獸隊交付：八個形態／二十檔，focused 通過、實戰待領導驗收

## 已讀清單（manifest.mustRead 逐列）

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/common/user/working.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/acceptance-playtest.md`
- `content/lore/style.md`
- `wf/workflows/planning/specs/core/content-format.md`

完整親讀範圍見 [readlist.json](readlist.json)，含全部二十五份 content 工作流 Markdown、world-pillars 子檔、style/people、現行範本及 code 窄段；不是只靠摘要。PREFLIGHT 是產出前歷史快照，本報告為正式產出狀態。

## 做了什麼

在 `/tmp/expansion-1028/wt/monsters`、固定 base `c09b026919eeee03cde68c0f1eb0d289ad4cbe7c` 新增 **八 monster＋八 ability＋兩 effect＋兩 scenario＝二十檔**，正好等於 manifest.plannedFiles。內容共 30237 B、最大單檔 3585 B。未改舊資料、source、schema、spec、registry、黃金、主工作樹 content 或索引；未 commit／push／安裝／開 GUI，子代理零。`node_modules` 是領導預建的連結，閘門明確認作 ignored。

這是**既有 species 的八個形態，不是八個新 species**。D–B 無 `name`／`epithet`；俗稱放 etymology／部位名，英文標 form。繼承招全保留，extraAbilities 各追加一招。白話與完整取捨見 [review.json](review.json) 八列 EX-K01–EX-K08；命名見 [naming.json](naming.json) 八列。

| 件 | HP | 部位犧牲 → 新招／情境 |
|---|---:|---|
| K01 倒鉤 | 100 | 薄甲露腹 → 離鄰倒刺／四隅 |
| K02 鎖翅 | 370 | 鉗翼失機動、核外露 → 合翼鎖／四隅 |
| K03 燼吻 | 385 | 前鏟失機動、薄首背 → 熱扇面／四隅 |
| K04 背針 | 860 | 厚背減半、露心 → 遠距穿列／四隅 |
| K05 漏燈 | 420 | 鉤足失機動、弱能量抗 → 啜光／辨根 |
| K06 雙針 | 110 | 護片變肉、核變薄 → 岔針線攻／辨根 |
| K07 悶燈 | 320 | 柱冠雙脆核、無自癒 → 熱團催燼／辨根 |
| K08 斷穗 | 410 | 冠失靈目、獨核外露 → 遠酸團／辨根 |

「四隅」為 `scenario/exk-four-corners`、覆蓋 K01–K04；「辨根」為 `scenario/exk-split-roots`、覆蓋 K05–K08。兩場沿用既有地圖，雙方起點最近相距十三格；我方有光矢、鳴刃及既有生物／古代招，人物不重複，明列玩家全滅敗條件與守路目標，不靠清光全部敵人。這是展示掛接，尚未宣稱部署／勝率已平衡。

## 必要的相容修正

初版 K07／K08 掛 wick-mat／reed-lace，但它們的 capture.frame 是 bio-bed，bodyplan 的部位 ID 不同；現行 loader 對 partsOverride 逐部位驗捕後 ID／層數，會直接拒絕。已依 astra 經領導核定的最小替代，兩件改 **species/stalk、C 級、mycel-stalk、capture bio-stalk**，檔名／件數／新招不變，沒有改引擎或舊 species。

K07 的中間稿又把 roots 同時列 core／locomotion，與 stalk「core 完好＋locomotion 全毀」互斥。已依領導後續明確核定，第二 core 改在 **crown（保留 sensor）**，roots 只保留原 locomotion；pillar 保留 core／cockpit。三部位 HP 為 180／80／60、各兩層，全體 chitin 去 regen。這只為既有程式入口相容，不是菌絲可活捕的設定許可，也不用冠假裝行走；當前 ready 表若仍寫 roots-core，以上述後續核定與實際新檔為準，請領導同步表文。

K08 保留原 pillar／roots 層，移除 pillar 的 core、保留 cockpit；crown 改 core／weaponMount，失 sensor、exposure 為三，總層 HP 四十（結構 flesh 三十），原 chitin regen 三保留。兩件仍繼承地衣縛足／白夜孢霧，不再聲稱繼承燈苔酸線或蘆網三核。

全部八件部位 ID／層數與各自捕後 frame 靜態相容、至少一個可毀 core、末層 structural；菌絲無 organ，保留零抗弱型。K06 護片原本就只有一層，換成 flesh 二十而不增減層。

## focused 四道（每道只跑一次）

原始輸出： [check.log](check.log)、[lore.log](lore.log)、[typecheck.log](typecheck.log)、[gate.log](gate.log)；指令、耗時、退出碼見 [focused-results.json](focused-results.json)。

- loader check：exit 0，`OK 0 errors, 43 warnings`。其中新檔七條均為預期的 `capture layer HP differs`；K05 未改 HP，不產生此警告。沒有新錯誤。
- lore：exit 0，errors 0／warnings 0；沒有修改 lore。
- typecheck：exit 0，兩份 noEmit 型別檢查通過；npm 只提示既有 http-proxy 環境鍵將來停用，沒有動設定。
- gate：exit 0，approved 二十檔、violations 空；ignored 僅 node_modules。

未跑 npm test、probe、MCP、sim、黃金重錄或任何螢幕檢查；manifest 維持 draft，實戰／能力覆蓋／數值／敘事與整合驗收由領導串行處理。

## 待領導實戰核驗與邊界

**反應與效果**：K01 使用現行 `trigger.event=enemyLeavesAdjacent`、`oncePer=turn`、melee tag，成本／產出皆空；只在敵機真正離開鄰格才反應，不是主動指令。普通 AI 場若零次使用，不能就此宣稱壞掉或已覆蓋，須安排鄰格離開的手動核驗。K02 命中才掛既有兩回合縛網，不拉人、不直接捕獲。

K05 耗目標已有 charge 十五、不補自己；K07 只在 onApply 添目標已有 heat 十二。兩 effect 有中文 badge／mech scope，缺池 guard 略過而不造池；工人未動態核驗。**領導首輪已回報 K07 被 AI 使用**：保留熱傷四＋灌燼十二，以資源壓力明示低於純傷帶的例外，不為變綠硬拉到十二；薄甲、無 regen、HP 三百二十均不變。

**既有程式入口**：capture 路徑仍指向既有 species.capture.frame，extraAbility／partsOverride 定義不保留；這是舊機制相容說明，**菌絲設定仍只採集，不宣稱可活捕駕駛**。現行 capture 沿索引帶走層 HP／broken 狀態，不會替本批自動補滿或按原最大值重標；七條 HP 差異警告如實保留。K06 的單層肉質護片捕後改按原 frame 的 chitin 定義解讀同索引狀態。K02／K03／K05 的機動功能、K07／K08 的核心功能也回原 frame；需由領導核捕後行動／死亡判定，不宣稱形態永久保留。沒有宣稱打斷攻具會自動封 extraAbility、鑽地招真位移或有翼就會飛。

**去重與留白**：實作依核定的近鄰差異保留部位代價，不是換名或單純加血；K07／K08 已改成同菌柱的雙核／獨冠核兩種取捨。舊 215 件、七輪與既有 draft 都沒有升格 verified。P01、舊 lore 裁決、SS／SSS 與裏側答案未處理，未續歷史 inbox。

## 固定三條驗收結論

1. 二十精確檔已齊；各形態有真部位取捨與新招，gate 無越界。
2. review／naming 各八列、readlist 與上述 mustRead 齊；非新 species、既有程式入口相容與菌絲僅採集的界線已明示。
3. 四道 focused 各一次均 exit 0，原始證據存在；重驗與捕後／條件招風險完整交給領導，未自行帶回或 commit。

## 領導窄退修紀錄

首四道後只改 K07／K08 etymology 及對應 review：菌絲只採集，程式 capture.frame 不形成活捕駕駛許可。數值／部位不變；前後 hash 見 focused-results.postCheckRevision，最終字串交領導覆核。

其後領導回報 K06 首輪五 seed 單體 probe、兩展示各五 seed 皆零次使用。只調新招 pierce 五→六、attackArea 一→一點五，作為成列收益／偏好一組旋鈕，單發仍在 D 帶；AP 三、CD 二、射程與部位全不變，其餘十九檔 hash 不變。補跑一次 [loader](check-k06.log)：exit 0、零錯／四十三警告。前後 hash 見 focused-results.balanceRevision；工人沒跑 probe，領導負責第二輪及小型成列 AI 核驗，若仍不過不開第三輪。
