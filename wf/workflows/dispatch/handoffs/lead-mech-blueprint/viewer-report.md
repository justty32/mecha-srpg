# viewer 線回報

## 做了什麼

完成純函式SVG組裝與可file開啟的自含頁面，配置／組裝／分件三模式、三級語意樹顯隱、solo／restore、選件原點／接點、骨架／包絡／21點掃掠、六動作播放暫停／scrub／bind及減少動態。runtime沿用核心rig.ts，世界矩陣扁平呈現；頁端不帶overlaps與design大種子。分件static/runtime共用按viewBox等比置中的矩陣，無rig旋轉；配置與組裝同樣沿祖先hidden／solo傳遞。

verify實讀SVG描邊與形狀，核對版本／包絡／keepOut／occupancy／接點；姿態先bounds篩選再做有界投影交集，overlaps只讀核心。工作單mount與跨骨targetBone／targetAt分別比對世界接點。紅區保留首個失敗sample及實際ID；曾以八種錯誤輸入、錯跨骨目標與錯mount確認會變紅，沒有自行放寬投影例外。

## 產出

正式blueprint-4、64／64附件版本一致，sourceHash為56f22cc1ef0e8ddadfb3510c05cf5e6261daa249ff97b1c3d7fdf5eab9cd889a。依領導序列排程執行nice -n19 build-viewer exit0：64 parsed、12方向段各21點加bind共253次姿態檢查，0診斷／0 sampleFailures。生成入口index.html、assembled.svg、exploded.svg、validation.json與viewer-data.json已更新，全部真相來自原型內data／parts／程式，不依賴wf規劃、交接暫存或/tmp。

最後重跑完成於2026-10-27 20:25（Asia/Taipei）：主美術只把pelvis-frame腰軸可視承力帶20→21.6 units並重parse64 metadata，維持rev4。本線重新序列build-viewer→正式headless，兩步皆exit0，64 parsed／253檢查／0診斷／0 sampleFailures。六正式PNG及interaction已覆寫，finished為2026-10-27T12:25:02.854Z；新版bind腰軸及三動作已重新親看，可見暗色承力帶，未見新紅區／裁切／明顯斷鏈。最新HTML 299,366 bytes，viewer-data 279,684 bytes。正式nice headless exit0，20 checks全過，interaction為mode:full／completeAcceptance:true。初始即assembled與64掛件，沒有PARTIAL／施工／未完成／缺件標記；三模式、實際分件BBox格內置中、三級顯隱、配置ancestor／solo／restore、選件、疊圖、左右六動作／scrub／reduced-motion、bind與播放暫停皆實際操作。SVG視覺深度4；0pageerror，只有file文件本身1次請求，沒有fetch或外網資源。

六張正式PNG位於art/mech-blueprint/evidence：bind.png、skeleton.png、exploded.png、raise-arm.png、bend-elbow.png、bend-knee.png。皆已用view_image親看：全機、細頸至胸與髖部暗機構可辨；骨架疊圖可核對支點；分件未跨格或裁頂；三動作在畫布內、沒有紅區。interaction.json記錄20項操作、來源hash／revision、六圖清單與預算。舊partial.png保留歷史，合計7張PNG。最新本線strict＋noUncheckedIndexedAccess與兩份JS語法均exit0。

## 沒做到／證據不足

沒有本原型固定驗收尚缺的項目。造型品質與是否符合使用者美術期待仍需使用者評閱；固定視角剛性2D、六路徑21點的通過不等於任意角度、3D碰撞、步行或Spine格式匯出已驗。沒有新增依賴、下載、GUI、桌面或遊戲接線。

## 需要決定的事

本線沒有待裁決的幾何／UI紅燈。rev3唯一極小投影紅由核心定位為凸包浮點計算缺陷並修正升rev4，未加viewer側projection豁免；最後整合全綠。提交／push與專案總驗收由領導處理，本線未commit／push。

本線共22檔、4,295,038 bytes，含7PNG與本REPORT，低於23檔／5MB。沒有未收工背景程序。以後交接書應點名原生agent通訊、node、TypeScript CLI（--ignoreConfig --types node）、stripTypeScriptTypes／vm.Script、既有Playwright headless、view_image與git status；重負載須領導排程、nice -n19序列執行。
