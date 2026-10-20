import { describe, it, expect } from "vitest";
import {
  LOGIN_MUTATION,
  ME_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_QUERY,
  ORDERS_QUERY,
  DASHBOARD_STATS_QUERY,
} from "./graphql-queries";

describe("GraphQL query definitions", () => {
  it("exports valid DocumentNode AST objects", () => {
    expect(LOGIN_MUTATION.kind).toBe("Document");
    expect(ME_QUERY.kind).toBe("Document");
    expect(PRODUCTS_QUERY.kind).toBe("Document");
    expect(PRODUCT_QUERY.kind).toBe("Document");
    expect(ORDERS_QUERY.kind).toBe("Document");
    expect(DASHBOARD_STATS_QUERY.kind).toBe("Document");
  });

  it("contains expected definitions and operation types", () => {
    expect(LOGIN_MUTATION.definitions.length).toBeGreaterThan(0);
    expect(ME_QUERY.definitions.length).toBeGreaterThan(0);
  });
});
