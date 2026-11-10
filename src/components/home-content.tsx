"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { PropertyCard } from "@/components/property-card";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Compass,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Property } from "@/data/properties";
import { siteContact } from "@/config/site";

const maxPriceOptions = [
  { label: "ทุกช่วงราคา", value: "" },
  { label: "ไม่เกิน 10 ล้านบาท", value: "10000000" },
  { label: "ไม่เกิน 15 ล้านบาท", value: "15000000" },
  { label: "ไม่เกิน 30 ล้านบาท", value: "30000000" },
];

export function HomeContent({ properties, intakeEnabled }: { properties: Property[]; intakeEnabled: boolean }) {
  const provinces = [...new Set(properties.map((property) => property.province))].sort((a, b) => a.localeCompare(b, "th"));
  const [province, setProvince] = useState("");
  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!selectedProperty) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    document.body.style.overflow = "hidden";
    dialog?.querySelector<HTMLElement>(".modal-close")?.focus();
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProperty(null);
      }
      if (event.key === "Tab" && dialog) {
        const focusable = [...dialog.querySelectorAll<HTMLElement>("button, a, select, input, [tabindex]:not([tabindex='-1'])")].filter((element) => !element.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleDialogKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDialogKeys);
      previousFocus?.focus();
    };
  }, [selectedProperty]);

  const results = useMemo(() => {
    if (!searched) return properties.filter((item) => item.isFeatured).slice(0, 3);
    return properties.filter((item) =>
      (!province || item.province === province) &&
      (!type || item.type === type) &&
      (!maxPrice || item.price <= Number(maxPrice))
    );
  }, [province, type, maxPrice, searched, properties]);

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearched(true);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const resetSearch = () => {
    setProvince("");
    setType("");
    setMaxPrice("");
    setSearched(false);
  };

  return (
    <>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <Image className="hero-photo" src="/images/hero-residence.webp" alt="ภาพประกอบบ้านร่วมสมัยพร้อมสวนและสระว่ายน้ำ" fill priority sizes="100vw" />
          <div className="hero-shade" />
          <div className="hero-content container-wide">
            <div className="hero-eyebrow"><span className="line" /> THE ART OF FINDING HOME</div>
            <h1 id="hero-title">มากกว่าพื้นที่<br />คือ <em>คุณค่าของชีวิต</em></h1>
            <p>ค้นพบอสังหาริมทรัพย์ที่ตอบโจทย์ในทุกมิติของชีวิต พร้อมมุมมองและการดูแลอย่างใส่ใจในทุกรายละเอียด</p>
            <a href="#properties" className="hero-discover">สำรวจอสังหาริมทรัพย์ <ArrowDown size={16} /></a>
          </div>
          <div className="hero-side-label">CURATED SPACES. CONSIDERED LIVING.</div>
        </section>

        <section className="search-wrap container-wide" aria-label="ค้นหาอสังหาริมทรัพย์">
          <div className="search-panel">
            <div className="search-intro">
              <span className="section-kicker">FIND YOUR PLACE</span>
              <strong>ค้นหาพื้นที่ที่ใช่สำหรับคุณ</strong>
            </div>
            <form className="search-form" onSubmit={search}>
              <label className="search-field">
                <span>จังหวัด</span>
                <span className="select-wrap"><select value={province} onChange={(event) => setProvince(event.target.value)} aria-label="เลือกจังหวัด"><option value="">ทุกจังหวัด</option>{provinces.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></span>
              </label>
              <label className="search-field">
                <span>ประเภททรัพย์</span>
                <span className="select-wrap"><select value={type} onChange={(event) => setType(event.target.value)} aria-label="เลือกประเภททรัพย์"><option value="">ทุกประเภท</option><option value="บ้านเดี่ยว">บ้านเดี่ยว</option><option value="บ้านแฝด">บ้านแฝด</option><option value="ทาวน์เฮาส์ / ทาวน์โฮม">ทาวน์โฮม</option><option value="คอนโดมิเนียม">คอนโดมิเนียม</option><option value="ที่ดิน">ที่ดิน</option><option value="อาคารพาณิชย์">อาคารพาณิชย์</option><option value="อสังหาริมทรัพย์อื่น ๆ">อื่น ๆ</option></select><ChevronDown size={15} /></span>
              </label>
              <label className="search-field">
                <span>ช่วงราคา</span>
                <span className="select-wrap"><select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} aria-label="เลือกช่วงราคา">{maxPriceOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}</select><ChevronDown size={15} /></span>
              </label>
              <button className="search-button" type="submit"><Search size={18} /> ค้นหาอสังหาริมทรัพย์</button>
            </form>
          </div>
        </section>

        <section className="intro-section container" id="about">
          <div className="intro-overline"><span /> WELCOME TO TERVÉN</div>
          <div className="intro-grid">
            <h2>พื้นที่ที่ดี<br /><em>เปลี่ยนทุกวันให้มีความหมาย</em></h2>
            <div className="intro-copy">
              <p>เราเชื่อว่าการเลือกอสังหาริมทรัพย์ไม่ใช่แค่เรื่องของทำเลหรือราคา แต่คือการเลือกพื้นที่ที่เข้ากับเป้าหมายและจังหวะชีวิตของคุณ</p>
              <p>TERVÉN ตั้งใจสร้างประสบการณ์ค้นหาและฝากขายที่ชัดเจน เรียบง่าย และใส่ใจในรายละเอียดตั้งแต่ก้าวแรก</p>
              <a href="#services" className="text-link">ทำความรู้จักบริการของเรา <ArrowRight size={17} /></a>
            </div>
          </div>
        </section>

        <section className="properties-section" id="properties" ref={resultsRef}>
          <div className="container">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">SELECTED PROPERTIES</span>
                <h2>อสังหาริมทรัพย์<span>ที่คัดสรร</span></h2>
                <p>สำรวจประกาศที่เผยแพร่และค้นหาพื้นที่ที่เหมาะกับคุณ</p>
              </div>
              <span className="listing-disclaimer"><span /> เฉพาะประกาศที่เผยแพร่แล้ว</span>
            </div>
            {searched && <div className="results-summary"><span>ผลการค้นหา: {results.length} รายการ</span><button onClick={resetSearch}>ล้างตัวกรอง <X size={14} /></button></div>}
            {results.length > 0 ? <div className="property-grid">{results.map((property) => <PropertyCard key={property.id} property={property} onView={setSelectedProperty} />)}</div> : <div className="empty-state"><Search size={28} /><h3>{properties.length ? "ไม่พบทรัพย์ที่ตรงเงื่อนไข" : "ยังไม่มีประกาศอสังหาริมทรัพย์"}</h3><p>{properties.length ? "ลองปรับจังหวัด ประเภททรัพย์ หรือช่วงราคาอีกครั้ง" : "เมื่อมีประกาศที่ผ่านการตรวจสอบและเผยแพร่แล้ว จะปรากฏที่นี่"}</p>{properties.length > 0 && <button onClick={resetSearch}>ดูทั้งหมด <ArrowRight size={16} /></button>}</div>}
            <a className="all-properties-link" href="/properties">ดูอสังหาริมทรัพย์ทั้งหมด <ArrowUpRight size={18} /></a>
          </div>
        </section>

        <section className="services-section container" id="services">
          <div className="services-heading">
            <span className="section-kicker">WHAT WE DO</span>
            <h2>ครบทุกมุมมอง<br /><em>ของการซื้อขายอสังหาฯ</em></h2>
            <p>ตั้งแต่การมองหาพื้นที่ใหม่ ไปจนถึงการส่งต่อทรัพย์ที่คุณดูแล เราวางประสบการณ์ให้ทุกขั้นตอนชัดเจนและสบายใจ</p>
          </div>
          <div className="services-list">
            <div className="service-item"><div className="service-icon"><Home size={28} strokeWidth={1.3} /></div><div><span>01 / SELL</span><h3>รับฝากขายอสังหาริมทรัพย์</h3><p>นำเสนอจุดเด่นของทรัพย์อย่างเป็นระบบ เพื่อให้ผู้สนใจเห็นคุณค่าของพื้นที่ได้ชัดเจน</p></div></div>
            <div className="service-item"><div className="service-icon"><Compass size={28} strokeWidth={1.3} /></div><div><span>02 / DISCOVER</span><h3>ช่วยค้นหาอสังหาริมทรัพย์</h3><p>ค้นหาทรัพย์ตามทำเล ประเภท และงบประมาณ ให้เริ่มต้นได้ตรงกับสิ่งที่ต้องการ</p></div></div>
            <div className="service-item"><div className="service-icon"><ShieldCheck size={28} strokeWidth={1.3} /></div><div><span>03 / SUPPORT</span><h3>ประสานงานและให้คำปรึกษา</h3><p>เตรียมข้อมูลสำคัญและดูแลการประสานงาน เพื่อให้การตัดสินใจเป็นไปอย่างมั่นใจ</p></div></div>
          </div>
        </section>

        <section className="sell-section" id="sell">
          <div className="sell-photo"><Image src="/images/property-chiangmai.webp" alt="ภาพประกอบบ้านร่วมสมัยท่ามกลางวิวภูเขา" fill sizes="(max-width: 700px) 100vw, 50vw" /></div>
          <div className="sell-content">
            <span className="section-kicker">SELL WITH TERVÉN</span>
            <h2>ทรัพย์ของคุณ<br /><em>สมควรได้รับการนำเสนอ<br />อย่างดีที่สุด</em></h2>
            <p>ให้เรื่องราวของอสังหาริมทรัพย์ทุกแห่งถูกเล่าอย่างมีคุณค่า ตั้งแต่การรับข้อมูลจนถึงการนำเสนอแก่ผู้ที่กำลังมองหาพื้นที่ที่ใช่</p>
            <div className="sell-steps">
              <div><span>01</span><strong>ส่งข้อมูลทรัพย์</strong></div>
              <div><span>02</span><strong>ตรวจสอบรายละเอียด</strong></div>
              <div><span>03</span><strong>เตรียมนำเสนอ</strong></div>
            </div>
            <a className="gold-button" href="/sell">ดูแบบฟอร์มฝากขาย <ArrowUpRight size={18} /></a>
            {!intakeEnabled && <small>ระบบรับฝากขายยังไม่เปิดใช้งาน</small>}
          </div>
        </section>

        <section className="closing-section" id="contact">
          <div className="container closing-inner">
            <span className="section-kicker">LET&apos;S FIND WHAT MATTERS</span>
            <h2>เริ่มต้นบทใหม่<br /><em>ในพื้นที่ที่เป็นคุณ</em></h2>
            <p>สอบถามข้อมูลอสังหาริมทรัพย์และนัดพูดคุยกับ TERVÉN ผ่าน LINE</p>
            {siteContact.lineUrl && <a href={siteContact.lineUrl} className="outline-button" target="_blank" rel="noopener noreferrer">ติดต่อผ่าน LINE <ArrowUpRight size={17} /></a>}
          </div>
        </section>
      </main>

      {selectedProperty && <div className="modal-backdrop" onMouseDown={() => setSelectedProperty(null)}><div className="property-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedProperty(null)} aria-label="ปิดรายละเอียด"><X size={22} /></button><div className="modal-image">{selectedProperty.image && <Image src={selectedProperty.image} unoptimized={selectedProperty.image.startsWith("http")} alt={selectedProperty.title} fill sizes="(max-width: 770px) 100vw, 770px" />}</div><div className="modal-body"><span className="section-kicker">PROPERTY / อสังหาริมทรัพย์</span><h2 id="modal-title">{selectedProperty.title}</h2><p><MapPin size={16} /> {selectedProperty.location}</p><div className="modal-facts"><span>{selectedProperty.type}</span><span>{selectedProperty.area}</span><strong>฿{selectedProperty.priceLabel}</strong></div><div className="modal-actions"><a className="dark-button" href={`/properties/${selectedProperty.slug}`}>เปิดหน้ารายละเอียด <ArrowRight size={16} /></a><button className="dark-button" onClick={() => setSelectedProperty(null)}>กลับไปดูรายการ <ArrowLeft size={16} /></button></div></div></div></div>}
    </>
  );
}
