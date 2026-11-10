"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navigation } from "@/config/navigation";

export function Brand({ light = false }: { light?: boolean }) {
  return <Link className={`brand ${light ? "brand-light" : ""}`} href="/" aria-label="TERVÉN กลับสู่หน้าแรก">
    <Image className="official-logo" src="/images/terven-logo.png" alt="TERVÉN — Defining Places, Creating Value" width={550} height={409} priority />
  </Link>;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);
  const current = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  return <>
    <div className="prototype-strip" id="home"><span className="prototype-dot" />TERVÉN · ประกาศแสดงเฉพาะรายการที่เผยแพร่แล้ว</div>
    <header className="site-header">
      <div className="header-inner container-wide">
        <Brand />
        <nav className="desktop-nav" aria-label="เมนูหลัก">
          {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={current(item.href) ? "page" : undefined}>{item.label}</Link>)}
        </nav>
        <Link className="header-cta" href="/sell">ฝากขายอสังหากับเรา <ArrowUpRight size={16} /></Link>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"} aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={26} /> : <Menu size={26} />}</button>
      </div>
      {menuOpen && <nav className="mobile-nav" id="mobile-navigation" aria-label="เมนูหลักสำหรับมือถือ">
        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={current(item.href) ? "page" : undefined}>{item.label}<ArrowUpRight size={17} /></Link>)}
        <Link className="mobile-nav-cta" href="/sell" onClick={() => setMenuOpen(false)}>ฝากขายอสังหากับเรา <ArrowUpRight size={18} /></Link>
      </nav>}
    </header>
  </>;
}
