# 第 2 輪來源簡查 REPORT

## 已讀清單

- `AGENTS.md`、`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/common/user.md`、`wf/workflows/team-model.md`。
- `wf/workflows/dispatch/README.md`、`content-batch.md`、本線 `wn-scan-r2-1027.md` 與總 brief `lead-world-next-1027.md`、本線 README。
- `wf/workflows/content/README.md`、`batch.md`、`world-pillars.md`、`world-pillars/world.md` 和其三個子檔、`lore-text.md`；`content/lore/README.md`、`style.md`、`style/people.md`；`wf/workflows/common/data-files.md`。
- world spec 全部 Markdown 與子目錄全文，包含 `README.md`、`setting`、`factions`、`world-history`、`omens`、`voices`、`resistance`、`rifts-and-territory`、`ruins-and-ancient`、`monsters`、`bio-mechs`、`machine-souls`、`pilots`、`mech-lifecycles`、`opening`、`operations`；`monsters.json` 12 列分段定向讀取。
- 依範本表定向讀 lore 範例 `factions/anvil.json`、`characters/ren-kasai.json`、`events/antarctic-shell.json`、`places/accra.json` 全文。候選表 18 列來源逐檔完整讀取，狀態見 `fullTextRead`。

## 產出與方法

[候選表](round2-candidates.json) 共 18 列，月面、非洲、大洋洲各 6 列；各地人物、地點、勢力各兩列。以零依賴 Python 掃描主樹 characters 277、places 122、factions 57 個 JSON 的非 body 欄位，按地名、勢力、職能與摘要篩查，再逐檔完整讀取入表來源 JSON 的正文與其他欄位；匹配詞不是完整語義搜尋。相似判斷標出行動、衝突與場景功能供後續規劃查重，沒有新概念，因此不假裝已有差異或最相似定案。表由 tabledb 資料模型寫入。

查重範圍包含工作樹已暫存的 `wl-*`：上述三類各 6 個，共 18 個；其摘要及非 body 欄位納入掃描，地區關鍵詞未命中這次的三地候選，不代表與未來構想不相似。18 列所引用的來源均以 `git cat-file -e HEAD:<path>` 核過在 HEAD `f24420b079a59a7f8e93123930665aaa824f9d00` 可查；工作樹可能含未提交修改，後續使用前需核對版本。查詢時第 2 輪計畫目錄尚無檔案，未有可定向對照的方案。

## 證據不足、拒用與需決定

大洋洲第二個勢力候選稽古學會是蒙特婁總部的跨洲網絡，其紅心營地與談判可比較，但不能當第二個本地勢力；本地勢力缺口須由規劃者處理。`places/uluru-heart.json` 把古代機視為未證實推測，`characters/ruth-callaghan.json` 和 `factions/sydney.json` 口吻較確定，是否確認其本體須裁決；在此以前拒把彩虹蛇醒來、認主或作為雪梨藍本當確定事實。雙籤城跨傘責任仍未定，不代填。

月面生物系應遵守 world spec 的菌絲共生層或密封艙例外；不採一般裸露獸在無大氣月面正常活動。凡鐵不可擊殺裂獸；北非放閘是困獸等待退潮，而不是水閘或凡鐵殺獸。機魂不可複製，無核心鐵偶不能殺獸；不以矛盾機制湊新概念。朴仁哲失腿成因現有使用者裁決待定，不能以此盤點定案。

## 有限檢查與剩餘風險

本線只做表格格式、數量、來源和 HEAD 存在性檢查，以及交付文件空白檢查；`git diff --check` 回傳 0，但新檔未追蹤，另逐檔用 `git diff --no-index --check` 檢查，無空白錯誤輸出（比較新檔本身回傳 1）。未跑測試、Node、整合或內容驗收。詞彙篩查不能取代對每項新稿與 `wl-*` 的全文查重；上述 18 列是候選來源，未針對尚未出現的規劃構想判定最相似項。此表僅供規劃，不代表內容已完成。
