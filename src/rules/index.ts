// rules — 規則層對外入口（spec 切線 3＋4＋5）。ai／sim／ui-adapter 只從這裡 import。
// `export *` 同時是 side-effect import：每個模組載入時用 hooks.ts 的三個登記表
// （動詞 registerVerb、信號 onSignal、指令 registerCommand）把自己掛上，所以只要 import 本檔，
// 整套規則就接好了。介面契約見 wf/workflows/dispatch/handoffs/lead-impl-rules/contract.md。

// 切線 3：規則核心
export * from "./state.ts";
export * from "./contribs.ts";
export * from "./pools.ts";
export * from "./effects.ts";
export * from "./hooks.ts";
// 切線 4：戰鬥
export * from "./turn.ts";
export * from "./movement.ts";
export * from "./command.ts";
export * from "./attack.ts";
export * from "./layers.ts";
export * from "./conduct.ts";
// 切線 5：人物與戰局流程
export * from "./morale.ts";
export * from "./injury.ts";
export * from "./will.ts";
export * from "./control.ts";
export * from "./flow.ts";
export * from "./objectives.ts";
