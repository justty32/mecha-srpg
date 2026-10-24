# cx-world-dlg 完成：新增三十檔人物營運內容，固定三項驗收通過

## 做了什麼

依交接順序完成背景十二檔、招募池三檔、對白十五檔。十二個背景各引用一位已提交的人類人物，全部由三港招募池覆蓋；聘金 100–850、薪水倍率 0.6–1.6，命中／決心／操控擲骰區間均寬 20，依人物原值上下浮動。背景明列原人物特質，並替便宜的傷後學生、艙外焊工、逃籍傷兵加入已提交傷勢；米塔莉及薩利姆加上已提交的獸緣特質。

五位開局船員各兩檔，另給米塔莉、伊琳娜、薩利姆、優素福、科喬各一檔，共三十個 topic；十檔有 choices，第一選項一律無 requires，只記旗標。會消耗現金的後續選項都有足額檢查；額外工作選項以工時換該人物士氣。選擇完成後轉入後話，避免重複取用效果。手套維持制式口吻，只露出來源複本的錯置泊位與紀錄痕跡；讀取事件線已提供的 `soul-echo-sealed` 旗標。

固定三項驗收證據（背景、招募池、對白每類完成均跑前兩項；未加碼其他驗收）：

1. `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world`：三次 exit 0，依序末行 `OK 276 files`、`OK 279 files`、`OK 294 files`。腳本成功格式自帶檔數，均為 OK。
2. `node src/ops/content/check.ts content/base`：三次 exit 0，末行均為 `OK 0 errors, 0 warnings`。最後總載入量為背景 13、招募池 4、對白 17（含既有檔）；沒有須排除的別線錯誤。
3. `git status --short content/base/world`：按使用者指示僅核本線三個資料夾的新檔，本線全部為 `??`，dialogues 15、backgrounds 12、recruit-pools 3，沒有 ` M`。其他工人的檔案不計本線違規。共三十個內容新檔，最大檔案 1,936 bytes，未觸發 34 檔／單檔 6 KB gate。

沒有 commit，沒有執行 npm test；完成後停止新增內容與驗收。

## 產出

所有內容路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/` 為根；下列 id 的尾名對應同名 `.json`，分別放在 backgrounds／recruit-pools／dialogues。每行列 id、人物或節點、定位。

- `background/seventh-watch-child`｜`person/mitali-das` 米塔莉・達斯｜低聘金、高獸緣的第七哨船屋孩子。
- `background/selene-test-retiree`｜`person/irina-sokolova` 伊琳娜・索科洛娃｜高聘金與薪水的塞勒涅測試老手。
- `background/tide-apostate`｜`person/salim-haddad` 薩利姆・哈達德｜有獸緣、決心高的潮信會叛教者。
- `background/shell-field-student`｜`person/yusuf-demir` 優素福・德米爾｜帶殼訊傷勢返港、低價求職的殼學會學生。
- `background/anvil-salvager`｜`person/kojo-mensah` 科喬・門薩｜先找座艙再談回收價的碼頭技師。
- `background/seventh-watch-diver`｜`person/farida-rahman` 法麗達・拉赫曼｜漁隊裡仍肯下水救人的第七哨潛水員。
- `background/farside-navigator`｜`person/maia-te-rangi` 瑪雅・特朗吉｜熟悉渡輪與債單的背面領航員。
- `background/storm-rescue-skipper`｜`person/tachibana-ibuki` 橘 伊吹｜經驗昂貴、敢破封港閘的救難艇長。
- `background/farside-hull-welder`｜`person/tupaia-moana` 圖派亞・莫阿納｜帶操縱腱傷、以低價上船的背面焊工。
- `background/selene-soul-mender`｜`person/hana-sato` 佐藤 花｜替魂核留下名字的離職維修員。
- `background/shell-marsh-mortician`｜`person/nadia-el-masri` 娜迪雅・馬斯里｜在船屋替無名死者保管暫名的收殮員。
- `background/league-runaway`｜`person/lin-zhaosheng` 林照生｜逃離終身服役書、暫居船屋的帶傷青年。
- `recruit/chittagong`｜`node/chittagong` 吉大港｜四席，混合碼頭回收、漁隊救生、救難艇與返港學生。
- `recruit/singapore`｜`node/singapore` 新加坡｜四席，混合塞勒涅退役名冊與背面渡輪熟面孔。
- `recruit/reed-marsh`｜`node/reed-marsh` 蘆葦澤｜三席，船屋孩子、叛教者、收殮員與逃籍傷兵共用名冊。
- `dialogue/ren-kasai-empty-chair`｜`person/ren-kasai` 葛西 蓮｜空椅與返航名冊承接護親信念。
- `dialogue/ren-kasai-debt-route`｜`person/ren-kasai` 葛西 蓮｜債務比率改變時，談近路與回家的路。
- `dialogue/chen-xiaohai-knuckle`｜`person/chen-xiaohai` 陳小海｜有獸時提醒你留在拘束門外，可用士氣換值班工時。
- `dialogue/chen-xiaohai-shore-song`｜`person/chen-xiaohai` 陳小海｜心情改變船歌的尾巴，留下被潮吞去的地名。
- `dialogue/ilse-brandt-return-knot`｜`person/ilse-brandt` 伊爾瑟・布蘭特｜把不退之誓落在撤退時仍接得住人的繩結。
- `dialogue/ilse-brandt-hull-oath`｜`person/ilse-brandt` 伊爾瑟・布蘭特｜依船殼狀態談漏風與補片上的返航二字。
- `dialogue/mara-okoye-spare-hand`｜`person/mara-okoye` 瑪拉・奧可耶｜先看你的手，再決定怎麼修工具匣。
- `dialogue/mara-okoye-chain-voice`｜`person/mara-okoye` 瑪拉・奧可耶｜磨損警訊與空拘束架保養，讓修理單別變訃聞。
- `dialogue/glove-copy-address`｜`person/glove` 手套｜制式登錄誤念來源泊位，顯露複製紀錄殘留。
- `dialogue/glove-debt-form`｜`person/glove` 手套｜債務表單與封存回聲，維持無鮮明個性的機魂口吻。
- `dialogue/mitali-das-wake-call`｜`person/mitali-das` 米塔莉・達斯｜在大家罵人之前先叫醒整艘船。
- `dialogue/irina-sokolova-toolbox`｜`person/irina-sokolova` 伊琳娜・索科洛娃｜工具箱押在渡輪，扳手凹痕卻屬於她的手。
- `dialogue/salim-haddad-closed-mouth`｜`person/salim-haddad` 薩利姆・哈達德｜放走罕見會求饒的機魂後，仍在戒掉舊禱詞。
- `dialogue/yusuf-demir-exit-map`｜`person/yusuf-demir` 優素福・德米爾｜殼紋背面先畫出口，真相得讓同行者回得來。
- `dialogue/kojo-mensah-last-tool`｜`person/kojo-mensah` 科喬・門薩｜工具握柄上的名字讓回收價目表閉嘴。

報告：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-dlg/REPORT.md`。

最得意的 3 件：

- 手套錯念靜海市泊位，再按制式流程更正，沒有靠鮮明人格表現複本痕跡。
- 小海不把安靜的獸當成答應合作，與瑪拉聽見鎖鏈先喊疼形成拘束艙的兩種視角。
- 科喬先看工具上的刻字再談價錢，將回收技師的定位寫進玩家可選的行動。

## 沒做到或證據不足的

無未完成的指定件數。依固定配方只新增五位招募人物的對白；其餘七位背景人物本次未另配對白。

SPEC-GAP：`src/ops/crew/recruit.ts` 依背景抽人物模板，可重複抽中；目前未做獨特人物去重或另生姓名，雇用後仍沿用模板身份。對白以模板引用匹配，指向 `person/<模板>` 的 mood 效果會作用於同模板的所有受雇者，並非只改正在說話的那一位。此為現行引擎行為，本線未改程式。

背景 culture 採可用的神話命名傳統，並非改人物族裔：伊琳娜採 norse、薩利姆與優素福採 mesopotamia，科喬採任職孟加拉灣碼頭的 bengal；其餘按已知出身選表。人物模板目前沒有對應 culture 欄可直接複製。

既有葛西蓮／陳小海的首話題仍優先；新增話題用指定 topic 選取。十個對話旗標依現行引擎為戰役共享，同模板後續招募者也會讀到已完成的後話。這次只做指定內容檢查與狀態驗收，未宣稱已完成 UI 試玩。

## 需要決定的事

無阻塞本線收件的事項；後續若要每位具名人物只出現一次、或各實例獨立記對話進度，需另派程式線處理上述 SPEC-GAP。本線不擴充件數或修改引擎。

以後交接書該點名的工具：現有 `git ls-files`、`inbox_poll.sh`、`inbox_mail.sh`、`lint_world.py`、`node src/ops/content/check.ts` 已足夠；可補 `git show HEAD:<人物檔>`，直接確認讀到已提交版本。
