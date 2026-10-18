"use client";

/**
 * AuthGuard — wraps dashboard routes.
 * Redirects to /login if not authenticated, shows nothing while checking.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_KEYS } from "@/lib/auth";
import type { UserRole } from "@/types";

interface Props {
  children: React.ReactNode;
  /** If set, only these roles can see the content */
  allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      router.replace("/login");
      return;
    }

    if (allowedRoles) {
      try {
        const user = JSON.parse(localStorage.getItem(AUTH_KEYS.USER) || "{}");
        if (!allowedRoles.includes(user.role)) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        router.replace("/login");
        return;
      }
    }

    setReady(true);
  }, [router, allowedRoles]);

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "var(--radius-full)" }} />
      </div>
    );
  }

  return <>{children}</>;
}
