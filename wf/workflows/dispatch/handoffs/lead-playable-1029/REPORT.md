# 本輪完整遊玩整合 REPORT

## 做了什麼

修復營運頁載入時引入 Node CLI 的問題及載入失敗後無法重試；營運快照採懶建與共用，回收物接入戰果及材料庫存。戰場加入地物損傷與崩塌、拾取補給與碎石投擲、殘骸及屍體回收，並提供可操作的地面支援及常規兵種混合情境。

戰鬥採新等效圓幾何、移動與側閃命中模型，加入器官功能、肢體損壞與失血傷勢、部位定向、真盾承傷與有限招架，以及有限傷害分散／穿透多部位。UI 顯示實判預覽、防護與可能後果。舊命中 +15 和核心曝光／HP 候選未採為最終。本輪是可遊玩機制的擴充，不是完整 DF 模擬。

## 產出

最新原預設4v4目標已量測通過：AP2／鐮肢總傷40、原五級移動、編組／地圖／初資源不變，原25回歸及真正事前固定新5共30/30在9回合內首次達一方全滅或剩員全重傷，並於9回合內真全殲。全為敵方受壓，0拒絕／撤退／棄機，不代表均勢。新保留607／701／809／907／1009首次6／6／8／6／9、真全殲6／6／9／6／9；達標時809及1009唯一存活敵核心結構22.8%／18%，其餘三場首次即全殲。固定判準及健康／純外甲／資源耗盡陰性與真核心／血量陽性自檢，見 [重傷審計](../../../planning/specs/demo-severity-1029.md)及[引擎量測](../playable-engine-1029/DEMO-BALANCE.md)。配置hash `d77becb3755551b8`；舊AP3／傷40僅24/25是診斷歷史，並未冒稱通過。

五級移動為超重2／重3／普通4／輕5／超輕6，機甲與怪獸共用整回合地形額度，負載及腿結構傷修正，重複move／AP回復／Wait／讀檔不能重領；移動／turn／save／schema27/27。常規混合1／7／13均7回合enemy勝、0timeout／拒絕，不宣稱均勢。營運區域已改一區一穩定anchor文字、普通格無常駐字；新布局含僅計結構層的格內完整度、已知 vital ≤30% 危重提示、未知資訊遮罩與常駐部位面板。營運地圖使用實際 contain 矩形並拒絕留白處導航。

最終標準headless營運2案皆通過，完整循環23.6秒（標準30秒未放寬）、導航保留2.1秒；早期快取診斷51.3→14.3秒為歷史版本，不當最終耗時。相關獨立結果包括命中／屍體 19/19、地物存讀 16/16、營運快取 6/6，以及另一相關批次 53/53；這些批次可能重疊，不加總為總案例數。typecheck、內容檢查與 build 通過；最新無 trace 完整 e2e 19/19 通過（1.7 分鐘，exit 0；`/tmp/playable-all19-normal.log`）。兩個 fixture 保留原 mock 邊界與真 onMuster 初始 setup，原語義各兩次 2/2 通過。各線細節見 [引擎](../playable-engine-1029/REPORT.md)、[UI](../playable-ui-1029/REPORT.md)、[營運](../playable-ops-1029/REPORT.md)及[審查](../playable-review-1029/REPORT.md)。

## 沒做到或證據不足

完整full已跑完：1122 tests、1111 pass／9 fail／2環境skip，1977.0秒，exit1；[原始TAP](full-suite.tap)、[九項分類及增量結果](full-failures.json)、[13份golden前後SHA未變](golden-full-integrity.json)。九項已由強回歸消除：受影響93案先92過／1個受控AI前提紅，隔離spawner目標加分後AI全檔3/3通過；保留原負對照與選擇斷言，未修改產品算法，不宣稱原full單次全綠。strict wf-lint已執行exit1，硬錯僅原兩條唯讀legacy外部壞鏈；oversize／biglist／local皆0，10份brief strict0。過往部分測試與上述標準營運 e2e 不能替代最終整合驗證。使用者尚未實機評閱畫面與手感，30 個固定樣本也不能代表任意種子或手動策略。astra 最終新圖複看無阻擋；桌面quick-menu邊界夾位／內捲動已通過靠下長清單1/1與六個受影響頁案6/6（12.3秒），astra新圖審通過；真原生點擊、AP／命令／牆HP與zoom／resize契約保留。

本輪 wf-lint 記錄有兩個 legacy 文件指向外部路徑的壞連結，legacy 為唯讀基準；此為原基準例外，未改legacy。環境缺設定所期望的 Chromium 1248，實際營運 e2e 使用既有 1243；這是本輪執行環境，不等於 1248 已驗證。

## 需要決定

無本輪前置產品裁決阻塞；Fable 三題仍待既有裁決，遊玩手感待使用者評閱。產品與證據正按明確路徑提交推送；完成證據將記提交hash。Ubuntu WSL在repo根執行 `npm run dev`，啟動後開 `http://localhost:5173/#/ops` 或首頁戰鬥情境選單；本線測試preview／runner已停止，不宣稱收工後服務在線。

三個12月CLI皆exit0／war errors[]：idle合法no-pilots day104，greedy及merc完成day336（endDay=null）。merc耗時較長，維持nice19／單核，未擴性能重構。完整command／exit／source hash與持久log見[驗證摘要](verification.json)，full快照及後續11檔增量見[SHA差異](post-full-delta.json)；其中僅menus.ts／style.css為runtime UI變更。最終[桌面](evidence/battle-desktop-1280.png)、[360窄窗](evidence/battle-mobile-360.png)、[長選單](evidence/battle-desktop-quickmenu-1280.png)已由astra圖審。

## 本輪一次性黃金流程裁決

主線核准以凍結 `/tmp/playable-verify-1029` 隔離副本替代營運黃金的字面乾淨worktree要求：本輪source尚未提交，不能為重產先提交未全綠UI。以 [輸入SHA表](frozen-input-sha256.json) 記core/content及固定輸入，保存舊新事件／日期／語義證據、兩次確定性一致後只同步精確黃金檔。此例外不改常態testing規則。兩個過時 campaign fixture 已保留合法合約／提示身分與原 mock 邊界、真 onMuster 初始 setup；原損失、付款、背叛聲望及黑名單語義兩次各 2/2 通過，hash 已由隊長同步。
