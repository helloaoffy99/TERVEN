"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { propertyTypes } from "@/data/properties";
import { emptySubmission, SubmissionDraft, SubmissionErrors, toSubmission, validateSubmission } from "@/lib/submission";

export function SellerForm({ enabled }: { enabled: boolean }) {
  const [draft, setDraft] = useState<SubmissionDraft>(emptySubmission);
  const [errors, setErrors] = useState<SubmissionErrors>({});
  const [state, setState] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [website, setWebsite] = useState("");
  const change = <K extends keyof SubmissionDraft>(key: K, value: SubmissionDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value, ...(key === "province" ? { district: "" } : {}) }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setState("idle"); setServerError("");
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateSubmission(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setState("error"); return; }
    setState("checking");
    try {
      const response = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...toSubmission(draft), website }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ส่งข้อมูลไม่สำเร็จ");
      setState("success"); setDraft(emptySubmission);
    } catch (cause) { setServerError(cause instanceof Error ? cause.message : "ส่งข้อมูลไม่สำเร็จ"); setState("error"); }
  };
  const fieldError = (name: keyof SubmissionDraft) => errors[name] && <span className="field-error" id={`${name}-error`} role="alert">{errors[name]}</span>;
  const invalid = (name: keyof SubmissionDraft) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${name}-error` : undefined });

  return <form className="seller-form" onSubmit={submit} noValidate>
    <div className="form-heading"><span className="section-kicker">PROPERTY SUBMISSION</span><h2>ข้อมูลฝากขาย</h2><p>ช่องที่มี * จำเป็นต้องกรอก</p></div>
    <fieldset><legend>ข้อมูลผู้ฝากขาย</legend><div className="form-grid">
      <label className="form-full">ชื่อและนามสกุล *<input autoComplete="name" value={draft.contactName} onChange={(event) => change("contactName", event.target.value)} {...invalid("contactName")} />{fieldError("contactName")}</label>
      <label>เบอร์โทรศัพท์ *<input type="tel" inputMode="tel" autoComplete="tel" value={draft.phone} onChange={(event) => change("phone", event.target.value)} placeholder="0XX-XXX-XXXX" {...invalid("phone")} />{fieldError("phone")}</label>
      <label>LINE ID (ไม่บังคับ)<input value={draft.lineId} onChange={(event) => change("lineId", event.target.value)} autoComplete="off" /></label>
    </div></fieldset>
    <fieldset><legend>ข้อมูลอสังหาริมทรัพย์</legend><div className="form-grid">
      <label className="form-full">ประเภททรัพย์ *<select value={draft.propertyType} onChange={(event) => change("propertyType", event.target.value as SubmissionDraft["propertyType"])} {...invalid("propertyType")}><option value="">เลือกประเภททรัพย์</option>{propertyTypes.map((value) => <option key={value}>{value}</option>)}</select>{fieldError("propertyType")}</label>
      <label>จังหวัด *<input value={draft.province} onChange={(event) => change("province", event.target.value)} placeholder="ระบุจังหวัด" {...invalid("province")} />{fieldError("province")}</label>
      <label>อำเภอ / เขต *<input value={draft.district} onChange={(event) => change("district", event.target.value)} placeholder="ระบุอำเภอหรือเขต" {...invalid("district")} />{fieldError("district")}</label>
      <label className="form-full">ตำบล / แขวง (ไม่บังคับ)<input value={draft.subdistrict} onChange={(event) => change("subdistrict", event.target.value)} /></label>
      <div className="area-input"><label>ขนาดพื้นที่ *<input type="number" min="0.01" step="any" inputMode="decimal" value={draft.areaValue} onChange={(event) => change("areaValue", event.target.value)} {...invalid("areaValue")} /></label><label>หน่วยพื้นที่<select value={draft.areaUnit} onChange={(event) => change("areaUnit", event.target.value as SubmissionDraft["areaUnit"])}><option value="sqwa">ตารางวา</option><option value="sqm">ตารางเมตร</option><option value="ngan">งาน</option><option value="rai">ไร่</option></select></label>{fieldError("areaValue")}</div>
      <label>ราคาที่ต้องการขาย (บาท) *<input type="number" min="1" step="1" inputMode="numeric" value={draft.askingPrice} onChange={(event) => change("askingPrice", event.target.value)} {...invalid("askingPrice")} />{fieldError("askingPrice")}</label>
      <label className="form-full">รายละเอียดเพิ่มเติม<textarea rows={5} value={draft.description} onChange={(event) => change("description", event.target.value)} placeholder="ข้อมูลที่อยากให้ผู้ดูแลทราบ" /></label>
    </div></fieldset>
    <div className="consent-row"><label><input type="checkbox" checked={draft.consent} onChange={(event) => change("consent", event.target.checked)} {...invalid("consent")} /><span>ฉันยินยอมให้ TERVÉN ใช้ข้อมูลที่กรอกเพื่อติดต่อกลับเกี่ยวกับการฝากขาย และได้อ่าน <Link href="/privacy" target="_blank" rel="noopener noreferrer">นโยบายความเป็นส่วนตัว</Link> แล้ว *</span></label>{fieldError("consent")}</div>
    <div className="honeypot" aria-hidden="true"><label>เว็บไซต์<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label></div>
    {state === "error" && <p className="form-message form-error" role="alert">{serverError || "กรุณาตรวจสอบช่องที่แจ้งข้อผิดพลาด"}</p>}
    {state === "success" && <p className="form-message form-preview" role="status"><Check size={19} /> ส่งข้อมูลสำเร็จแล้ว</p>}
    <button className="form-submit" type="submit" disabled={state === "checking" || !enabled}>{state === "checking" ? <><LoaderCircle size={18} className="spin" /> กำลังส่งข้อมูล…</> : enabled ? <>ส่งข้อมูลฝากขาย <ArrowRight size={18} /></> : "ยังไม่เปิดรับข้อมูล"}</button>
    <p className="form-footnote">ข้อมูลจะถูกส่งเมื่อระบบรับฝากขายเปิดใช้งานและบันทึกสำเร็จเท่านั้น</p>
  </form>;
}
