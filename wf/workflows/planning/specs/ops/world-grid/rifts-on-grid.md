# rifts-on-grid — 裂縫落在格上、蝕塊擴散與收縮、深度、城邦失守、新裂縫落點

[world-grid README](README.md)｜狀態機七態沿用 [data-model-world-map](../data-model-world-map.md)（裂縫節）｜世界觀 [world/rifts-and-territory](../../world/rifts-and-territory.md)

## 裂縫的位置

```ts
type RiftState = { id: Id; at: Loc /*核心格；取代 node*/; site: Id /*自動建立的 rift-site 地點*/; family: Id; width: Grade;
  phase: /*七態不變*/; openedDay: number; anchorAge: number; anchor?: Id; patches: Id[] /*蝕塊 id，取代 zones*/; fedCount: number; nextCheck: number };
```

開裂時程式在核心格建一個 `PlaceDef{kind:"rift-site"}`（名字由族與區域組：「恆河口的蟲潮」），讓契約、事件、`sail.to` 都有東西可指；`closed` 後變 `ruin`（墟在蝕潮旁邊露出，三分之一含 `seedTable`）或刪除。

## 蝕塊 BlightPatch（取代「節點的 blight 狀態」）

```ts
type BlightPatch = { id: Id; rift: Id; map: Id; cells: Cell[] /*7–12 格、連通*/; sinceDay: number; burned?: boolean };
// 存檔另有索引 maps[map].blight: Record<CellKey, { rift: Id; patch: Id }>，由 patches 推導、載入時重建
```

**深度**由塊齡算，不另存：核＝第 0 塊（錨所在，開裂時 1 格、第 4 天錨到擴成 3×3）；`sinceDay` 距今 < 2 蝕月＝淺蝕、≥ 2 蝕月＝深蝕。「每漲潮蝕化 `1 + floor(anchorAge/2)` 個相鄰區」原句不改，**區＝蝕塊**：每塊從現有蝕域的**邊緣格**（八鄰有蝕、自己無蝕）抽一個種子，權重＝地形 `rift_affinity` × 族偏好（蟲族偏城廓與林海、獸族偏平野荒野、菌絲不挑、異形無錨不長），再以洪水填充長到 `patchSize`（抽 7–12）格，不進潮海與雲嶂（淺灘可以）。菌床固定 2 塊／漲潮。蟲族巢母的「游態」是一個 `swarm` 行動者，走到的格若離蝕域 ≥ 6 格就留下一個 `opening` 候選——下個漲潮可能在那開新裂縫。

**收縮**：`receding` 每蝕月**退最年輕的一塊**（LIFO），菌絲塊要先 `burned`（由戰果或 `burn` 契約寫旗）；退完 `closed`。殘聯收復金按退回的塊付。`unanchored` 無人守→新錨到，塊不退。

## 通行與遭遇

淺蝕格：船成本 12、每天 25% 遭遇（swarm 行動者不在也會生「野群」臨時行動者）；深蝕：船 20、60%、地面不可進；核：船 25、必遭遇、只有接了契約或自願 `sail` 進去才會到。深蝕格上戰場用「裏側地形」為主（`battle_pool` 查 `terrain-layers.json` 的蝕淵列，再疊族別：巢壁／礦化荒原／菌毯／碎鏡地）。

## 城邦失守與收復

地點 `footprint` 有任一格被蝕化 → `PlaceState.ownerOverride = 裂獸勢力`、事件 `CityLost`、該城的市場／招募／天網全停、巡邏與商隊消失、該城所有契約 `failed`；蝕塊退到 footprint 乾淨 → `NodeReclaimed` 改名 `PlaceReclaimed`、owner 回來、服務一個蝕月後逐項恢復。三座蝕核城（孟買、聖保羅、拉哥斯）開局就是 `footprint` 5×5 全核、裂縫 `width:"A"`、`anchorAge` 大，蝕域半徑約 15–25 格。

## 新裂縫落點（漲潮日、蝕壓）

蝕壓算新裂縫**數**的部分不變（泊松）。**落點**：七成從既有蝕域邊緣 ≤ 3 格的陸格抽（主族沿用）、三成從離任何城 footprint ≥ 6 格的野地陸格抽（主族隨機）、城邦邊（≤ 2 格）機率 `cityBias × pressure`；候選權重＝`rift_affinity`，雲嶂與潮海 0、月面只有月坑可開。每張圖各自抽（蝕壓是全局量、按各圖陸格數比例分配均值）；月面在 `anchorAge` 大於 0 的裂縫不存在時一律不開（設定：月面只裂過一次）——這是內容開關 `continents.json.rift_rate`，不是程式分支。

## 蝕壓對照

「每多一個蝕化節點 `+k2`／蝕月」改為「每多一塊 `+k2`／蝕月」；`sealed −k1` 不變。一塊約 10 格，量級與第一版一節點相當，數值不用重調。

## 替使用者做掉的決定

1. **蝕塊 7–12 格、LIFO 退**：「區」有了實體，退一區是刪一塊而不是算半徑；LIFO 讓最靠近城的新塊先退，收復有手感。
2. **深度只由塊齡算**：少一個要同步的欄位；「兩蝕月變深蝕」在畫面上會看到一塊一塊變色。
3. **核由 1 格長成 3×3**：第 4 天錨到時畫面上有變化，呼應「前三天只有先鋒」的窗口。
4. **遭遇率寫在深度不寫在族**：族影響打到什麼，深度影響多常打——玩家只需記一組數字。
5. **月面不開新裂縫（內容開關）**：守住「月面只裂過一次、是後方」的設定，但留開關給 mod。


## SPEC-GAP 補（2026-10-26 lead-engine-next）

萬潮葬王北行只在完成當夜建立孟加拉灣北岸事件蝕區；開局不預置裂縫或蝕塊，也不為牠建立出身核心。`BlightPatch` 增加可選 `origin:"event"`、`depthOverride:"shallow"`。事件塊必須 `rift:""`（無裂縫 sentinel）、非核心、1–12 格合法且連通，`maps[map].blight` 仍由 patches 重建並拒絕重疊；普通塊保留原有裂縫父子、塊齡排序與 LIFO 不變量。深度先認普通裂縫核心，再讀非核心 override；事件塊永久淺蝕，不重設既有塊的 `sinceDay`。

唯一寫入口是 `blightShift:{area:"wanchao-north-coast",cells:[{x,y},…],to:"shallow"}`。目標圖與區域來自 `action.lordScript.blight`；本區固定 x=129..131、y=97..99 九格。套用時排除已有任何 patch 的格及城市 footprint，剩餘格不連通則取最大連通塊；無可用格時只記已套用／略過旗，不建空塊。同一 area 再次套用回 true，不新增塊、不重發事件。錯 area、越界／越區 cells 或其他 to 拒絕，不能用此入口改寫普通塊或核心。

事件塊不列入蝕壓 patch 數，不持有錨、不加入任何 rift.patches，也不另外生成野群；正常 growPatch 仍以索引避讓它。它只影響蝕深、通行與呈現；不解封吉大港外灘、不改第二區，也不表示已完成通用獨立蝕域模型。
