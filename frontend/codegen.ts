import type { CodegenConfig } from "@graphql-codegen/cli";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Emits TypeScript schema + operation types from the Pharmacy Fantasy GraphQL API.
 *
 * Schema resolution (first match wins):
 * 1. CODEGEN_SCHEMA_URL — live endpoint
 * 2. CODEGEN_SCHEMA_FILE — explicit SDL path
 * 3. tests/schema_snapshot.graphql — committed copy (standalone frontend)
 * 4. ../backend/tests/schema_snapshot.graphql — sibling backend repo
 */
const appRoot = path.dirname(fileURLToPath(import.meta.url));

function resolveSchema(): string {
  const fromEnv =
    process.env.CODEGEN_SCHEMA_URL?.trim() ||
    process.env.CODEGEN_SCHEMA_FILE?.trim();
  if (fromEnv?.startsWith("http")) return fromEnv;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  const candidates = [
    path.join(appRoot, "tests/schema_snapshot.graphql"),
    path.join(appRoot, "../backend/tests/schema_snapshot.graphql"),
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) return file;
  }
  return candidates[0];
}

const schema = resolveSchema();

const scalarConfig = {
  UUID: "string",
  Date: "string",
  DateTime: "string",
  BigInt: "string",
  JSON: "Record<string, unknown>",
};

const config: CodegenConfig = {
  schema,
  documents: [
    "src/lib/graphql-queries.ts",
    "src/graphql/documents/**/*.graphql",
  ],
  hooks: {
    afterAllFileWrite: ["prettier --write"],
  },
  generates: {
    "src/graphql/generated/types.ts": {
      plugins: ["typescript"],
      config: {
        scalars: scalarConfig,
        enumsAsTypes: true,
        skipTypename: false,
      },
    },
    "src/graphql/generated/operations.ts": {
      plugins: [
        { add: { content: 'import type * as Types from "./types";\n' } },
        "typescript-operations",
      ],
      config: {
        scalars: scalarConfig,
        enumsAsTypes: true,
        skipTypename: false,
        useTypeImports: true,
        importTypes: true,
        typesImportPath: "./types",
        namespacedImportName: "Types",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
