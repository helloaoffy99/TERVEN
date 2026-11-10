"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ListFilter, Search, X } from "lucide-react";
import { propertyStatuses, propertyTypes, type Property } from "@/data/properties";
import { defaultFilters, getDistricts, PropertyFilters, readFilters, searchProperties, writeFilters } from "@/lib/property-search";
import { PropertyCard } from "./property-card";

export function PropertyExplorer({ properties }: { properties: Property[] }) {
  const provinces = [...new Set(properties.map((property) => property.province))].sort((a, b) => a.localeCompare(b, "th"));
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const queryString = params.toString();
  const applied = useMemo(() => readFilters(new URLSearchParams(queryString)), [queryString]);
  const [draft, setDraft] = useState<PropertyFilters>(applied);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priceError, setPriceError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setDraft(applied), [applied]);
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onEscape);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onEscape); };
  }, [drawerOpen]);

  const districts = getDistricts(properties, draft.province);
  const result = useMemo(() => searchProperties(properties, applied), [applied, properties]);

  const navigate = (filters: PropertyFilters) => {
    const query = writeFilters(filters).toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };
  const apply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const min = draft.minPrice ? Number(draft.minPrice) : 0;
    const max = draft.maxPrice ? Number(draft.maxPrice) : Number.POSITIVE_INFINITY;
    if (min < 0 || max < 0 || min > max || !Number.isFinite(min)) {
      setPriceError("กรุณาระบุช่วงราคาที่ถูกต้อง โดยราคาต่ำสุดต้องไม่เกินราคาสูงสุด");
      return;
    }
    setPriceError("");
    navigate({ ...draft, page: 1 });
    setDrawerOpen(false);
  };
  const clear = () => { setPriceError(""); setDraft(defaultFilters); navigate(defaultFilters); setDrawerOpen(false); };
  const change = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => setDraft((current) => ({ ...current, [key]: value, ...(key === "province" ? { district: "" } : {}) }));

  return <section className="listing-section container" aria-label="รายการอสังหาริมทรัพย์">
    <div className="listing-toolbar"><div><span className="section-kicker">PROPERTY COLLECTION</span><h2>อสังหาริมทรัพย์ทั้งหมด</h2><p aria-live="polite">พบ {result.total} รายการ</p></div><button className="filter-open" type="button" onClick={() => setDrawerOpen(true)}><ListFilter size={20} /> ตัวกรอง</button></div>
    <div className="listing-layout">
      {drawerOpen && <button className="filter-scrim" type="button" aria-label="ปิดตัวกรอง" onClick={() => setDrawerOpen(false)} />}
      <aside className={`filter-panel ${drawerOpen ? "filter-panel-open" : ""}`} aria-label="ตัวกรองอสังหาริมทรัพย์">
        <div className="filter-title"><div><span className="section-kicker">REFINE SEARCH</span><h3>ตัวกรอง</h3></div><button className="filter-close" ref={closeRef} type="button" aria-label="ปิดตัวกรอง" onClick={() => setDrawerOpen(false)}><X size={22} /></button></div>
        <form onSubmit={apply} className="filter-form">
          <label>คำค้นหา<input value={draft.q} onChange={(event) => change("q", event.target.value)} placeholder="ชื่อทรัพย์ ทำเล หรือรหัสทรัพย์" /></label>
          <label>จังหวัด<select value={draft.province} onChange={(event) => change("province", event.target.value)}><option value="">ทุกจังหวัด</option>{provinces.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>อำเภอ / เขต<select value={draft.district} onChange={(event) => change("district", event.target.value)}><option value="">ทุกอำเภอ / เขต</option>{districts.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>ประเภททรัพย์<select value={draft.type} onChange={(event) => change("type", event.target.value as PropertyFilters["type"])}><option value="">ทุกประเภท</option>{propertyTypes.map((value) => <option key={value}>{value}</option>)}</select></label>
          <div className="filter-pair"><label>ราคาต่ำสุด (บาท)<input type="number" min="0" inputMode="numeric" value={draft.minPrice} onChange={(event) => change("minPrice", event.target.value)} placeholder="ไม่กำหนด" /></label><label>ราคาสูงสุด (บาท)<input type="number" min="0" inputMode="numeric" value={draft.maxPrice} onChange={(event) => change("maxPrice", event.target.value)} placeholder="ไม่กำหนด" /></label></div>
          {priceError && <p className="field-error" role="alert">{priceError}</p>}
          <label>สถานะประกาศ<select value={draft.status} onChange={(event) => change("status", event.target.value as PropertyFilters["status"])}><option value="">ทุกสถานะ</option>{propertyStatuses.map((value) => <option key={value}>{value}</option>)}</select></label>
          <div className="filter-actions"><button className="filter-submit" type="submit"><Search size={18} /> ใช้ตัวกรอง</button><button className="filter-reset" type="button" onClick={clear}>ล้างทั้งหมด</button></div>
        </form>
      </aside>
      <div className="listing-results">
        <div className="result-toolbar"><span>แสดง {result.total ? (result.page - 1) * 6 + 1 : 0}–{Math.min(result.page * 6, result.total)} จาก {result.total} รายการ</span><label>เรียงลำดับ<select aria-label="เรียงลำดับรายการ" value={applied.sort} onChange={(event) => navigate({ ...applied, sort: event.target.value as PropertyFilters["sort"], page: 1 })}><option value="newest">ใหม่ล่าสุด</option><option value="oldest">เก่าสุด</option><option value="price-asc">ราคาต่ำไปสูง</option><option value="price-desc">ราคาสูงไปต่ำ</option></select></label></div>
        {result.total ? <div className="listing-grid">{result.items.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="empty-state"><Search size={30} /><h3>{properties.length ? "ไม่พบทรัพย์ที่ตรงเงื่อนไข" : "ยังไม่มีประกาศอสังหาริมทรัพย์"}</h3><p>{properties.length ? "ลองเปลี่ยนคำค้นหา ทำเล ประเภท หรือช่วงราคา" : "เมื่อมีประกาศที่เผยแพร่แล้ว จะปรากฏที่นี่"}</p>{properties.length > 0 && <button type="button" onClick={clear}>ล้างตัวกรอง <ArrowRight size={17} /></button>}</div>}
        {result.totalPages > 1 && <nav className="pagination" aria-label="หน้าผลการค้นหา"><button type="button" disabled={result.page === 1} onClick={() => navigate({ ...applied, page: result.page - 1 })} aria-label="หน้าก่อนหน้า"><ArrowLeft size={18} /></button>{Array.from({ length: result.totalPages }, (_, index) => <button key={index} type="button" aria-current={result.page === index + 1 ? "page" : undefined} onClick={() => navigate({ ...applied, page: index + 1 })}>{index + 1}</button>)}<button type="button" disabled={result.page === result.totalPages} onClick={() => navigate({ ...applied, page: result.page + 1 })} aria-label="หน้าถัดไป"><ArrowRight size={18} /></button></nav>}
      </div>
    </div>
  </section>;
}
