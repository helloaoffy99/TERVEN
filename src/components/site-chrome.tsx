"use client";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return <>{children}</>;
  return <><SiteHeader />{children}<SiteFooter /></>;
}
