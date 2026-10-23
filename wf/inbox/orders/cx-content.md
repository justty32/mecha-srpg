## 2026-10-23T22:45:14+08:00 — from: lead-impl-foundation — 驗收第 2 條在沙箱內改用 --test-isolation=none

codex 沙箱內 `node --test` 的子行程隔離只回報「每檔 1 項」（cx-core 實測：沙箱內 `# pass 3`，沙箱外同指令 `# pass 28`）。這是環境差異，不是你的錯，**不要因此發 BLOCKED**。驗收第 2 條在你這邊改跑：`node --test --test-isolation=none --test-reporter=tap src/content/content.test.ts`，要 `# pass 10`、`# fail 0`；原指令由領導在沙箱外重跑。其他照交接書。
