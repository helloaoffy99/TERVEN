"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { PropertyImage } from "@/data/properties";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const startX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const current = images[index];
  const move = (step: number) => setIndex((value) => (value + step + images.length) % images.length);

  useEffect(() => {
    if (!zoomed) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "Tab") {
        const controls = document.querySelectorAll<HTMLElement>(".gallery-lightbox button");
        const first = controls[0]; const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus.current?.focus(); };
  }, [zoomed, images.length]);

  const touchHandlers = {
    onTouchStart: (event: React.TouchEvent) => { startX.current = event.touches[0].clientX; },
    onTouchEnd: (event: React.TouchEvent) => {
      if (startX.current === null) return;
      const delta = event.changedTouches[0].clientX - startX.current;
      if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
      startX.current = null;
    },
  };
  if (!images.length) return <div className="gallery-fallback" role="img" aria-label="ไม่มีภาพประกอบ">ยังไม่มีภาพประกอบ</div>;
  const photo = (large: boolean) => failed[current.imageUrl] ? <div className="gallery-fallback" role="img" aria-label="ภาพไม่พร้อมแสดง">ภาพประกอบไม่พร้อมแสดง</div> : <Image src={current.imageUrl} unoptimized={current.imageUrl.startsWith("http")} alt={current.altText} fill priority={!large && index === 0} sizes={large ? "100vw" : "(max-width: 800px) 100vw, 70vw"} onError={() => setFailed((value) => ({ ...value, [current.imageUrl]: true }))} />;

  return <div className="gallery" aria-label={`แกลเลอรีภาพ ${title}`}>
    <div className="gallery-main" {...touchHandlers}>
      {photo(false)}
      <span className="gallery-label">ภาพ {index + 1} / {images.length}</span>
      <button className="gallery-expand" type="button" onClick={() => setZoomed(true)} aria-label="ขยายภาพ"><Expand size={19} /> ขยายภาพ</button>
      {images.length > 1 && <div className="gallery-arrows"><button type="button" onClick={() => move(-1)} aria-label="ภาพก่อนหน้า"><ArrowLeft size={20} /></button><button type="button" onClick={() => move(1)} aria-label="ภาพถัดไป"><ArrowRight size={20} /></button></div>}
    </div>
    {images.length > 1 && <div className="gallery-thumbs" aria-label="เลือกภาพ">{images.map((image, photoIndex) => <button key={image.id} className={index === photoIndex ? "active" : ""} type="button" aria-label={`ดูภาพที่ ${photoIndex + 1}`} aria-current={index === photoIndex ? "true" : undefined} onClick={() => setIndex(photoIndex)}><Image src={image.imageUrl} unoptimized={image.imageUrl.startsWith("http")} alt="" width={160} height={100} sizes="100px" /></button>)}</div>}
    {zoomed && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`ภาพขยาย ${title}`} {...touchHandlers}>
      <button className="gallery-lightbox-close" type="button" ref={closeRef} onClick={() => setZoomed(false)} aria-label="ปิดภาพขยาย"><X size={24} /></button>
      <div className="gallery-lightbox-image">{photo(true)}</div>
      <div className="gallery-lightbox-controls">{images.length > 1 && <button type="button" onClick={() => move(-1)} aria-label="ภาพก่อนหน้า"><ArrowLeft size={22} /></button>}<span>{index + 1} / {images.length}</span>{images.length > 1 && <button type="button" onClick={() => move(1)} aria-label="ภาพถัดไป"><ArrowRight size={22} /></button>}</div>
    </div>}
  </div>;
}
