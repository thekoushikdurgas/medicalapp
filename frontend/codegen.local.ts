import config from "./codegen";

/** Local API introspection. Start Pharmacy Fantasy backend on :8000 with introspection enabled. */
const localCodegenConfig = {
  ...config,
  schema: process.env.CODEGEN_SCHEMA_URL || "http://127.0.0.1:8000/graphql",
};

export default localCodegenConfig;
