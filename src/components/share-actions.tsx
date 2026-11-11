"use client";

import { useEffect, useState } from "react";
import { Copy, Facebook, MapPin, Share2 } from "lucide-react";
import { Property } from "@/data/properties";
import { siteContact } from "@/config/site";

export function ShareActions({ property, preview = false }: { property: Property; preview?: boolean }) {
  const [url, setUrl] = useState("");
  const [nativeShare, setNativeShare] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { setUrl(window.location.href); setNativeShare(typeof navigator.share === "function"); }, []);
  const shareUrl = encodeURIComponent(url);
  const shareText = encodeURIComponent(`${property.title} — TERVÉN`);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setMessage("คัดลอกลิงก์แล้ว"); }
    catch { setMessage("คัดลอกไม่สำเร็จ กรุณาคัดลอกจากแถบที่อยู่"); }
  };
  const share = async () => {
    try { await navigator.share({ title: property.title, text: "อสังหาริมทรัพย์จาก TERVÉN", url }); }
    catch { /* User cancellation does not need an error message. */ }
  };
  const mapUrl = property.googleMapsUrl || (property.latitude !== undefined && property.longitude !== undefined ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}` : null);
  return <div className="share-contact" aria-label="แชร์และติดต่อ">
    {!preview && <><h2>แชร์ประกาศ</h2>
    <p>ส่งลิงก์ประกาศนี้ให้ผู้ที่สนใจ</p>
    <div className="share-buttons">
      <button type="button" onClick={copy}><Copy size={18} /> คัดลอกลิงก์</button>
      {nativeShare && <button type="button" onClick={share}><Share2 size={18} /> แชร์ผ่านอุปกรณ์</button>}
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"><Facebook size={18} /> แชร์ Facebook</a>
      <a href={`https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer">แชร์ LINE</a>
    </div></>}
    {message && <p className="share-feedback" role="status">{message}</p>}
    <div className="contact-placeholder"><strong>สอบถามทรัพย์และนัดชม</strong>{siteContact.phone || siteContact.lineUrl ? <div className="share-buttons">{siteContact.phone && <a href={`tel:${siteContact.phone}`}>โทรสอบถาม</a>}{siteContact.lineUrl && <a href={siteContact.lineUrl} target="_blank" rel="noopener noreferrer">ทัก LINE เรื่องทำเลและราคา</a>}</div> : <p>ยังไม่ได้ตั้งค่าเบอร์โทรศัพท์หรือ LINE อย่างเป็นทางการ</p>}</div>
    {mapUrl && <a className="preview-map-link" href={mapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={18} /> เปิด Google Maps</a>}
    {(siteContact.phone || siteContact.lineUrl) && <div className="mobile-contact-bar">{siteContact.phone && <a href={`tel:${siteContact.phone}`}>โทรสอบถาม</a>}{siteContact.lineUrl && <a href={siteContact.lineUrl} target="_blank" rel="noopener noreferrer">ติดต่อ LINE</a>}</div>}
  </div>;
}
