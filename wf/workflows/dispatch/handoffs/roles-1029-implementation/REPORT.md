# 角色AI實作

## 做了什麼

三台常規車輛分別引用frontline、standoff、heat-support選填profile。agent僅原tactical路徑在單位私有context合併參數；失控、scripted、撤退與regroup優先，未標註frame或缺query走原路。只對啟用rangeWeight的可見活躍敵人計距離偏好，補可達改善格並保留真路徑預覽；工程沿既有真排熱收益評分，沒有新增修甲。

## 產出

15個明列產品路徑，未產index（由隊長統一生成）、未碰UI／Pages、數值規則或舊demo。測試在test/ai/unit-roles.test.ts及test/sim/combined-arms.test.ts；固定交戰seed3／17／41，沿既有BattleSession、每場maxSteps1200，記拒絕、終局／卡住及hash。建議串行先型別／內容，再單檔角色測試與combined-arms；實作線未自行啟runner；下列驗證由隊長取得唯一時段後串行執行。

## 證據不足

隊長實跑角色測試8/8通過（8.3秒），combined-arms 9/9通過；固定seed3／17／41均0拒絕，分別7／7／9回合enemy以eliminate勝出，沒有卡住。核心與UI兩段型別檢查、兩段實際內容檢查均exit0；首輪空裝fixture因createBattle不自展defaultLoadout已修為明列真預設components，再測上述全綠。schema的pattern僅宣告profile種類，現generic validator不實作pattern；loader驗引用存在，adapter以require(aiprofile)拒錯種類／缺引用，兩層須分清。三樣本不能證全面平衡。Session拒絕計數由測試攔截既有execute入口，產品API不變。

## 需決定

無新架構決策；source已凍結，最後fixture修正後補核心型別檢查由隊長接續。生成index及最終提交／推送由隊長持有，本線不stage／commit／push。

三完整樣本均敵勝，只證既有完整Session無拒絕／卡住，不表示常規隊伍與怪獸均勢；沒有調傷害、彈藥、AP、移動、命中或demo數值。角色固定局面分別覆蓋坦克前推、飛彈退距與空追矢真機砲、工程真降熱／無需求不施放／不能支付或部件毀損不施放。另以真無profile機型及缺query同seed命令序列對照舊路徑，特殊策略與不活躍單位反例通過。
