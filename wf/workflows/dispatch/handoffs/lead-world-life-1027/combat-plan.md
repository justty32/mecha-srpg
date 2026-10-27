# 機甲與怪獸內容計畫

[主線入口](README.md)｜[逐列計畫](combat-plan.json)

ready_categories：`mechs`、`monsters`。共 12 列，均可交 sol 產出。

機甲為既有血統的 6 件同級勤務改型，6 個 frame＋6 個 model 共 12 檔；主線已同意 manifest 納入 `base/world/models`，提供營運型錄入口。不是新血統、升代或新規則；型錄使用既有 `variant` 角色，登場時間與基底前置逐列指定。

怪獸為 6 個新 monster：4 個新 species 分屬蟲、獸、異形、菌絲，各帶專屬 bio／corpse 配套；另 2 個沿既有 species 的目擊個體。合計 18 檔，全部 D–B，沒有二名。兩個目擊個體刻意沿用原數值，不宣稱新物種。菌絲不可捕，專屬 bio 標 harvest-only。

各批上限 20 檔，跨批無新 ID 依賴；精確路徑、配裝、配套 ID、範本與白話見 JSON。敘事意圖與白話保留於交接，不塞進未支援的 frame／monster 欄位；新 monster 本批不掛遭遇、裂縫或市場。

已親讀指定工作流、內容與世界支柱相關子檔、core 格式與型別、lore 風格；templates／engine-facts／numeric-bands 已透過資料工具定向查詢。僅查選用範本、能力、槽位與候選同名，未擴成全引擎稽核。

不安裝、不測試、不跑整合驗收、不改引擎或 registry、不改既有內容；機制架構留 Fable。ready 只表示可產出，並非已驗收。
