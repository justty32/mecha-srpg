# lead-tidy-mech-1027 — 收尾報告

## 做了什麼

依互斥寫集派三位原生工人：新原型、舊 SVG 試作、wf 活文件。只拆責任與展開長行；64 獨立 SVG、機甲設計資料、舊美術來源與遊戲 `src/content/spec/legacy` 未改。主線固定基線並統一跑正式 headless、影像對比、連結與精確提交。基線 `f494406d`；交接來源 `d82a7db2`、實作與活入口 `8e215b25` 均已普通 push。

## 檔案職責與行數

新原型 `layout.ts` 173→265 行，保留配置／工作單協調；分配、驗證、動作、畫序、遮擋移至五份 `layout-*.ts`（53–91 行）。`geometry.ts` 180→197 行保留區域運算，嚴格 SVG parser 到 `svg-geometry.ts` 226 行；單件檢查到 `attachment-validation.ts` 88 行。`viewer.js` 59→152 行保留啟動，繪圖／控制／診斷至 `viewer/` 三檔；`verify.ts` 57→271、`headless.mjs` 65→258 行展開，容量核算到 `headless-budget.mjs` 44 行。`style.css` 3→257 行，響應式 44 行在 `style-responsive.css`，建置仍原序內嵌。

舊試作 `check-tree.cjs` 363→86 行，XML、DOM、演出、離線檢查到 `checks/`（21–151 行）。原 `style.css` 357 行保留生成檔例外；`styles/` 三份手寫來源 85–170 行，由 `rebuild.py` 225→229 行原序合併，生成 CSS 與基線逐位元相同。`demo.js` 238 行不拆，職責集中且未見具體拆分收益。

wf `STATE.md` 8210→363 bytes、`user.md` 7391→1725 bytes，原路徑作入口；續行在 `state/` 與 `user/`，有各自 README。已完成交付清單完整移至 `state/archive/history.md`，活導航只留 open 與必要背景；done 索引是現行收線入口。活狀態校正使用者已在家、`lead-small/report.md` 實體可見但只是暫停時快照；世界觀整合、四條舊線收線、主觀美術評閱均仍 pending。`code-map.md` 同步新職責。

## 驗證與差異判斷

- before/after 核心 `node --test art/mech-blueprint/blueprint.test.ts` 皆 12／12；兩個原型 build 皆 64 工作單／64 parsed、0 錯、12 動作段／253 採樣／0 失敗；原型 `tsc --noEmit -p` exit 0，`verify.ts` 與 `build-viewer.ts` 另以 strict CLI typecheck exit 0。
- before/after `nice -n 19 node art/mech-blueprint/headless.mjs` 皆 20／20；正式六張 PNG（bind、skeleton、exploded、raise-arm、bend-elbow、bend-knee）與 before `cmp` 全部逐位元相同，故無新影像差異需目視判讀。file 頁仍僅一個 document 請求、零 pageerror。`interaction.json` 僅時間、動畫進度與來源容量數更新；來源容量 4,302,410 bytes、7 PNG，仍在原上限內。
- 64 `parts/*.svg`＋7 `data/*.json` 共71資產逐檔 SHA-256 同基線。6份生成 JSON/SVG（layout、work-orders、validation、assembled、exploded、viewer-data）逐位元相同；`index.html` bytes 因內嵌 JS/CSS 排版改變，正式互動與六圖證實可觀察行為同基線。舊試作雙階段 `check-tree.cjs` before/after PASS，142／140／140 葉、深度 5；`--reject-fixture` exit 1；`rebuild.py --mech-only` exit 0，三張 bulwark SVG、index.html 與生成 style.css 逐位元同基線。
- `bash wf/tools/wf-lint.sh --strict .`：broken／oversize／biglist／residue 均 0；`git diff --check` 為 0。已核 source與target有 README、原公開 CLI 及 file index 仍在，六類搬移斷裂與 `fix_moved_links.py` dry-run 於歸檔時補核。

## 界線與風險

未做遊戲整包 npm suite、fuzz、sim 或戰役黃金；沒有遊戲源碼改動，本次局部驗證不能代表待辦的整合驗收。未接 Spine、未新畫美術、未開始世界觀驗收。舊 SVG 的真瀏覽器布局／鍵盤／動畫、兩版畫風與新機甲手感仍待使用者評閱。舊四線的 worktree、inbox、未追蹤報告與 logs 保留，不判完成、不納本線提交。

## 收線記錄

本線實質 60 檔（4 交接＋56 實作／文件／子報告）已提交，`git diff --binary f494406d 8e215b25` 為318,926 bytes，低於80檔／10MB gate。歸檔搬移表見 [moves.tsv](moves.tsv)；本段待最終歸檔與 push 後補 commit、連結掃描、背景程序及活條目清理證據。
