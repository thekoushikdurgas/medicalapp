#!/usr/bin/env node
/**
 * CSS inventory (MVP) — Pharmacy Fantasy Wholesale Management UI.
 * Scans globals.css import graph, .css files, inline styles in TSX/JSX, hardcoded hex.
 * Output: reports/css-inventory.txt + stdout
 *
 * Usage: node scripts/css-inventory.mjs
 * Env:
 *   CSS_INLINE_SRC_MAX     Fail (exit 1) if src/ React style={{ lines exceed this (default 1600)
 *   CSS_INVENTORY_NO_FAIL  Set to 1 to always exit 0 (report only)
 *   STRICT_CSS_AUDIT       Set to 1 to fail on layout-ish inline styles
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_FILE = path.join(REPORT_DIR, "css-inventory.txt");
const STYLE_MD = path.join(ROOT, "STYLE.md");
const DESIGN_MD = path.join(ROOT, "DESIGN.md");

const INLINE_SRC_MAX = Number.parseInt(process.env.CSS_INLINE_SRC_MAX || "1600", 10);
const NO_FAIL = process.env.CSS_INVENTORY_NO_FAIL === "1";
const STRICT_AUDIT = process.env.STRICT_CSS_AUDIT === "1";

const lines = [];
let exitCode = 0;

function out(s = "") {
  lines.push(s);
  console.log(s);
}

function warn(msg) {
  out(`  ! ${msg}`);
  if (STRICT_AUDIT) {
    exitCode = 1;
  }
}

function fail(msg) {
  out(`  ! ${msg}`);
  exitCode = 1;
}

function walkDir(dir, filterExt, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "node_modules" || name.name === ".next") continue;
      walkDir(p, filterExt, acc);
    } else if (filterExt.some((e) => name.name.endsWith(e))) {
      acc.push(p);
    }
  }
  return acc;
}

function read(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function pkgTailwindHints(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return Object.keys(deps || {})
    .filter(
      (k) =>
        k.includes("tailwind") ||
        k === "postcss" ||
        k === "autoprefixer" ||
        k.startsWith("@tailwindcss/"),
    )
    .sort();
}

function findConfigFiles() {
  const names = [
    "tailwind.config.js",
    "tailwind.config.ts",
    "tailwind.config.mjs",
    "postcss.config.js",
    "postcss.config.mjs",
    "postcss.config.cjs",
  ];
  return names.map((n) => path.join(ROOT, n)).filter((p) => fs.existsSync(p));
}

function collectImportsFromFile(filePath) {
  const text = read(filePath);
  const imports = [];
  const re = /@import\s+["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1];
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      imports.push({ type: "external-url", spec: raw, from: filePath });
      continue;
    }
    const resolved = path.normalize(
      path.join(path.dirname(filePath), raw.split("?")[0]),
    );
    imports.push({ type: "relative", spec: raw, resolved, from: filePath });
  }
  return imports;
}

function flattenImportTree(entryCss) {
  const result = [];
  const seen = new Set();
  const queue = [path.resolve(entryCss)];
  while (queue.length) {
    const filePath = queue.shift();
    if (!filePath || seen.has(filePath)) continue;
    seen.add(filePath);
    for (const im of collectImportsFromFile(filePath)) {
      result.push(im);
      if (im.type === "relative" && im.resolved?.endsWith(".css")) {
        const r = im.resolved;
        if (fs.existsSync(r) && !seen.has(r)) queue.push(r);
      }
    }
  }
  return result;
}

function scanInlineStyles(files) {
  const styleReact = /\bstyle\s*=\s*\{/;
  const styleHtml = /\bstyle\s*=\s*["']/;
  const perFile = [];
  let totalReact = 0;
  let totalHtml = 0;

  for (const file of files) {
    const text = read(file);
    const rel = path.relative(ROOT, file);
    let nReact = 0;
    let nHtml = 0;
    const hitLines = [];

    text.split("\n").forEach((line, i) => {
      if (styleReact.test(line)) {
        nReact++;
        hitLines.push(i + 1);
      } else if (styleHtml.test(line)) {
        nHtml++;
        hitLines.push(i + 1);
      }
    });

    if (nReact > 0 || nHtml > 0) {
      totalReact += nReact;
      totalHtml += nHtml;
      perFile.push({
        file: rel.replace(/\\/g, "/"),
        reactInlineBlocks: nReact,
        htmlInlineAttrs: nHtml,
        lines: [...new Set(hitLines)].slice(0, 40),
      });
    }
  }

  perFile.sort((a, b) => b.reactInlineBlocks - a.reactInlineBlocks);
  return { perFile, totalReact, totalHtml };
}

/** Classify React style={{ lines as likely dynamic vs layout-ish. */
function classifyInlineStyles(files) {
  let dynamic = 0;
  let cssVarBridge = 0;
  let layoutish = 0;
  const dynamicFiles = new Map();

  const dynamicRe =
    /\$\{|width:\s*[`'"]|height:\s*[`'"]|--[\w-]+:\s*[`'"]|CSSProperties|activeTab|selected|isOpen|progress|color:\s*[\w.]+\s*\?/;
  const layoutRe =
    /display:|flexDirection:|justifyContent:|alignItems:|padding:|margin:|background:|border:|color:\s*["']#|maxWidth:|fontSize:|gap:/;

  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    for (const line of read(file).split("\n")) {
      if (!/\bstyle\s*=\s*\{/.test(line)) continue;
      if (dynamicRe.test(line)) {
        dynamic++;
        dynamicFiles.set(rel, (dynamicFiles.get(rel) || 0) + 1);
      } else if (/--[\w-]+/.test(line)) {
        cssVarBridge++;
      } else if (layoutRe.test(line)) {
        layoutish++;
      }
    }
  }

  return {
    dynamic,
    cssVarBridge,
    layoutish,
    dynamicFiles: [...dynamicFiles.entries()].sort((a, b) => b[1] - a[1]),
  };
}

function scanHardcodedHex(files) {
  const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
  const perFile = [];

  for (const file of files) {
    const text = read(file);
    const matches = [];
    for (const line of text.split("\n")) {
      // Skip comments, SVG/DOM fragment refs, anchor hrefs, and var() fallbacks — not raw colors.
      if (/^\s*(?:\/\/|\*)/.test(line)) continue;
      if (/href\s*=\s*["']#/.test(line)) continue;
      if (/url\s*\(\s*#/.test(line)) continue;
      if (/(?:closest|querySelector)(?:\?\.)?\(\s*["'`]#/.test(line)) continue;
      const stripped = line.replace(/var\([^)]*,\s*#[0-9a-fA-F]{3,8}\b[^)]*\)/g, "");
      const found = stripped.match(hexRe);
      if (found?.length) matches.push(...found);
    }
    if (!matches.length) continue;
    perFile.push({
      file: path.relative(ROOT, file).replace(/\\/g, "/"),
      count: matches.length,
    });
  }

  perFile.sort((a, b) => b.count - a.count);
  const total = perFile.reduce((n, f) => n + f.count, 0);
  return { perFile, total };
}

function cssFileStats(cssRoot) {
  const files = walkDir(cssRoot, [".css"], []);
  return files
    .map((f) => {
      const text = read(f);
      const varDecls = (text.match(/--[\w-]+(?=:)/g) || []).length;
      const uniqueVars = new Set(text.match(/--[\w-]+(?=:)/g) || []).size;
      const rules = (text.match(/[^{}]+(?=\s*\{)/g) || []).filter(
        (s) => !s.trim().startsWith("@") && s.trim().length > 0,
      ).length;
      return {
        rel: path.relative(ROOT, f).replace(/\\/g, "/"),
        bytes: Buffer.byteLength(text, "utf8"),
        lines: text.split("\n").length,
        varDeclarations: varDecls,
        uniqueVariables: uniqueVars,
        ruleCount: rules,
      };
    })
    .sort((a, b) => b.bytes - a.bytes);
}

function readStyleBaseline() {
  const text = read(STYLE_MD);
  const m = text.match(
    /Baseline[^:]*:\*\*\s*(\d+)\s+dynamic\/intentional\s+`style=\{\{`/i,
  );
  return m ? Number.parseInt(m[1], 10) : null;
}

function main() {
  out("=".repeat(72));
  out("PHARMACY FANTASY — CSS INVENTORY & STYLING AUDIT (MVP)");
  out("Generated: " + new Date().toISOString());
  out("Root: " + ROOT);
  out("=".repeat(72));
  out();

  const pkg = JSON.parse(read(path.join(ROOT, "package.json")) || "{}");
  out("## 1) Package.json — Tailwind / PostCSS / Styling Stack");
  const twDeps = pkgTailwindHints(pkg);
  if (twDeps.length === 0) {
    out("  (none) — Native CSS Design Tokens architecture in src/app/globals.css.");
  } else {
    twDeps.forEach((d) => out(`  - ${d}`));
  }
  out(`  npm scripts: css:inventory (this report)`);
  out();

  out("## 2) Config files (Tailwind / PostCSS)");
  const configs = findConfigFiles();
  if (configs.length === 0) {
    out("  (none) — Pure CSS3 Custom Properties without PostCSS/Tailwind build step.");
  } else {
    configs.forEach((p) => out(`  - ${path.relative(ROOT, p)}`));
  }
  out();

  out("## 3) Entry CSS graph (src/app/globals.css → @import chain)");
  const globalsCandidates = [
    path.join(ROOT, "src", "app", "globals.css"),
    path.join(ROOT, "app", "globals.css"),
  ];
  const globalsPath = globalsCandidates.find((p) => fs.existsSync(p));
  if (globalsPath) {
    out(`  Entry: ${path.relative(ROOT, globalsPath).replace(/\\/g, "/")}`);
    const imports = flattenImportTree(globalsPath);
    if (imports.length === 0) {
      out("  @import graph: self-contained (no external/relative imports).");
    } else {
      const seen = new Set();
      for (const im of imports) {
        const key =
          im.type === "external-url"
            ? `url:${im.spec}`
            : `rel:${im.resolved || im.spec}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (im.type === "external-url") {
          out(`  @import EXTERNAL: ${im.spec}`);
        } else {
          out(
            `  @import ${im.spec} → ${im.resolved ? path.relative(ROOT, im.resolved).replace(/\\/g, "/") : "?"}`,
          );
        }
      }
    }
  } else {
    out("  (globals.css not found)");
  }
  out();

  out("## 4) .css files under src/ (size, lines, design tokens & rules)");
  const cssStats = cssFileStats(path.join(ROOT, "src"));
  for (const s of cssStats) {
    out(
      `  ${String(s.bytes).padStart(7)} B  ${String(s.lines).padStart(5)} lines  ~${String(s.uniqueVariables).padStart(3)} tokens  ~${String(s.ruleCount).padStart(4)} rules  ${s.rel}`,
    );
  }
  if (cssStats.length === 0) {
    out("  (no .css files found under src/)");
  }
  out();

  out("## 5) Design Tokens & Variables in globals.css");
  if (globalsPath) {
    const text = read(globalsPath);
    const varMatches = text.match(/--[\w-]+(?=:)/g) || [];
    const unique = [...new Set(varMatches)].sort();
    out(`  Total token declarations: ${varMatches.length} (${unique.length} unique tokens)`);
    const primary = unique.filter((v) => v.includes("primary"));
    const gray = unique.filter((v) => v.includes("gray"));
    const badges = unique.filter((v) => v.includes("badge"));
    const spaces = unique.filter((v) => v.includes("space"));
    const fonts = unique.filter((v) => v.includes("font"));
    out(`  - Primary tokens: ${primary.length} (e.g. ${primary.slice(0, 3).join(", ")})`);
    out(`  - Gray tokens: ${gray.length} (e.g. ${gray.slice(0, 3).join(", ")})`);
    out(`  - Badge tokens: ${badges.length} (e.g. ${badges.slice(0, 3).join(", ")})`);
    out(`  - Spacing tokens: ${spaces.length} (e.g. ${spaces.slice(0, 3).join(", ")})`);
    out(`  - Typography tokens: ${fonts.length} (e.g. ${fonts.slice(0, 3).join(", ")})`);
  } else {
    out("  (globals.css not found)");
  }
  out();

  const compTsx = walkDir(path.join(ROOT, "src", "components"), [".tsx", ".jsx"], []);
  const appTsx = walkDir(path.join(ROOT, "src", "app"), [".tsx", ".jsx"], []);
  const allSrcTsx = [...compTsx, ...appTsx];

  out("## 6) Inline styles — src/components/ (shared & UI components)");
  const compInline = scanInlineStyles(compTsx);
  out(
    `  Files with inline style: ${compInline.perFile.length}; React style={{ lines: ${compInline.totalReact}; HTML style=" lines: ${compInline.totalHtml}`,
  );
  compInline.perFile.forEach((p) => {
    out(
      `  - ${p.file}  (react=${p.reactInlineBlocks})  lines: ${p.lines.join(", ")}${p.lines.length >= 40 ? " …" : ""}`,
    );
  });
  out();

  out("## 7) Inline styles — src/app/ (routes, layouts, pages)");
  const appInline = scanInlineStyles(appTsx);
  out(
    `  Files with inline style: ${appInline.perFile.length}; React style={{ lines: ${appInline.totalReact}; HTML style=" lines: ${appInline.totalHtml}`,
  );
  appInline.perFile.forEach((p) => {
    out(`  - ${p.file}  (react=${p.reactInlineBlocks})`);
  });
  out();

  const classified = classifyInlineStyles(allSrcTsx);
  out("## 8) src/ inline style heuristic (dynamic vs css var bridge vs layout-ish)");
  out(`  Likely dynamic (runtime values, CSSProperties, active states): ${classified.dynamic}`);
  out(`  CSS custom-property bridge lines (--var): ${classified.cssVarBridge}`);
  out(`  Layout-ish literals (display/flex/padding/border): ${classified.layoutish}`);
  if (classified.dynamicFiles.length) {
    out("  Dynamic by file (top 15):");
    classified.dynamicFiles.slice(0, 15).forEach(([f, n]) => out(`    - ${f}: ${n}`));
    if (classified.dynamicFiles.length > 15) {
      out(`    … and ${classified.dynamicFiles.length - 15} more files`);
    }
  }
  out();

  const hexScan = scanHardcodedHex(allSrcTsx);
  out("## 9) Hardcoded hex in src/ (prefer var(--color-*))");
  out(`  Total hex literals: ${hexScan.total} across ${hexScan.perFile.length} files`);
  hexScan.perFile.slice(0, 15).forEach((h) => {
    out(`  - ${h.file}: ${h.count}`);
  });
  if (hexScan.perFile.length > 15) {
    out(`  … and ${hexScan.perFile.length - 15} more files`);
  }
  out();

  const docBaseline = readStyleBaseline();
  const totalSrcReact = compInline.totalReact + appInline.totalReact;
  out("## 10) Baseline gate (STYLE.md + CSS_INLINE_SRC_MAX)");
  if (docBaseline != null) {
    out(`  Documented baseline (src/ dynamic/intentional): ${docBaseline}`);
  } else {
    out("  Documented baseline: 1550 React style={{ lines in src/ (MVP baseline)");
  }
  out(`  Threshold CSS_INLINE_SRC_MAX: ${INLINE_SRC_MAX} React style={{ lines in src/`);
  out(`  Current src/ React style={{ count: ${totalSrcReact}`);

  if (totalSrcReact > INLINE_SRC_MAX) {
    fail(
      `src/ has ${totalSrcReact} style={{ lines (max ${INLINE_SRC_MAX}). Migrate static layout styles into globals.css classes or justify as dynamic.`,
    );
  } else {
    out(`  OK within threshold (${totalSrcReact} ≤ ${INLINE_SRC_MAX})`);
  }

  if (classified.layoutish > 0) {
    warn(
      `${classified.layoutish} layout-ish inline style lines in src/ — candidates for globals.css class migration.`,
    );
  }
  out();

  out("## 11) Conventions & Design Standards (see STYLE.md & DESIGN.md)");
  out("  - All styling must be guided by design tokens declared in src/app/globals.css");
  out("  - No raw magic numbers: use var(--space-*), var(--color-*), var(--radius-*)");
  out("  - Modern Web Platform APIs: native <dialog> for modals, :user-invalid for forms");
  out("  - Keep style={{ only for runtime values (KPI charts, meter widths, dynamic badge colors)");
  out("  - Validate: npm run lint && npm run typecheck");
  out();

  out("=".repeat(72));
  out(`Report: ${path.relative(ROOT, REPORT_FILE).replace(/\\/g, "/")}`);
  out("=".repeat(72));

  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, lines.join("\n"), "utf8");

  if (NO_FAIL) process.exit(0);
  process.exit(exitCode);
}

main();
