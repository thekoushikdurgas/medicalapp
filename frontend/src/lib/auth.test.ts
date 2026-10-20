import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  AUTH_KEYS,
  ROLE_META,
  getNavItems,
  getStoredUser,
  isAuthenticated,
} from "./auth";
import type { UserRole } from "@/types";

describe("auth helpers", () => {
  describe("AUTH_KEYS", () => {
    it("defines consistent keys for token and user", () => {
      expect(AUTH_KEYS.TOKEN).toBe("token");
      expect(AUTH_KEYS.USER).toBe("user");
    });
  });

  describe("getNavItems", () => {
    it("returns correct nav items for SUPER_ADMIN", () => {
      const items = getNavItems("SUPER_ADMIN");
      expect(items.length).toBeGreaterThan(5);
      expect(items[0]).toEqual({
        href: "/dashboard",
        label: "Dashboard",
        icon: "📊",
      });
      expect(items.some((item) => item.href === "/dashboard/users")).toBe(true);
    });

    it("returns correct nav items for WAREHOUSE", () => {
      const items = getNavItems("WAREHOUSE");
      expect(items.some((item) => item.href === "/dashboard/inventory")).toBe(
        true,
      );
      expect(items.some((item) => item.href === "/dashboard/users")).toBe(
        false,
      );
    });

    it("returns correct nav items for DELIVERY", () => {
      const items = getNavItems("DELIVERY");
      expect(items.length).toBe(2);
      expect(items[1].href).toBe("/dashboard/deliveries");
    });

    it("defaults to SHOPKEEPER items for unknown role", () => {
      const items = getNavItems("UNKNOWN" as unknown as UserRole);
      expect(items.some((item) => item.href === "/dashboard/products")).toBe(
        true,
      );
    });
  });

  describe("ROLE_META", () => {
    it("provides label, icon, and color for all standard roles", () => {
      const roles: UserRole[] = [
        "SUPER_ADMIN",
        "ADMIN",
        "WAREHOUSE",
        "DELIVERY",
        "SHOPKEEPER",
      ];
      for (const role of roles) {
        expect(ROLE_META[role]).toBeDefined();
        expect(ROLE_META[role].label).toBeTruthy();
        expect(ROLE_META[role].icon).toBeTruthy();
        expect(ROLE_META[role].color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });

  describe("client-side storage helpers", () => {
    const mockStorage: Record<string, string> = {};

    const storageObj = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v;
      },
      removeItem: (k: string) => {
        delete mockStorage[k];
      },
      clear: () => {
        for (const k in mockStorage) delete mockStorage[k];
      },
    };

    beforeEach(() => {
      for (const k in mockStorage) delete mockStorage[k];
      vi.stubGlobal("localStorage", storageObj);
      vi.stubGlobal("window", { localStorage: storageObj });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("isAuthenticated returns true when token is present", () => {
      expect(isAuthenticated()).toBe(false);
      localStorage.setItem(AUTH_KEYS.TOKEN, "mock-jwt-token");
      expect(isAuthenticated()).toBe(true);
    });

    it("getStoredUser returns parsed user object or null", () => {
      expect(getStoredUser()).toBeNull();
      const mockUser = {
        role: "ADMIN" as UserRole,
        fullName: "Test Admin",
        email: "admin@pharmacy.local",
      };
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(mockUser));
      expect(getStoredUser()).toEqual(mockUser);
    });
  });
});
