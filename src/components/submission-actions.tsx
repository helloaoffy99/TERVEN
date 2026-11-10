"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmissionActions({ id, status }: { id: string; status: string }) {
  const router = useRouter(); const [value, setValue] = useState(status); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  async function action(kind: "status" | "convert") {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, { method: kind === "convert" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: value }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "บันทึกไม่สำเร็จ");
      if (kind === "convert") router.push(`/admin/properties/${result.propertyId}`);
      else { setMessage("บันทึกสถานะแล้ว"); router.refresh(); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "บันทึกไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return <div className="admin-lead-actions"><label>สถานะคำขอ<select value={value} onChange={(event) => setValue(event.target.value)}><option value="new">ใหม่</option><option value="contacted">ติดต่อแล้ว</option><option value="reviewing">กำลังพิจารณา</option><option value="converted">แปลงเป็นแบบร่าง</option><option value="closed">ปิดคำขอ</option></select></label><div><button disabled={busy} onClick={() => action("status")}>บันทึกสถานะ</button><button disabled={busy || status === "converted"} onClick={() => action("convert")}>แปลงเป็นแบบร่างประกาศ</button></div>{error && <p className="field-error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}</div>;
}
