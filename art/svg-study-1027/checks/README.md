# 離線樹檢查

由上一層 `check-tree.cjs` 統一執行，保留 `--python`、`--xml-json` 與 `--reject-fixture` 入口。

- `tree-xml.py`：真實 XML 引用、深度、輸出葉集合及內容雜湊。
- `tree-dom.cjs`：DOM 替身、複製隔離、可見性與原生控制接線。
- `motion.cjs`：可控時鐘、3600ms 演出與重建歸零反例。
- `offline.cjs`：file 展示嵌入資料、引用與腳本語法。

入口保留語意樹模型與狀態轉移檢查；各模組只接收該段需要的測試上下文。DOM 替身不代表瀏覽器目視驗收。
