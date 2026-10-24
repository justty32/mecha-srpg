import test from "node:test";
import assert from "node:assert/strict";
import { extractLinkTargets, parseMarkdown, plainText } from "./markdown.ts";
import type { EntryRef, MdBlock, MdInline } from "./types.ts";

const text = (v: string): MdInline => ({ t: "text", v });
const paragraph = (v: string): MdBlock => ({ t: "p", c: [text(v)] });
const ref: EntryRef = { raw: "faction/moon", target: "lore:faction/moon", label: "月面勢力", field: "body" };

test("標題一至六級、段落合併與明確換行", () => {
  const source = Array.from({ length: 6 }, (_, i) => `${"#".repeat(i + 1)} 標題${i + 1}`).join("\n");
  assert.deepEqual(parseMarkdown(source), Array.from({ length: 6 }, (_, i) => ({ t: "h", level: i + 1, c: [text(`標題${i + 1}`)] })));
  assert.deepEqual(parseMarkdown("第一行\n第二行\n\n另一段"), [paragraph("第一行 第二行"), paragraph("另一段")]);
  assert.deepEqual(parseMarkdown("甲  \n乙\\\n丙"), [{ t: "p", c: [text("甲"), { t: "br" }, text("乙"), { t: "br" }, text("丙")] }]);
  assert.deepEqual(parseMarkdown("\r\n# 標題\r\n\r\n正文\r\n"), [{ t: "h", level: 1, c: [text("標題")] }, paragraph("正文")]);
});

test("粗斜體、行內碼與巢狀，保留字內底線", () => {
  assert.deepEqual(parseMarkdown("**粗*斜*粗** __粗__ *斜* _斜_ `**碼**` snake_case snake__case"), [{
    t: "p", c: [
      { t: "strong", c: [text("粗"), { t: "em", c: [text("斜")] }, text("粗")] }, text(" "),
      { t: "strong", c: [text("粗")] }, text(" "), { t: "em", c: [text("斜")] }, text(" "),
      { t: "em", c: [text("斜")] }, text(" "), { t: "code", v: "**碼**" }, text(" snake_case snake__case"),
    ],
  }]);
});

test("跳脫與未閉合標記當文字", () => {
  assert.deepEqual(parseMarkdown("\\*字\\* \\_字\\_ **未閉 [未閉 `未閉"), [paragraph("*字* _字_ **未閉 [未閉 `未閉")]);
  assert.deepEqual(parseMarkdown("**未閉"), [paragraph("**未閉")]);
  assert.deepEqual(parseMarkdown("[字](未閉"), [paragraph("[字](未閉")]);
  assert.deepEqual(parseMarkdown(""), []);
});

test("無序、有序清單與二至四格縮排巢狀", () => {
  assert.deepEqual(parseMarkdown("- 甲\n  - 子甲\n  + 子乙\n* 乙\n+ 丙\n\n1. 一\n    1. 子一\n    2. 子二\n2. 二"), [
    { t: "ul", items: [[paragraph("甲"), { t: "ul", items: [[paragraph("子甲")], [paragraph("子乙")]] }], [paragraph("乙")], [paragraph("丙")]] },
    { t: "ol", items: [[paragraph("一"), { t: "ol", items: [[paragraph("子一")], [paragraph("子二")]] }], [paragraph("二")]] },
  ]);
  assert.deepEqual(parseMarkdown("- 母\n   1. 子\n\n正文"), [
    { t: "ul", items: [[paragraph("母"), { t: "ol", items: [[paragraph("子")]] }]] }, paragraph("正文"),
  ]);
});

test("內部連結解析、未知目標降級與 wiki 預設名稱", () => {
  const seen: string[] = [];
  const resolve = (raw: string): EntryRef | undefined => { seen.push(raw); return raw === ref.raw ? ref : undefined; };
  assert.deepEqual(parseMarkdown("[盟友](faction/moon) [無](missing) [[faction/moon]] [[faction/moon|月]] [[missing]]", resolve), [{
    t: "p", c: [
      { t: "link", ref, c: [text("盟友")] }, text(" 無 "), { t: "link", ref, c: [text("月面勢力")] },
      text(" "), { t: "link", ref, c: [text("月")] }, text(" missing"),
    ],
  }]);
  assert.deepEqual(seen, [ref.raw, "missing", ref.raw, ref.raw, "missing"]);
  assert.deepEqual(parseMarkdown("[[faction/moon]] [月](faction/moon)"), [{ t: "p", c: [
    { t: "link", ref: { ...ref, target: null, label: ref.raw }, c: [text(ref.raw)] }, text(" "),
    { t: "link", ref: { ...ref, target: null, label: "月" }, c: [text("月")] },
  ] }]);
  const packed = { ...ref, raw: "base:faction/moon", target: "base:faction/moon" };
  assert.deepEqual(parseMarkdown("[月](base:faction/moon)", raw => raw === packed.raw ? packed : undefined), [
    { t: "p", c: [{ t: "link", ref: packed, c: [text("月")] }] },
  ]);
});

test("僅 http(s) 產生外部連結，其他 scheme 留文字", () => {
  assert.deepEqual(parseMarkdown("[甲](http://example.com) [乙](https://example.com/a(b)) [惡](javascript:alert(1)) [資料](data:text/html,evil) [信](mailto:a@b)", () => {
    assert.fail("外部或禁止的 scheme 不應呼叫 resolver");
  }), [{ t: "p", c: [
    { t: "extlink", href: "http://example.com", c: [text("甲")] }, text(" "),
    { t: "extlink", href: "https://example.com/a(b)", c: [text("乙")] }, text(" 惡 資料 信"),
  ] }]);
});

test("表格的表頭、對齊與不齊欄位正規化", () => {
  assert.deepEqual(parseMarkdown("| 名 | 左 | 中 | 右 |\n| --- | :--- | :--: | ---: |\n| **甲** | 一 |\n| 乙 | 二 | 三 | 四 | 多餘 |"), [{
    t: "table", head: [[text("名")], [text("左")], [text("中")], [text("右")]],
    align: [null, "left", "center", "right"], rows: [
      [[{ t: "strong", c: [text("甲")] }], [text("一")], [], []],
      [[text("乙")], [text("二")], [text("三")], [text("四")]],
    ],
  }]);
  assert.deepEqual(parseMarkdown("甲 | 乙\n--- | ---\na\\|b | `c|d`"), [{
    t: "table", head: [[text("甲")], [text("乙")]], align: [null, null], rows: [[[text("a|b")], [{ t: "code", v: "c|d" }]]],
  }]);
});

test("引用內清單及巢狀引用、原樣程式碼塊、分隔線", () => {
  assert.deepEqual(parseMarkdown("> 引文\n>\n> - 子項\n>\n> > 內引\n\n```ts\n  **不解析**\n<script>x</script>\n\n```\n---\n***"), [
    { t: "quote", c: [paragraph("引文"), { t: "ul", items: [[paragraph("子項")]] }, { t: "quote", c: [paragraph("內引")] }] },
    { t: "pre", v: "  **不解析**\n<script>x</script>\n" }, { t: "hr" }, { t: "hr" },
  ]);
  assert.deepEqual(parseMarkdown("```\n**未閉圍欄"), [{ t: "pre", v: "**未閉圍欄" }]);
});

test("原始 HTML 標籤完整保留在文字節點", () => {
  const source = '<script>alert(1)</script> <b>粗字</b> <img src=x onerror="alert(2)">';
  assert.deepEqual(parseMarkdown(source), [paragraph(source)]);
});

test("混合文件的 plainText 與 extractLinkTargets 保留既有行為", () => {
  const source = "# 標題\n\n[甲](faction/a) [[faction/b|乙]] [[faction/c]] [外](https://example.com) [[faction/b]]\n\n- **粗**\n  - *斜*\n\n| 欄 | 值 |\n| --- | --- |\n| 一 | `二` |\n\n> 引用\n\n```\n原樣\n第二行\n```\n---\n尾  \n行";
  assert.equal(plainText(parseMarkdown(source)), "標題\n甲 乙 faction/c 外 faction/b\n粗 斜\n欄 值 一 二\n引用\n原樣\n第二行\n尾 行");
  // 既有掃描先收 wiki 再收 markdown，包含程式碼內字串，並沿用正規式截斷括號的行為。
  assert.deepEqual(extractLinkTargets(source + "\n`[[faction/code]]` [惡](javascript:alert(1)) [甲](faction/a)"),
    ["faction/b", "faction/c", "faction/code", "faction/a", "javascript:alert(1"]);
});
