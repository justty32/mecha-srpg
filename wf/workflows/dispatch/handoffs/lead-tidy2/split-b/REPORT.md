# cx-td2-split-b REPORT

## 做了什麼

親讀 ROOT/AGENTS.md、lead-tidy2/common.md、wf/STRUCTURE.md、common/user.md、tidy/README.md、tidy/gotchas.md、common/data-files.md（B 法），並讀 WORKFLOWS、SESSION-LOG、WAIT_USER 與開場收信。未寄信、未派子代理。

只拆指定六份世界觀文件：原路徑保留為入口，新增 12 份主題子檔；README 的歷史內容直接放 world-history.md。所有原二級標題留在原入口，既有標題錨點不因拆檔消失；子檔第一行連回入口。原文正文、標記與編號逐段保留，只重算搬入子目錄後的相對連結；新增文字限導航與摘要。

固定四條驗收：

1. **通過**：wc -c 核對六入口及十二子檔，入口 1360–4675 bytes，子檔 2572–4490 bytes，全部 ≤ 6144；入口亦全部 ≤ 5120。正文產物共 54500 bytes，較拆前 48607 bytes 增 5893 bytes，低於 0.2 MB。
2. **未通過**：執行 bash wf/tools/wf-lint.sh --strict .，結果如下；唯一計入的違規在範圍外 CLAIMS.md，不擅改其他線的檔案。

```text
BIGLIST wf/workflows/dispatch/CLAIMS.md:9-13 (1795 bytes, table, 5 rows, 0 links)
TOTAL broken=0 residue=0 oversize=0 biglist=1 querycmd=0 local=0
```

3. **通過**：python3 wf/tools/check_anchors.py 結束碼 0、無輸出，0 個壞錨點。
4. **通過**：拆前／拆後原正文區塊 140 → 140；逐檔以多重集合比對全文，除相對連結正規化之外逐字相同，重複次數亦相同。正文區塊按空白行分隔，排除標題；新增入口導覽與子檔返回列不計入原文。原 34 個二級標題的內容位置逐列列於下表。

## 產出

六入口及十二子檔都在 wf/workflows/planning/specs/world/ 內。未整檔搬移，沒有 git mv，也沒有須交付的 moves.tsv。拆段落的相對連結由 wf/tools/fix_moved_links.py 的 sub_md 重算；另以空搬移表執行 CLI dry-run，輸出 files changed: 0 (dry-run)，不對全庫套用替換。沒有 commit、push、刪檔或更動現役線檔案。

下表路徑均相對 world/；原標題仍保留入口作導航，表內位置為其原正文所在子檔。各檔的一級標題、原導航列與導言均留原入口；README 的一句話設定、基調、子檔導航原段落也留入口。

### setting.md（原正文 25 → 25）

<!-- wf-nav -->
| 原段落標題 | 新位置 |
|---|---|
| 2108 的地球 | [C1] |
| 月球 | [C1] |
| 蝕潮與墟：裂縫與遺跡是同一夜的兩面 | [C1] |
| 抵抗性與精粹：沒有精粹的兵器殺不了獸 | [C2] |
| 為何 2108 還用機甲 | [C2] |
| 人類現況：怎麼組織抵抗 | [C2] |

### operations.md（原正文 26 → 26）

<!-- wf-nav -->
| 原段落標題 | 新位置 |
|---|---|
| 迴圈：一個蝕月在做什麼 | [C3] |
| 世界圖與浮船 | [C4] |
| 地月移動 | [C4] |
| 凡鐵空援：破甲不收命（取代「十分律空援」） | [C5] |
| 時間尺度 | [C3] |
| 戰場之外的互動形式：按鈕、列表、面板、快捷鍵 | [C5] |

### factions.md（原正文 26 → 26）

<!-- wf-nav -->
| 原段落標題 | 新位置 |
|---|---|
| 玩家組織：獵團與浮船「候鳥號」 | [C6] |
| 勢力是什麼：開放結構 | [C6] |
| 大勢力樣本 | [C7] |
| 小勢力樣本 | [C7] |
| 裂獸：不是勢力，是天氣 | [C7] |
| 敵對人類勢力：要，但是少數 | [C7] |

### README.md（原正文 13 → 13）

<!-- wf-nav -->
| 原段落標題 | 新位置 |
|---|---|
| 一句話設定 | 原入口 |
| 基調 | 原入口 |
| 子檔導航 | 原入口 |
| 十句話世界簡史 | [C8] |
| 定案：規模、傘與四期 | [C8] |

### rifts-and-territory.md（原正文 27 → 27）

<!-- wf-nav -->
| 原段落標題 | 新位置 |
|---|---|
| 時鐘：蝕月、潮候與潮勢、星候、蝕壓 | [C9] |
| 裂縫：怎麼開、開出什麼 | [C9] |
| 地盤：蝕域怎麼長 | [C9] |
| 蝕錨與繫：各族怎麼撐開裂縫 | [C10] |
| 封閉與收復 | [C10] |
| 灰色選擇：養裂 | [C10] |

### machine-souls.md（原正文 23 → 23）

<!-- wf-nav -->
| 原段落標題 | 新位置 |
|---|---|
| 機魂是什麼：人物，不是部件 | [C11] |
| 出生與成長：科研是天賦樹、陪伴是時間 | [C11] |
| 座艙關係：協作、接手、爭奪 | [C12] |
| 機魂與另外兩系、與各勢力 | [C12] |
| 死亡、搬家、不可複製 | [C12] |

子檔位置：

<!-- wf-nav -->
- [C1]：setting/earth-moon-and-eclipse.md
- [C2]：setting/mechs-and-society.md
- [C3]：operations/cycle-and-time.md
- [C4]：operations/map-and-travel.md
- [C5]：operations/support-and-interface.md
- [C6]：factions/hunters-and-structure.md
- [C7]：factions/actors-and-enemies.md
- [C8]：world-history.md
- [C9]：rifts-and-territory/timing-and-growth.md
- [C10]：rifts-and-territory/anchors-and-recovery.md
- [C11]：machine-souls/person-and-growth.md
- [C12]：machine-souls/cockpit-and-fate.md

[C1]: ../../../../planning/specs/world/setting/earth-moon-and-eclipse.md
[C2]: ../../../../planning/specs/world/setting/mechs-and-society.md
[C3]: ../../../../planning/specs/world/operations/cycle-and-time.md
[C4]: ../../../../planning/specs/world/operations/map-and-travel.md
[C5]: ../../../../planning/specs/world/operations/support-and-interface.md
[C6]: ../../../../planning/specs/world/factions/hunters-and-structure.md
[C7]: ../../../../planning/specs/world/factions/actors-and-enemies.md
[C8]: ../../../../planning/specs/world/world-history.md
[C9]: ../../../../planning/specs/world/rifts-and-territory/timing-and-growth.md
[C10]: ../../../../planning/specs/world/rifts-and-territory/anchors-and-recovery.md
[C11]: ../../../../planning/specs/world/machine-souls/person-and-growth.md
[C12]: ../../../../planning/specs/world/machine-souls/cockpit-and-fate.md

## 沒做到或證據不足的

全庫嚴格 lint 尚未達到指定的全零輸出，原因為上列範圍外 CLAIMS.md 的 BIGLIST；固定第 2 條不得算通過。另有兩筆 BIGLIST-LINKS 警告不計入失敗。沒有越界修補，也沒有增加驗收條件。

原始段落快照、對帳腳本、數據與完整驗收輸出位於 /tmp/cx-td2-split-b/scratchpad/，供本機核對；不把暫存資料寫進其他線目錄。

## 需要決定的事

沒有內容裁示需求。請領導由有權限的線處理 CLAIMS.md，之後重跑固定第 2 條；本線不擴大範圍。

以後交接書該點名的工具：現有 wc -c、wf-lint.sh、check_anchors.py、fix_moved_links.py 已足夠；段落對帳採本次暫存 reconcile.py，未新增專案工具。
