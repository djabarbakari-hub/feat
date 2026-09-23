"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const PUBLIC = ["/", "/welcome", "/login", "/signup", "/quiz", "/pricing"];

export function RouteGuard({ children }) {
  const { user, profile, loading, hasProgram } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isSplash = pathname === "/";

  useEffect(() => {
    if (loading || isSplash) return;
    const isPublic = PUBLIC.includes(pathname);

    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }

    if (user && (pathname === "/welcome" || pathname === "/login" || pathname === "/signup")) {
      router.replace(hasProgram ? "/today" : "/quiz");
    }
  }, [hasProgram, isSplash, loading, pathname, profile, router, user]);

  if (loading && !isSplash) {
    return (
      <div className="center-state">
        <div className="spinner" />
      </div>
    );
  }

  return children;
}
