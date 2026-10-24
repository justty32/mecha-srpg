// ui-adapter/vm/wiki/markdown — 最小 markdown → AST（MdBlock[]）。純邏輯；DOM 端用 textContent 畫，不產 HTML 字串。
import type { LinkResolver, MdBlock, MdInline } from "./types.ts";

const WIKILINK = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;
const MDLINK = /\]\(([^)\s]+)\)/g;

/** body 裡所有內部連結目標的原字串（[[x]]、[[x|文字]]、[文字](x)；http(s) 外部連結不收），保持出現順序、去重。 */
export function extractLinkTargets(src: string): string[] {
  const out: string[] = [];
  for (const m of src.matchAll(WIKILINK)) out.push(m[1]!.trim());
  for (const m of src.matchAll(MDLINK)) if (!/^[a-z][a-z0-9+.-]*:\/\//iu.test(m[1]!)) out.push(m[1]!.trim());
  return [...new Set(out)];
}

function appendText(nodes: MdInline[], v: string): void {
  if (!v) return;
  const last = nodes.at(-1);
  if (last?.t === "text") last.v += v;
  else nodes.push({ t: "text", v });
}

const word = (s: string): boolean => /[\p{L}\p{N}_]/u.test(s);

function inline(src: string, resolve?: LinkResolver, depth = 0): MdInline[] {
  // SPEC-GAP：契約未定巢狀上限；超過 64 層退回文字，避免病態輸入耗盡呼叫堆疊。
  if (depth >= 64) return [{ t: "text", v: src }];
  function scan(start: number, stop = "", level = depth): { c: MdInline[]; end: number; closed: boolean } {
    const c: MdInline[] = [];
    let i = start;
    while (i < src.length) {
      if (stop && src.startsWith(stop, i) && !/\s/u.test(src[i - 1] ?? " ")
        && !(stop[0] === "_" && word(src[i - 1] ?? "") && word(src[i + stop.length] ?? ""))) {
        return { c, end: i + stop.length, closed: true };
      }
      const ch = src[i]!;
      if (ch === "\\" && i + 1 < src.length && /[!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~\n]/u.test(src[i + 1]!)) {
        if (src[i + 1] === "\n") c.push({ t: "br" });
        else appendText(c, src[i + 1]!);
        i += 2;
        continue;
      }
      if (ch === "\n") {
        const last = c.at(-1);
        if (last?.t === "text" && / {2,}$/u.test(last.v)) {
          last.v = last.v.replace(/ +$/u, "");
          c.push({ t: "br" });
        } else appendText(c, " ");
        i++;
        continue;
      }
      if (ch === "`") {
        const end = src.indexOf("`", i + 1);
        if (end !== -1) {
          c.push({ t: "code", v: src.slice(i + 1, end) });
          i = end + 1;
          continue;
        }
      }
      if (ch === "[") {
        let raw: string | undefined;
        let label: string | undefined;
        let end = i;
        if (src.startsWith("[[", i)) {
          const close = src.indexOf("]]", i + 2);
          if (close !== -1) {
            const value = src.slice(i + 2, close);
            const bar = value.indexOf("|");
            raw = (bar < 0 ? value : value.slice(0, bar)).trim();
            label = bar < 0 ? undefined : value.slice(bar + 1);
            end = close + 2;
          }
        } else {
          let close = i + 1;
          for (; close < src.length; close++) {
            if (src[close] === "\\") close++;
            else if (src[close] === "]") break;
          }
          if (src[close + 1] === "(") {
            let balance = 1;
            let cursor = close + 2;
            for (; cursor < src.length; cursor++) {
              if (src[cursor] === "\\") cursor++;
              else if (src[cursor] === "(") balance++;
              else if (src[cursor] === ")" && --balance === 0) break;
            }
            if (balance === 0) {
              raw = src.slice(close + 2, cursor).trim();
              label = src.slice(i + 1, close);
              end = cursor + 1;
            }
          }
        }
        if (raw !== undefined) {
          const external = /^https?:\/\//iu.test(raw);
          // SPEC-GAP：pack:kind/name 同時像 scheme；依凍結型別保留 pack 引用，危險 scheme 永不送 resolver。
          const packedId = /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9._-]*$/u.test(raw)
            && !/^(?:javascript|data|vbscript):/iu.test(raw);
          const blocked = /^[a-z][a-z0-9+.-]*:/iu.test(raw) && !packedId;
          if (external) c.push({ t: "extlink", href: raw, c: inline(label ?? raw, resolve, level + 1) });
          else if (blocked) appendText(c, label ?? raw);
          else {
            const ref = resolve ? resolve(raw) : { raw, target: null, label: label ?? raw, field: "body" };
            if (ref) c.push({ t: "link", ref, c: inline(label ?? ref.label, resolve, level + 1) });
            else appendText(c, label ?? raw);
          }
          i = end;
          continue;
        }
      }
      if ((ch === "*" || ch === "_") && level < 64) {
        const marker = src[i + 1] === ch ? ch + ch : ch;
        const next = src[i + marker.length] ?? "";
        if (next && !/\s/u.test(next) && !(ch === "_" && word(src[i - 1] ?? "") && word(next))) {
          const nested = scan(i + marker.length, marker, level + 1);
          if (nested.closed) {
            c.push({ t: marker.length === 2 ? "strong" : "em", c: nested.c });
            i = nested.end;
            continue;
          }
        }
        appendText(c, marker);
        i += marker.length;
        continue;
      }
      appendText(c, ch);
      i++;
    }
    return { c, end: i, closed: false };
  }
  return scan(0).c;
}

const heading = /^( {0,3})(#{1,6})(?:[ \t]+|$)(.*)$/u;
const fence = /^ {0,3}(`{3,})[^`]*$/u;
const rule = /^ {0,3}(?:-{3,}|\*{3,})[ \t]*$/u;
const quote = /^ {0,3}>[ \t]?/u;
const listItem = /^( *)([-+*]|\d+\.)(?:[ \t]+(.*)|$)/u;

function cells(line: string): string[] {
  const parts: string[] = [];
  let value = "";
  let code = false;
  const input = line.trim();
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    if (ch === "\\" && i + 1 < input.length) value += ch + input[++i]!;
    else if (ch === "`") { code = !code; value += ch; }
    else if (ch === "|" && !code) { parts.push(value.trim()); value = ""; }
    else value += ch;
  }
  parts.push(value.trim());
  if (input.startsWith("|")) parts.shift();
  if (input.endsWith("|") && parts.at(-1) === "") parts.pop();
  return parts;
}

function tableAlign(line: string): ("left" | "center" | "right" | null)[] | undefined {
  const values = cells(line);
  if (!line.includes("|") || !values.length || !values.every(v => /^:?-{2,}:?$/u.test(v))) return undefined;
  return values.map(v => v.startsWith(":") ? v.endsWith(":") ? "center" : "left" : v.endsWith(":") ? "right" : null);
}

function blocks(lines: string[], resolve?: LinkResolver, depth = 0): MdBlock[] {
  if (depth >= 64) return [{ t: "p", c: [{ t: "text", v: lines.join("\n") }] }];
  const out: MdBlock[] = [];
  const startsBlock = (i: number): boolean => {
    const line = lines[i] ?? "";
    return heading.test(line) || fence.test(line) || rule.test(line) || quote.test(line) || listItem.test(line)
      || (line.includes("|") && tableAlign(lines[i + 1] ?? "") !== undefined);
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) { i++; continue; }
    const opening = fence.exec(line);
    if (opening) {
      const content: string[] = [];
      i++;
      const closing = new RegExp(`^ {0,3}\x60{${opening[1]!.length},}[ \\t]*$`, "u");
      while (i < lines.length && !closing.test(lines[i]!)) content.push(lines[i++]!);
      if (i < lines.length) i++;
      out.push({ t: "pre", v: content.join("\n") });
      continue;
    }
    const title = heading.exec(line);
    if (title) {
      out.push({ t: "h", level: title[2]!.length as 1 | 2 | 3 | 4 | 5 | 6,
        c: inline(title[3]!.replace(/[ \t]+#+[ \t]*$/u, "").trim(), resolve) });
      i++;
      continue;
    }
    if (rule.test(line)) { out.push({ t: "hr" }); i++; continue; }
    if (quote.test(line)) {
      const content: string[] = [];
      while (i < lines.length && quote.test(lines[i]!)) content.push(lines[i++]!.replace(quote, ""));
      out.push({ t: "quote", c: blocks(content, resolve, depth + 1) });
      continue;
    }
    const first = listItem.exec(line);
    if (first) {
      const indent = first[1]!.length;
      const ordered = /^\d/u.test(first[2]!);
      const items: MdBlock[][] = [];
      while (i < lines.length) {
        const item = listItem.exec(lines[i]!);
        if (!item || item[1]!.length !== indent || /^\d/u.test(item[2]!) !== ordered || rule.test(lines[i]!)) break;
        const content = [item[3] ?? ""];
        i++;
        let continuationIndent: number | undefined;
        while (i < lines.length) {
          const next = lines[i]!;
          if (!next.trim()) {
            let after = i + 1;
            while (after < lines.length && !lines[after]!.trim()) after++;
            if (after >= lines.length || /^ */u.exec(lines[after]!)![0].length <= indent) break;
            content.push(""); i++; continue;
          }
          const spaces = /^ */u.exec(next)![0].length;
          if (spaces < indent + 2) break;
          continuationIndent ??= spaces;
          content.push(next.slice(Math.min(spaces, continuationIndent)));
          i++;
        }
        items.push(blocks(content, resolve, depth + 1));
        while (i < lines.length && !lines[i]!.trim()) i++;
      }
      out.push({ t: ordered ? "ol" : "ul", items });
      continue;
    }
    const align = line.includes("|") ? tableAlign(lines[i + 1] ?? "") : undefined;
    if (align) {
      const head = cells(line).map(v => inline(v, resolve));
      // SPEC-GAP：以表頭欄數為準；短列補空 cell、長列截斷、缺的對齊值用 null。
      const normalizedAlign = head.map((_, column) => align[column] ?? null);
      const rows: MdInline[][][] = [];
      i += 2;
      while (i < lines.length && lines[i]!.trim() && lines[i]!.includes("|") && !heading.test(lines[i]!)
        && !quote.test(lines[i]!) && !fence.test(lines[i]!)) {
        const row = cells(lines[i++]!);
        rows.push(head.map((_, column) => inline(row[column] ?? "", resolve)));
      }
      out.push({ t: "table", head, align: normalizedAlign, rows });
      continue;
    }
    const paragraph = [line.trimStart()];
    i++;
    while (i < lines.length && lines[i]!.trim() && !startsBlock(i)) paragraph.push(lines[i++]!.trimStart());
    out.push({ t: "p", c: inline(paragraph.join("\n").trimEnd(), resolve) });
  }
  return out;
}

/** 百科最小 markdown 子集；HTML 始終是文字，只有 AST 節點帶呈現語意。 */
export function parseMarkdown(src: string, resolve?: LinkResolver): MdBlock[] {
  return blocks(src.split(/\r\n|\n|\r/u), resolve);
}

/** AST 轉純文字（搜尋摘要用）。 */
export function plainText(blocks: MdBlock[]): string {
  const inl = (c: MdInline[]): string => c.map(i => "v" in i ? i.v : "c" in i ? inl(i.c) : i.t === "br" ? " " : "").join("");
  const blk = (b: MdBlock): string => {
    switch (b.t) {
      case "h": case "p": return inl(b.c);
      case "ul": case "ol": return b.items.map(it => it.map(blk).join(" ")).join(" ");
      case "table": return [...b.head, ...b.rows.flat()].map(inl).join(" ");
      case "quote": return b.c.map(blk).join(" ");
      case "pre": return b.v;
      case "hr": return "";
    }
  };
  return blocks.map(blk).filter(Boolean).join("\n");
}
