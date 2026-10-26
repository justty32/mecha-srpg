# lead-dedup 收線報告（2026-10-26）

[handoffs](../README.md)｜審核包 [review-all.json](review-all.json)（183 列）＋[review-guide.md](review-guide.md)｜計畫 plan/plan.md、plan/findings.json（92 列）｜改寫批 dd-01/REPORT.md

> 由頂層代存（harness 擋子 agent 寫報告檔）。

## 結論

七線內容之間無真重複（無同事件兩檔、同人兩名），不建議刪檔。統一 25 處矛盾、收斂 4 處重複、換 4 處設計層用字（35 lore 檔＋2 份設定筆記）；8 處矛盾年表無法判定，留使用者。

## 驗收

lore check 0 錯 2 警告（dark-quay-surety、busan-returned-seal 未進年表，無裁定）；`npm test` 959/959；`npm run check` 0 錯 10 警告；wf-lint 全 0。閘門：dd-01 polish 模式 284 條違規全為預先核可的非文字改動（年表增刪致索引位移、consequences 4、scale／founded／occurs 各 1）；領導按日期＋title 逐筆比對年表（刪 1、增 1、改 6）、人工核其餘、確認 35 檔自 base 未被他線改動後手動帶回，記 manifest waivers。codex 自報 FAILED 只因 node_modules symlink。

## commit

3d79f69（dd-01 入庫＋索引）、15b8da4（收線）。

## 做了什麼

- 計畫 codex gpt-6-astra（cx-dd-plan，92 列：矛盾 39、重複 13、提案 36、禁忌 4）；產出 codex gpt-6.1-sol（cx-dd-01，執行 32 列）。
- 矛盾統一 25：老班拿掉「二十年軍醫」；候鳥號三台；第七哨 2099 或更早有人駐守、2101 納入蝕線；長槍-V4 殘聯默許；沐蝕會公開正文刪「迦梨是藍本」只留 secrets；白夜菌床 2100 首燒；老爹「多年沒變」；2093 成為通用系列的是堅盾；長槍藍本銀環、刑天刻痕後加授權；衍二・堅盾守牆機；鹽鷗鐵砧火併 2106；第一張標單「水上機隊」；伊爾瑟 2093 鐵砧成軍後入團；雅庫茨克 2100 夏失守；金山夜進年表；金山深井刪「偶有低階東西出墟」；釜山雙籤城（三檔）；拆船幫經中間人進貨（年表＋city-types）；鹿特丹自由城市；茉莉「一小時規矩，到點必撤」；埃吉爾認主 `occurs: possible`；候鳥號分家在吉大港；2102 老桂還在鐵砧；萬潮葬王＝唯一走出核心的 S 領主（rift-beasts、wreck-crown 各一句）。
- 去重 4：外購那句收到「堅盾-II型定版」一處；「老鷺再鳴」年表條目併入「第七哨砲台修復」（事件檔保留）。
- 設計層用字 4：7 檔「開節點」→「學會術式」。
- 提案轉已定 3：aegir.md 抵押、city-types 吉大港讀法與鹿特丹歸屬；新名 20 組維持提案送審。

## 需要使用者決定

葛西蓮性別、候鳥號下次漲潮三天或十一天、浦那接應兵二十人或半個連、老桂 2102 堅盾-I 或犁、法蒂瑪 2101 接手或崩年前已任、綠線清剿後裂縫封否、劍魚-V5 A 級在役或 B 級試作、燕鷗長槍改或夸父直系。兩種選項見 review-guide 末節與 plan/plan.md 第 4 節。

## 基調提醒

「債務、徵召、抵押、護航費」這套錢與法理多線共用，審查請看整體是否太像經濟報導、怪獸與古代機分量太少；南亞那批偏冷。

## 工具問題（交工具線）

tabledb 讀 timeline.json 的 entries 會誤回空（交接書應點名用 python json 讀）；polish 閘門不認年表條目增刪與 consequences，可加依 title 比對的 timeline 模式。
