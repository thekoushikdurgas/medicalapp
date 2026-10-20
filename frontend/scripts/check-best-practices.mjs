#!/usr/bin/env node
/**
 * Next.js & Frontend Best Practices Checker — Pharmacy Fantasy Wholesale App.
 * Evaluates Project Structure, Security, Quality Tooling, Testing, GraphQL Architecture,
 * Styling Standards, and Code Discipline.
 *
 * Usage:
 *   node scripts/check-best-practices.mjs
 *   node scripts/check-best-practices.mjs --threshold 80
 *   node scripts/check-best-practices.mjs --no-fail
 *   node scripts/check-best-practices.mjs --format both --output reports/check_report_bat.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "reports");
const CONFIG_PATH = path.join(ROOT, ".next-checker-config.json");

function parseArgs(argv) {
  const opts = {
    category: null,
    output: null,
    format: "both",
    threshold: 80,
    noFail: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--category" && argv[i + 1]) {
      opts.category = argv[++i];
    } else if (a === "--output" && argv[i + 1]) {
      opts.output = argv[++i];
    } else if (a === "--format" && argv[i + 1]) {
      const f = argv[++i];
      if (["text", "json", "both"].includes(f)) opts.format = f;
    } else if (a === "--threshold" && argv[i + 1]) {
      const n = Number(argv[++i]);
      if (!Number.isNaN(n)) opts.threshold = n;
    } else if (a === "--no-fail") {
      opts.noFail = true;
    }
  }
  return opts;
}

function exists(p) {
  return fs.existsSync(p);
}

function readText(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function walkDir(dir, acc = []) {
  if (!exists(dir)) return acc;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (
        name.name === "node_modules" ||
        name.name === ".next" ||
        name.name === "coverage" ||
        name.name === "dist" ||
        name.name === "out"
      ) {
        continue;
      }
      walkDir(p, acc);
    } else {
      acc.push(p);
    }
  }
  return acc;
}

function walkCodeFiles(subdirs = ["src"]) {
  const exts = new Set([".ts", ".tsx", ".js", ".mjs"]);
  const acc = [];
  for (const sub of subdirs) {
    walkDir(path.join(ROOT, sub), acc);
  }
  return acc.filter((p) => exts.has(path.extname(p)));
}

function runAllChecks() {
  const pkg = readJson(path.join(ROOT, "package.json")) || {};
  const scripts = pkg.scripts || {};
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const results = [];

  function add(point_number, category, description, passed, message) {
    results.push({
      point_number,
      category,
      description,
      passed: Boolean(passed),
      message: String(message),
    });
  }

  // ── 1. Project Structure ────────────────────────────────
  const hasAppRouter =
    exists(path.join(ROOT, "src", "app")) || exists(path.join(ROOT, "app"));
  add(
    1,
    "Project Structure",
    "App Router directory present (src/app or app)",
    hasAppRouter,
    hasAppRouter ? "App Router directory present" : "Missing App Router directory",
  );

  const hasCoreScripts =
    scripts.dev && scripts.build && scripts.lint && scripts.typecheck;
  add(
    2,
    "Project Structure",
    "Essential npm scripts defined (dev, build, lint, typecheck)",
    hasCoreScripts,
    `dev: ${!!scripts.dev}, build: ${!!scripts.build}, lint: ${!!scripts.lint}, typecheck: ${!!scripts.typecheck}`,
  );

  const hasNextConfig =
    exists(path.join(ROOT, "next.config.js")) ||
    exists(path.join(ROOT, "next.config.mjs")) ||
    exists(path.join(ROOT, "next.config.ts"));
  add(
    3,
    "Project Structure",
    "Next.js configuration file exists",
    hasNextConfig,
    hasNextConfig ? "next.config exists" : "next.config missing",
  );

  const hasTsConfig = exists(path.join(ROOT, "tsconfig.json"));
  add(
    4,
    "Project Structure",
    "TypeScript configuration (tsconfig.json) exists",
    hasTsConfig,
    hasTsConfig ? "tsconfig.json present" : "tsconfig.json missing",
  );

  const hasUiDir = exists(path.join(ROOT, "src", "components", "ui"));
  add(
    5,
    "Project Structure",
    "Dedicated UI component library present (src/components/ui)",
    hasUiDir,
    hasUiDir ? "UI directory present" : "src/components/ui missing",
  );

  // ── 2. Security & Secrets ───────────────────────────────
  const codeFiles = walkCodeFiles(["src"]);
  const secretPatterns = [
    { name: "AWS Key", re: /AKIA[0-9A-Z]{16}/ },
    { name: "Private Key", re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
    { name: "GitHub Token", re: /ghp_[0-9a-zA-Z]{36}/ },
  ];
  let secretFound = false;
  let secretDetails = "Clean";
  for (const f of codeFiles) {
    const text = readText(f);
    for (const pat of secretPatterns) {
      if (pat.re.test(text)) {
        secretFound = true;
        secretDetails = `${pat.name} in ${path.relative(ROOT, f)}`;
        break;
      }
    }
    if (secretFound) break;
  }
  add(
    6,
    "Security",
    "No hardcoded API secrets or private keys in source code",
    !secretFound,
    secretDetails,
  );

  const hasAuthGuard =
    exists(path.join(ROOT, "src", "components", "auth-guard.tsx")) ||
    exists(path.join(ROOT, "src", "middleware.ts"));
  add(
    7,
    "Security",
    "Route authentication guard present (auth-guard.tsx or middleware.ts)",
    hasAuthGuard,
    hasAuthGuard ? "Auth guard present" : "Missing authentication protection guard",
  );

  const hasAuthHelpers = exists(path.join(ROOT, "src", "lib", "auth.ts"));
  add(
    8,
    "Security",
    "Centralized auth utilities and role definitions (src/lib/auth.ts)",
    hasAuthHelpers,
    hasAuthHelpers ? "auth.ts present" : "src/lib/auth.ts missing",
  );

  // ── 3. Quality Tooling & Testing ────────────────────────
  const hasVitest =
    Boolean(deps.vitest) ||
    exists(path.join(ROOT, "node_modules", ".bin", "vitest.cmd"));
  add(
    9,
    "Quality Tooling",
    "Modern test runner installed (vitest)",
    hasVitest,
    hasVitest ? "Vitest installed" : "Vitest not installed",
  );

  const hasTestScript = Boolean(scripts.test);
  add(
    10,
    "Quality Tooling",
    "Test runner npm script configured (npm test)",
    hasTestScript,
    hasTestScript ? `npm test: ${scripts.test}` : "npm test missing",
  );

  const hasCoverageScript = Boolean(scripts["test:coverage"]);
  add(
    11,
    "Quality Tooling",
    "Test coverage npm script configured (npm run test:coverage)",
    hasCoverageScript,
    hasCoverageScript ? "Coverage script present" : "test:coverage script missing",
  );

  const testFiles = codeFiles.filter(
    (f) => f.includes(".test.") || f.includes(".spec."),
  );
  add(
    12,
    "Quality Tooling",
    "Unit test suites implemented in src/",
    testFiles.length > 0,
    `${testFiles.length} test suite(s) found`,
  );

  const hasPrettier = Boolean(deps.prettier) && Boolean(scripts.format);
  add(
    13,
    "Quality Tooling",
    "Code formatting configured (prettier + npm run format)",
    hasPrettier,
    hasPrettier ? "Prettier formatting configured" : "Prettier scripts incomplete",
  );

  // ── 4. GraphQL & API Architecture ───────────────────────
  const hasSchemaSnapshot =
    exists(path.join(ROOT, "tests", "schema_snapshot.graphql")) ||
    exists(path.join(ROOT, "..", "backend", "tests", "schema_snapshot.graphql"));
  add(
    14,
    "GraphQL & API Contract",
    "GraphQL schema snapshot committed for offline typecheck & CI",
    hasSchemaSnapshot,
    hasSchemaSnapshot ? "Schema snapshot present" : "tests/schema_snapshot.graphql missing",
  );

  const hasCodegenConfig = exists(path.join(ROOT, "codegen.ts"));
  add(
    15,
    "GraphQL & API Contract",
    "GraphQL Codegen configuration present (codegen.ts)",
    hasCodegenConfig,
    hasCodegenConfig ? "codegen.ts present" : "codegen.ts missing",
  );

  const hasCodegenScripts = Boolean(scripts.codegen);
  add(
    16,
    "GraphQL & API Contract",
    "Codegen npm script present (npm run codegen)",
    hasCodegenScripts,
    hasCodegenScripts ? "npm run codegen present" : "npm run codegen missing",
  );

  const hasGeneratedTypes =
    exists(path.join(ROOT, "src", "graphql", "generated", "types.ts")) &&
    exists(path.join(ROOT, "src", "graphql", "generated", "operations.ts"));
  add(
    17,
    "GraphQL & API Contract",
    "Generated GraphQL TypeScript types and operations emitted",
    hasGeneratedTypes,
    hasGeneratedTypes ? "Generated types and operations present" : "Generated files missing",
  );

  const hasApolloClient = exists(path.join(ROOT, "src", "lib", "apollo-client.ts"));
  add(
    18,
    "GraphQL & API Contract",
    "Apollo Client configured with cache policies (src/lib/apollo-client.ts)",
    hasApolloClient,
    hasApolloClient ? "apollo-client.ts present" : "apollo-client.ts missing",
  );

  // ── 5. Styling & Design System ──────────────────────────
  const hasGlobalsCss = exists(path.join(ROOT, "src", "app", "globals.css"));
  add(
    19,
    "Styling / CSS",
    "Centralized CSS tokens stylesheet present (src/app/globals.css)",
    hasGlobalsCss,
    hasGlobalsCss ? "globals.css present" : "globals.css missing",
  );

  const hasCssInventory =
    exists(path.join(ROOT, "scripts", "css-inventory.mjs")) &&
    Boolean(scripts["css:inventory"]);
  add(
    20,
    "Styling / CSS",
    "Continuous CSS styling inventory tooling configured",
    hasCssInventory,
    hasCssInventory ? "scripts/css-inventory.mjs present" : "css-inventory.mjs missing",
  );

  const hasStyleGuide = exists(path.join(ROOT, "STYLE.md"));
  add(
    21,
    "Styling / CSS",
    "Frontend styling and component guidelines documented (STYLE.md)",
    hasStyleGuide,
    hasStyleGuide ? "STYLE.md present" : "STYLE.md missing",
  );

  // ── 6. Code Architecture & Maintainability ──────────────
  const hasLogger = exists(path.join(ROOT, "src", "lib", "logger.ts"));
  add(
    22,
    "Code Architecture",
    "Centralized frontend logger utility (src/lib/logger.ts)",
    hasLogger,
    hasLogger ? "logger.ts present" : "src/lib/logger.ts missing",
  );

  const hasDomainTypes = exists(path.join(ROOT, "src", "types", "index.ts"));
  add(
    23,
    "Code Architecture",
    "Shared domain interfaces and entity types (src/types/index.ts)",
    hasDomainTypes,
    hasDomainTypes ? "types/index.ts present" : "src/types/index.ts missing",
  );

  const hasDesignDoc = exists(path.join(ROOT, "DESIGN.md"));
  add(
    24,
    "Code Architecture",
    "Architecture and Information Blueprint documented (DESIGN.md)",
    hasDesignDoc,
    hasDesignDoc ? "DESIGN.md present" : "DESIGN.md missing",
  );

  return results;
}

function main() {
  const args = parseArgs(process.argv);
  const results = runAllChecks();

  const filtered = args.category
    ? results.filter((r) =>
        r.category.toLowerCase().includes(args.category.toLowerCase()),
      )
    : results;

  const total = filtered.length;
  const passed = filtered.filter((r) => r.passed).length;
  const failed = total - passed;
  const score = total > 0 ? Math.round((passed / total) * 100) : 100;

  // Group by category
  const categories = {};
  for (const r of filtered) {
    if (!categories[r.category]) {
      categories[r.category] = { total: 0, passed: 0 };
    }
    categories[r.category].total++;
    if (r.passed) categories[r.category].passed++;
  }

  if (args.format === "text" || args.format === "both") {
    console.log("=".repeat(70));
    console.log("Next.js Best Practices Check Summary — Pharmacy Fantasy");
    console.log("=".repeat(70));
    console.log(`Project root: ${ROOT}`);
    console.log(`Total points: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Score: ${score}% (Threshold: ${args.threshold}%)`);
    console.log();

    for (const [cat, stat] of Object.entries(categories)) {
      const pct = Math.round((stat.passed / stat.total) * 100);
      console.log(`${cat}: ${stat.passed}/${stat.total} passed (${pct}%)`);
    }
    console.log();

    if (failed > 0) {
      console.log("Failed Points:");
      for (const r of filtered.filter((x) => !x.passed)) {
        console.log(`  [Point ${r.point_number}] ${r.category}: ${r.description}`);
        console.log(`    Detail: ${r.message}`);
      }
      console.log();
    }

    if (score >= args.threshold) {
      console.log(`OK Codebase meets best practices threshold (${args.threshold}%+)`);
    } else {
      console.log(
        `X Codebase score (${score}%) is below threshold (${args.threshold}%)`,
      );
    }
    console.log();
  }

  // Save JSON report if output specified or format is json/both
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath =
    args.output ||
    path.join(
      REPORTS_DIR,
      `check_report_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
    );

  if (args.format === "json" || args.format === "both") {
    const reportData = {
      project_root: ROOT,
      generated_at: new Date().toISOString(),
      score,
      threshold: args.threshold,
      total_points: total,
      passed_points: passed,
      failed_points: failed,
      categories,
      checks: filtered,
    };
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), "utf8");
    console.log(`Report saved to: ${reportPath}`);
  }

  if (args.noFail) {
    process.exit(0);
  }

  if (score < args.threshold) {
    process.exit(1);
  }
  process.exit(0);
}

main();
