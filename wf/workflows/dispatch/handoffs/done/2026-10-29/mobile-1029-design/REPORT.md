# 做了什麼

親讀入口及適用工作流、實際 UI／e2e，完成交互與安全設計。依領導要求精簡 spec 至 8,113 bytes，保留 end 白名單與既有確認、command-preferences／command-shortcuts 檔名。先以 view_image 審七張代表圖，再複審修復後戰鬥橫向與世界桌面兩張替換圖；未跑測試、瀏覽器或服務。

# 產出

設計見 [mobile-ui-1029](../../../../../planning/specs/mobile-ui-1029.md)。代表圖為 battle／world 各390×844、844×390、1280×800與wiki390×844，來源 [圖檔目錄](../lead-mobile-1029/shots/)。最終有界圖審通過，無可見 P1／P2 阻擋。

初審 P1「戰鬥橫向快捷／縮放蓋住操作者與命令」已修：替換圖快捷展開，操作者→快捷→主要命令→動畫／縮放依序正常文流，無互疊；移動、待機、結束回合與獨立釘選星號可辨。初審 P2「桌面世界頂列重要資訊被省略」已修：日期、所在與現金1,200／債24,000完整可讀，推進按鈕移至下一列，未遮地圖。

其他初審圖未見同級阻擋：手機直向戰鬥、世界手機直向／橫向、百科及桌面戰場地圖與主控制可見，資訊走正常文流，百科搜尋／分類可達。領導另回報四尺寸e2e及幾何包含性通過；本線未自行重跑，不將其列為親驗結果。

# 證據不足

靜圖不能證明手勢、命令安全或實體手機手感。展開快捷的視覺證據來自戰鬥橫向；其他頁面快捷及滿額提示行為由領導測試證據驗收。本線僅寫spec與本REPORT，未改產品、未commit/push。

# 需要決定

無使用者待決，無圖審阻擋。領導依母交接完成剩餘測試與收線。

追加唯讀診斷規劃：親讀母brief、gestures／shortcuts REPORT與當前battle e2e，已以原生訊息交付最多6格矩陣：A引用現況最小陰性，B確認current fulltrace可重現陽性才續C–F；四格各對B獨立移除hit-test、snapshot clone、microtask、node metadata觀測組，保留原生trusted click／cursor／audit驗收。B陰性或不穩定即停，任何必要性結果不當作根因或修復證明，充分性實驗須下一輪授權。未改產品、測試或啟runner，完整矩陣留領導原生訊息。

替代事件契約（待裁決）：建議主線裁決後採touch單一tap解譯器，不等click缺失才補送。兩圖只管圖面，排除按鈕/選單/輸入/連結/縮圖；mouse與鍵盤維持原路徑。有效touch pointerup未達8px時，用up真命中格送clickCell/mapCursor一次；overview沿worldMapContentRect扣留白。拖曳/cancel/lost capture/多指/hidden/zoom/resize/切圖失效，不啟用。同手勢native click/dblclick於capture按pointer身分配對吞掉，不全域限時禁點、不吞下次tap或鍵盤。世界touch雙點不航行，保留航按鈕。真CDP測試改驗格座標/控制器啟用恰一次、audit不多送；補有/無後續native click、連點、取消後tap及overview。風險是延遲click配對與輸入分流，須DOM反例及真瀏覽器驗；未裁決不改產品，不宣稱原click根因已解。

全頁事件架構追加：已親讀當前helper、兩圖/render/controller、shell/快捷/營運與百科click入口及兩同向拖最小案；向領導提交全應用touch啟用broker方案，保留mouse/keyboard/輔具語意、完整控制註冊、拒重與失效規則。此為待裁決架構替代，不聲稱根因已解；未改產品或啟runner。
