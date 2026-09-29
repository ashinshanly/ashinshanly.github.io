// tests/run_all_suites.mjs
// Master Workspace Test Runner executing all test suites across the portfolio

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function runCommand(command, args) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd: rootDir,
      stdio: "inherit",
      env: process.env
    });

    proc.on("close", (code) => {
      resolve(code === 0);
    });

    proc.on("error", (err) => {
      console.error(`Failed to start command ${command}:`, err);
      resolve(false);
    });
  });
}

async function main() {
  const masterStart = Date.now();

  console.log("\x1b[1m\x1b[35m");
  console.log("================================================================================");
  console.log("             🌌 ASHIN SHANLY PORTFOLIO MASTER TEST RUNNER 🌌                   ");
  console.log("================================================================================");
  console.log("\x1b[0m");

  const suites = [
    {
      name: "PixelHUD 4-Tier Collaborative Matrix Engine Suite",
      runnerPath: path.join(rootDir, "tests/pixel_hud/run_all_tests.mjs")
    },
    {
      name: "PixelHUD Mobile & Desktop Responsive Audit Suite",
      runnerPath: path.join(rootDir, "tests/pixel_hud/responsive_audit.test.mjs")
    },
    {
      name: "Android 3-Screen Mobile Experience 4-Tier Suite",
      runnerPath: path.join(rootDir, "tests/android/run_all_tests.mjs")
    }
  ];

  const results = [];

  for (const suite of suites) {
    console.log(`\x1b[1m\x1b[33m\n[MASTER] Running Suite: ${suite.name}...\x1b[0m\n`);
    const passed = await runCommand("node", [suite.runnerPath]);
    results.push({ name: suite.name, passed });
  }

  const duration = Date.now() - masterStart;

  console.log("\x1b[1m\x1b[35m\n================================================================================");
  console.log("                      MASTER WORKSPACE TEST RESULTS                             ");
  console.log("================================================================================\x1b[0m\n");

  let allPassed = true;
  for (const res of results) {
    const icon = res.passed ? "\x1b[32m✔ PASS\x1b[0m" : "\x1b[31m✖ FAIL\x1b[0m";
    console.log(`  ${icon}  ${res.name}`);
    if (!res.passed) allPassed = false;
  }

  console.log("\n--------------------------------------------------------------------------------");
  if (allPassed) {
    console.log(`\x1b[1m\x1b[32m🎉 ALL SUITES PASSED CLEANLY in ${duration}ms! (100% Green)\x1b[0m\n`);
    process.exit(0);
  } else {
    console.log(`\x1b[1m\x1b[31m💥 ONE OR MORE SUITES FAILED.\x1b[0m\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Master Test Runner Error:", err);
  process.exit(1);
});
