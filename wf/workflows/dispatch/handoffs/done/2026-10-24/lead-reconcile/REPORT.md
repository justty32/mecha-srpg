# lead-reconcile 收線報告（2026-10-24）

[handoffs](../README.md)｜改寫指引 [guide](guide.md)｜裁示入口 [history-lines「裁示」段](../../../planning/design-notes/world/history-lines.md)

> 由頂層代存（harness 擋子 agent 寫報告檔）。

## 結論

待和解 32 列已照建議裁示，R32 作廢（不用潮差＝威脅），全部落地。codex polish 9 批共帶回 98 個內容檔，另派 2 個 codex 工人做敘述同步和數字重算。spec、守則、style、terms 由領導親改。HANDOVER 拆成入口加 `handover/`。

驗收：乾淨 worktree（fbffb16）跑 `npm test` 904/904，check／typecheck／lore／ops check 全綠；rc-09 那批另在自己的 worktree 跑過同一套驗收，也是全綠。wf-lint 沒有本線新增的違規。

## 做了什麼

**a. 裁示登記。** history-reconcile.json：

- R01 維持已和解，R10 維持已裁示，其餘 29 列改為「已裁示（2026-10-24 照建議）」，R32 改為「作廢」。
- 新增「採用讀法（2026-10-24）」一欄，每列寫明採用後的具體說法。原因是不少列的建議原文只寫「待裁定」，照字面落地等於沒落地。
- 三句裁示原話記在 history-lines.md「裁示」段，也記進 W11 和 specs/world 的使用者裁示欄：「都按照建議。」「潮差就是威脅...不要用這個概念」「潮汐只是有關聯而已。」

**b. 落地。** 親改的部分：

- specs/world：setting（十五把傘、同夜不同處、海洋來處，以及「與潮汐相應、不由潮汐決定」）；factions、README（十五把傘）；rifts-and-territory（新裂縫海岸優先）；machine-souls（月之暗面、白手套搬魂）；ruins-and-ancient（月之暗面）。
- world-pillars：新增 W11（怪獸多從海洋來、環太平洋為主、內陸少；與潮汐相應，不用潮差），守則從 32 條變 33 條。
- style：月之暗面、潮汐寫法、十五把傘。terms-rename：加「背面→月之暗面」一列。
- tide-sky／lore：三種聲音同源，讖語失真改讀為「被蝕扭曲」；mechanics、intrigue／tide-sky 跟著改。
- intrigue 與 content 文件裡勢力義的「背面」；lore-text 錨點。
- engine-backlog 第 37 列：新裂縫落格加海岸權重。

codex 批次（gpt-6-astra，reasoning high，manifest＋隔離 worktree＋content_accept，一檔只進一批）：

| 批 | 範圍 | 帶回 |
|---|---|---|
| rc-01 | 年表（41 條摘要）＋詞彙表 | 1 |
| rc-02 | 海洋說：沿海核心與歐洲（桑托斯灣區、浦那、九闕喪鐘→聖馬洛、伊斯坦堡產線城） | 12（退回 1 輪） |
| rc-03 | 河口連通、菌絲與內陸少見獸 | 12 |
| rc-04 | 魂線：白手套搬魂、複本是行銷說法、阿鏽同源、無肉者、獵牌法裝備條、首例口徑 | 20 |
| rc-05 | 迦梨、三種聲音、歸還黨三支、新加坡會議制度化、殘聯清剿令 | 18（退回 1 輪） |
| rc-06…08 | 「背面」改名月之暗面，地理義不改 | 9／12／11 |
| rc-09 | 收尾筆誤：秦望舒公刻血統、墨西哥城 31 城、長槍流出 2102 | 3 |

cx-rc-lines：八篇長線、history-nodes／lines／timeline 同步到「採用讀法」（兩輪）。

**c. 第 15 條數字重算。** cx-rc-scale 產出 [scale-v2.json](../../../planning/design-notes/world/scale-v2.json)（45 列）。scale.md 原本的 v1 段縮成指標，換上「提案 v2，待使用者確認」。重點數字：城邦 400、活躍裂縫 150（環太平洋 96、內陸 6）、衍型機 24,000、B 級以上 580、駕駛員同期可用 72%。v2 不用潮差。

**d. HANDOVER。** 照 STRUCTURE「超過 8 KB 就拆資料夾，原路徑當入口」：

- 入口 HANDOVER.md 5.1 KB。
- 第 2 節整段原樣搬到 `handover/rulings.md`，只改一處：海洋那段把第二代推出的潮差門檻拿掉，另起「不用潮差＝威脅」補記。使用者原話一字未動。
- 第 4 節瘦身成 `handover/open.md`：7.8、7.85–7.94 改成指向 history-*.json，原文見 commit 80307c8；第 8 條照 R15、R27 改兩句；第 10 條去掉潮差因果。
- 第 3、5 節各成一檔；第 7 節（已執行）改成一行指標。
- 注意：第二代那批未提交的 HANDOVER 增補（第 8–10 條、14.2–14.4）從未進過 git，現在只存在拆分後的檔裡。

**e. 孤兒表**：沒動。

## 建議建立在潮差門檻上、已改讀的列

R12、R28、R30、R31、R32。凶度一律改讀成「海洋來源（離大洋遠近）＋歷年大潮夜抬級累積」。「安全海造機、凶海用機」改成「內海（地中海）的城離大洋遠而造機、大西洋岸的城直面外洋而用機」。聖馬洛的理由由「歐洲潮差最大」改成「大西洋岸的城牆港、九門意象」。

## 領導代做的取捨

- 二選一的三列：R11 選「殘翼開業就賣精粹矢，拉哥斯之夜後改營運」；R17 選「金山夜 2099，促成 2100 撒南傘」；R22 照年表「每漲潮」。
- 指引「迦梨」那節第一版寫錯（「不寫迦梨是古代機」），rc-02、rc-05 因此把既有 lore 的說法抹掉。更正後重派第 2 輪才還原；現在不點破的只有「迦梨真的存在、聲音是先民記憶」這一層。
- 工人因為交接書寫「lore 檔另可改敘述欄」，把 base 檔的 silhouette 當成不准改而停下（rc-06、rc-09）。這 3 處由領導在 worktree 補改；另把 rc-06 誤改的兩個 farside 背景名還原（id 是地理義）。都記在各 manifest 的 `leadNote`。

## 跳過（lead-grid 領地）與未清

- 沒碰：`content/base/world/maps/lunar.json`、`regions/lunar.json`、`wterrains/crater.json`（「背面」都是地理義）；`rifts/` 族偏好（寫進 engine-backlog 37）；lead-grid 未提交的 `actions/ops-world.json`、`rifts/insect.json`。
- ROSTER 與 inbox done 檔都有 lead-grid 未提交的改動，本線的 ROSTER 格用 HEAD blob 單獨提交。工作樹 ROSTER 8.58 KB 超標是 lead-grid 的格；HEAD 版 8.0 KB。CLAIMS BIGLIST 本來就存在，本線的列收線時已移除。
- 工人信 12 封留在 `wf/inbox/mail/lead-reconcile/`，沒有 ack：ack 會寫 `done/2026-10-24/messages.json`，那份檔有 lead-grid 未提交的改動。
- 「潮差」殘留只剩否定句、裁示原話、R32 作廢列的歷史欄，以及 tide-range（已標「不作威脅判準」，`威脅級` 欄標作廢）。lead-history-lines 收線證據與 inbox done 舊信仍是舊說法，屬已收線紀錄，沒改。
- 工人回報的既有矛盾（另排）：`nine-gates.json` 的 `places` 仍引用 `place/istanbul`（要新增聖馬洛地點）；jonas-halvorsen「再二十六年背面裂開」與 2097 對不上；port-farside-sealed-crate 販子說機魂「替駕整場」；2098 白手套原型「人駕」舊說；女武神 2106 與 2105 事件同名；基多安地斯壁 2094 被稱為堅盾祖先；恩凱位置兩說；samir 2096 停留天數兩說；tide-creed 的 `ancientMech` 欄等於直接揭露迦梨身分（資料結構的事）。

## 暫存 worktree（未刪，交頂層）

scratchpad `rc/` 底下：`wt-base`、`wt-rc-01`…`wt-rc-09`，以及 content_accept 建的 `wt-rc-01-base`…`wt-rc-09-base`。各批 `accept/` 驗收產物沒有 commit，比照 lead-world-land。

## 以後交接書該點名的工具

- polish 交接書寫敘述欄時，要寫「所有檔（含 base）」，不要寫「lore 檔另可改」。閘門的 `proseFields` 本來就對全部檔有效。
- 指引寫「不點破」時，要明寫「既有說法保留」，否則工人會刪既有內容。
- zsh 下多路徑要用 `${=VAR}`；暫存 index 提交可沿用 scratchpad 的 `tcommit.sh` 做法。

## Commits

9fa400e、80307c8、3cd90e8、58bd097、76f6d5d、fbffb16、d0614d2、42f2051（收線）。
