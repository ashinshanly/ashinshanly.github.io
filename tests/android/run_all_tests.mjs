// tests/android/run_all_tests.mjs
// Master Ultra-Fast Test Runner for Android 4-Tier Test Suite

import { defaultRunner } from "./helpers/test_framework.mjs";

async function main() {
  const startTime = Date.now();

  console.log("\x1b[1m\x1b[36m");
  console.log("================================================================================");
  console.log("             📱 ANDROID 3-SCREEN MOBILE 4-TIER TEST SUITE RUNNER 📱             ");
  console.log("================================================================================");
  console.log("\x1b[0m");

  const tiers = [
    { name: "Tier 1: Feature Isolation (15 Features)", file: "./tier1_features.test.mjs" },
    { name: "Tier 2: Boundary Value Analysis (BVA)", file: "./tier2_boundaries.test.mjs" },
    { name: "Tier 3: Pairwise Combinatorial Integration", file: "./tier3_pairwise.test.mjs" },
    { name: "Tier 4: Real-World Multi-Screen Workloads", file: "./tier4_realworld.test.mjs" }
  ];

  const tierSummaries = [];
  let grandTotalTests = 0;
  let grandPassedTests = 0;
  let grandFailedTests = 0;
  let grandTotalAssertions = 0;
  let grandPassedAssertions = 0;
  const allFailures = [];

  for (const tier of tiers) {
    console.log(`\x1b[1m\x1b[34m\n>>> EXECUTING ${tier.name}...\x1b[0m`);
    defaultRunner.reset();
    await import(tier.file + "?t=" + Date.now());
    const res = await defaultRunner.run(true);

    tierSummaries.push({
      name: tier.name,
      tests: res.totalTests,
      passed: res.passedTests,
      failed: res.failedTests,
      assertions: res.totalAssertions,
      durationMs: res.durationMs
    });

    grandTotalTests += res.totalTests;
    grandPassedTests += res.passedTests;
    grandFailedTests += res.failedTests;
    grandTotalAssertions += res.totalAssertions;
    grandPassedAssertions += res.passedAssertions;

    if (res.failures.length > 0) {
      allFailures.push(...res.failures);
    }
  }

  const totalDuration = Date.now() - startTime;

  console.log("\x1b[1m\x1b[36m\n================================================================================");
  console.log("                        FINAL ANDROID TEST EXECUTION SUMMARY                    ");
  console.log("================================================================================\x1b[0m\n");

  console.log("┌──────────────────────────────────────────────┬────────┬────────┬────────┬─────────────┬───────────┐");
  console.log("│ Test Tier                                    │ Tests  │ Passed │ Failed │ Assertions  │ Time (ms) │");
  console.log("├──────────────────────────────────────────────┼────────┼────────┼────────┼─────────────┼───────────┤");

  for (const t of tierSummaries) {
    const namePadded = t.name.padEnd(44);
    const testsPadded = String(t.tests).padStart(6);
    const passedPadded = String(t.passed).padStart(6);
    const failedPadded = String(t.failed).padStart(6);
    const assertPadded = String(t.assertions).padStart(11);
    const timePadded = String(t.durationMs).padStart(9);
    const statusColor = t.failed === 0 ? "\x1b[32m" : "\x1b[31m";

    console.log(`│ ${namePadded} │ ${testsPadded} │ ${statusColor}${passedPadded}\x1b[0m │ ${statusColor}${failedPadded}\x1b[0m │ ${assertPadded} │ ${timePadded} │`);
  }

  console.log("├──────────────────────────────────────────────┼────────┼────────┼────────┼─────────────┼───────────┤");
  const totalName = "TOTAL (All 4 Android Tiers)".padEnd(44);
  const totalTestsPadded = String(grandTotalTests).padStart(6);
  const totalPassedPadded = String(grandPassedTests).padStart(6);
  const totalFailedPadded = String(grandFailedTests).padStart(6);
  const totalAssertPadded = String(grandTotalAssertions).padStart(11);
  const totalTimePadded = String(totalDuration).padStart(9);

  console.log(`│ \x1b[1m${totalName}\x1b[0m │ \x1b[1m${totalTestsPadded}\x1b[0m │ \x1b[1m\x1b[32m${totalPassedPadded}\x1b[0m │ \x1b[1m${grandFailedTests === 0 ? "\x1b[32m" : "\x1b[31m"}${totalFailedPadded}\x1b[0m │ \x1b[1m${totalAssertPadded}\x1b[0m │ \x1b[1m${totalTimePadded}\x1b[0m │`);
  console.log("└──────────────────────────────────────────────┴────────┴────────┴────────┴─────────────┴───────────┘\n");

  if (grandFailedTests > 0) {
    console.log("\x1b[1m\x1b[31m💥 ANDROID TEST SUITE FAILED with " + grandFailedTests + " failures.\x1b[0m");
    for (const f of allFailures) {
      console.log(`  - [${f.suite}] ${f.test}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log("\x1b[1m\x1b[32m✨ ALL 4 ANDROID TIERS PASSED PERFECTLY! (100% Success Rate)\x1b[0m");
    console.log(`\x1b[90mExecuted ${grandTotalTests} tests and ${grandTotalAssertions} assertions in ${totalDuration}ms.\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("FATAL ANDROID TEST RUNNER ERROR:", err);
  process.exit(1);
});
