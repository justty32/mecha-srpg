# 預設交戰十回合重創驗收

[移動](combat-movement-1029.md)｜[部位傷勢](combat-aim-injuries-1029.md)｜[舊量測](demo-balance-1029.md)

## 最高目標

最新使用者裁示取代二十回合全殲：原default 4v4雙方積極交戰，十回合內至少一方原始四台全部死亡，或死者已解決而其餘仍存活者全部重傷。這是probe/audit的節奏指標，不把重傷改成遊戲勝利、死亡或離場。仍追蹤真正全殲回合，不能將兩者混稱。

固定原始四個unit id；召喚物不補數，退場、棄機、被俘與失聯不當死者或重傷者。每個命令完成及turn tick完成後，讀一致狀態及死亡事件；首次某方每id均為有UnitDied的dead或仍active且severe時，記firstSevereSideRound。原四台全dead且有四個唯一UnitDied另記trueEliminationRound。任何retreat/eject仍使該場主驗不合格。

## 固定嚴重度，不為通過而放寬

severe以下三條任一成立。A：任一具有core功能的部位，其structural層現HP合計除原structural層max合計≤0.30；外甲、盾、非結構內層不計。分母0則不適用。B：任一vital:true生命pool之(value-min)/(max-min)≤0.30，分母須正；目前代表為血量。不是把charge、AP或燼當生命。

C：至少兩個不同重要部位已broken，且其毀壞造成真永久功能失能。重要部位只從既有mobility/locomotion及武器、器官能力關係判讀；標籤本身不夠。受損前有、受損後沒有的移動模式，依mobilityMinimum及legacy locomotion判讀；共同支撐的腿低於minimum時，該模式的已毀支撐腿都可計入，若尚能保持該模式則不能僅因腿broken計數。

武器／器官以初始具備的傷害能力為基準，因abilityParts所需完好部位數不滿或提供能力的裝配武器損毀而永久不可用，相關已毀部位才可計。若另一完好來源仍提供同能力，不能假稱失去此能力。只毀component而part未broken不湊兩個部位。兩處不同部位可共同使同一多部位器官失能，但不得把一處部位的兩層、兩件配件或兩個debuff算兩處。

計算結構可用性時排除AP、熱、charge、冷卻時間、距離、目標、士氣、暫時狀態及控制策略；不能直接以整包checkAbility失敗代替永久失能。單純感測降準、裝甲磨損、暫debuff、重傷導致移動變慢但仍能移動，均不滿足C。A/B仍可獨立判重傷。

## 可重現證據

先保持cleave36與現有幾何命中、五級移動，用seed1/7/13讀首次重傷與真全殲回合，不先調數字。輸出每方原4id在首次達標時的status、coreRatio、vitalRatio、brokenImportantIds、lostMobility、lostDamageAbilities與severeReason；列首次達標方、回合、真全殲回合及timeout/未達，不只winner。

門檻先固定；再以同20固定seed加5保留seed重驗≤10主目標。保留原陣、地圖、部署、初始資源與五級移動；只在觀察到因果瓶頸後作小幅內容數值調整。原25/25二十回合結果僅歷史，不能作最新驗收證據。新觀察不可宣稱所有seed保證成功。

只增probe/audit判讀與報告，不新增產品傷勢或勝負機制，不擴UI及資料範圍；設計線不跑測試。總129/140 gate仍由隊長核唯一產品檔。
