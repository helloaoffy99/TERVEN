"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { propertyTypes } from "@/data/properties";

type ImageRecord = { id: string; storage_path: string; alt_text: string; sort_order: number; is_cover: boolean };
type Initial = Record<string, unknown> & { id: string; property_images?: ImageRecord[] };
const numberOrNull = (value: FormDataEntryValue | null) => value === null || String(value).trim() === "" ? null : Number(value);
const field = (value: unknown) => value == null ? "" : String(value);

export function PropertyEditor({ initial, canDelete = false }: { initial?: Initial; canDelete?: boolean }) {
  const router = useRouter(); const formRef = useRef<HTMLFormElement>(null);
  const [id, setId] = useState(initial?.id ?? "");
  const [images, setImages] = useState<ImageRecord[]>([...(initial?.property_images ?? [])].sort((a, b) => a.sort_order - b.sort_order));
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [publish, setPublish] = useState(Boolean(initial?.published_at));
  const totalWa = Number(initial?.land_area_sqm ?? 0) / 4;
  const [rai, setRai] = useState(Math.floor(totalWa / 400).toString());
  const [ngan, setNgan] = useState(Math.floor((totalWa % 400) / 100).toString());
  const [wa, setWa] = useState(Number((totalWa % 100).toFixed(2)).toString());
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const area = (Number(rai) * 400 + Number(ngan) * 100 + Number(wa)) * 4;
    const body = {
      property_code: field(form.get("property_code")).trim(), slug: field(form.get("slug")).trim(), title: field(form.get("title")).trim(),
      description: field(form.get("description")).trim(), property_type: field(form.get("property_type")), price: Number(form.get("price")),
      province: field(form.get("province")).trim(), district: field(form.get("district")).trim(), subdistrict: field(form.get("subdistrict")).trim() || null,
      land_area_sqm: area > 0 && Number.isFinite(area) ? area : null, usable_area_sqm: numberOrNull(form.get("usable_area_sqm")),
      bedrooms: numberOrNull(form.get("bedrooms")), bathrooms: numberOrNull(form.get("bathrooms")), parking: numberOrNull(form.get("parking")),
      latitude: numberOrNull(form.get("latitude")), longitude: numberOrNull(form.get("longitude")),
      status: field(form.get("status")), is_featured: form.get("is_featured") === "on", publish,
    };
    try {
      const response = await fetch(id ? `/api/admin/properties/${id}` : "/api/admin/properties", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "บันทึกไม่สำเร็จ");
      setMessage("บันทึกประกาศแล้ว"); setId(result.id); router.refresh();
      if (!id) router.replace(`/admin/properties/${result.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "บันทึกไม่สำเร็จ"); } finally { setBusy(false); }
  }
  async function removeProperty() {
    if (!id || !window.confirm("ยืนยันลบประกาศและภาพทั้งหมด? การลบไม่สามารถย้อนกลับได้")) return;
    setBusy(true); setError("");
    try { const response = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" }); const result = await response.json(); if (!response.ok) throw new Error(result.error); router.replace("/admin/properties"); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "ลบไม่สำเร็จ"); setBusy(false); }
  }
  async function upload(files: FileList | null) {
    if (!id || !files?.length) return;
    setError(""); setMessage("");
    for (const [index, file] of Array.from(files).entries()) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) { setError(`ไฟล์ ${file.name} ต้องเป็น JPG, PNG หรือ WebP ไม่เกิน 10 MB`); break; }
      try {
        const saved = await new Promise<ImageRecord>((resolve, reject) => {
          const xhr = new XMLHttpRequest(); const data = new FormData(); data.append("image", file);
          xhr.open("POST", `/api/admin/properties/${id}/images`);
          xhr.upload.onprogress = (event) => { if (event.lengthComputable) setProgress(Math.round(((index + event.loaded / event.total) / files.length) * 100)); };
          xhr.onload = () => { let result; try { result = JSON.parse(xhr.responseText); } catch { reject(new Error("อัปโหลดไม่สำเร็จ")); return; } if (xhr.status >= 200 && xhr.status < 300) resolve(result); else reject(new Error(result.error || "อัปโหลดไม่สำเร็จ")); };
          xhr.onerror = () => reject(new Error("เครือข่ายขัดข้อง")); xhr.send(data);
        });
        setImages((current) => [...current, saved]);
      } catch (cause) { setError(cause instanceof Error ? cause.message : "อัปโหลดไม่สำเร็จ"); break; }
    }
    setProgress(0); router.refresh();
  }
  async function imageAction(imageId: string, action: "cover" | "swap", other_id?: string) {
    setError("");
    const response = await fetch(`/api/admin/images/${imageId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, other_id }) });
    if (!response.ok) { setError((await response.json()).error || "บันทึกภาพไม่สำเร็จ"); return; }
    if (action === "cover") setImages((current) => current.map((image) => ({ ...image, is_cover: image.id === imageId })));
    if (action === "swap") setImages((current) => {
      const first = current.find((image) => image.id === imageId); const second = current.find((image) => image.id === other_id);
      if (!first || !second) return current;
      return current.map((image) => image.id === imageId ? { ...image, sort_order: second.sort_order } : image.id === other_id ? { ...image, sort_order: first.sort_order } : image).sort((a, b) => a.sort_order - b.sort_order);
    });
    router.refresh();
  }
  async function deleteImage(imageId: string) {
    if (!window.confirm("ลบภาพนี้?")) return;
    const response = await fetch(`/api/admin/images/${imageId}`, { method: "DELETE" });
    if (!response.ok) { setError((await response.json()).error || "ลบภาพไม่สำเร็จ"); return; }
    setImages((current) => current.filter((image) => image.id !== imageId)); router.refresh();
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return <div className="admin-editor-layout"><form ref={formRef} className="admin-form admin-editor" onSubmit={save}>
    <div className="admin-form-grid"><label>รหัสทรัพย์<input name="property_code" required minLength={3} defaultValue={field(initial?.property_code)} placeholder="TV-0001" /></label><label>Slug URL<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={field(initial?.slug)} placeholder="villa-phuket-001" /></label><label className="admin-span">ชื่อประกาศ<input name="title" required minLength={5} defaultValue={field(initial?.title)} /></label><label className="admin-span">รายละเอียด<textarea name="description" rows={6} defaultValue={field(initial?.description)} /></label><label>ประเภททรัพย์<select name="property_type" defaultValue={field(initial?.property_type) || propertyTypes[0]}>{propertyTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>ราคาเสนอขาย (บาท)<input name="price" type="number" min="1" step="0.01" required defaultValue={field(initial?.price)} /></label><label>จังหวัด<input name="province" required defaultValue={field(initial?.province)} /></label><label>อำเภอ / เขต<input name="district" required defaultValue={field(initial?.district)} /></label><label>ตำบล / แขวง<input name="subdistrict" defaultValue={field(initial?.subdistrict)} /></label><label>พื้นที่ใช้สอย (ตร.ม.)<input name="usable_area_sqm" type="number" min="0" step="0.01" defaultValue={field(initial?.usable_area_sqm)} /></label></div>
    <fieldset><legend>ขนาดที่ดิน</legend><div className="admin-form-grid"><label>ไร่<input type="number" min="0" step="1" value={rai} onChange={(e) => setRai(e.target.value)} /></label><label>งาน<input type="number" min="0" step="1" value={ngan} onChange={(e) => setNgan(e.target.value)} /></label><label>ตารางวา<input type="number" min="0" step="0.01" value={wa} onChange={(e) => setWa(e.target.value)} /></label><span>รวม {((Number(rai) * 400 + Number(ngan) * 100 + Number(wa)) * 4).toLocaleString("th-TH")} ตร.ม.</span></div></fieldset>
    <div className="admin-form-grid"><label>ห้องนอน<input name="bedrooms" type="number" min="0" defaultValue={field(initial?.bedrooms)} /></label><label>ห้องน้ำ<input name="bathrooms" type="number" min="0" defaultValue={field(initial?.bathrooms)} /></label><label>ที่จอดรถ<input name="parking" type="number" min="0" defaultValue={field(initial?.parking)} /></label><label>สถานะ<select name="status" defaultValue={field(initial?.status) || "draft"}><option value="draft">แบบร่าง</option><option value="available">พร้อมขาย</option><option value="reserved">จองแล้ว</option><option value="sold">ขายแล้ว</option></select></label><label>ละติจูด<input name="latitude" type="number" step="0.000001" min="-90" max="90" defaultValue={field(initial?.latitude)} /></label><label>ลองจิจูด<input name="longitude" type="number" step="0.000001" min="-180" max="180" defaultValue={field(initial?.longitude)} /></label></div>
    <div className="admin-checks"><label><input type="checkbox" name="is_featured" defaultChecked={Boolean(initial?.is_featured)} /> ประกาศเด่น</label><label><input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} /> เผยแพร่บนเว็บไซต์</label></div>
    {error && <p className="field-error" role="alert">{error}</p>}{message && <p className="admin-success" role="status">{message}</p>}
    <div className="admin-editor-actions"><button type="submit" disabled={busy}>{busy ? "กำลังบันทึก…" : publish ? "บันทึกและเผยแพร่" : "บันทึกแบบร่าง"}</button>{id && canDelete && <button type="button" className="admin-danger" disabled={busy} onClick={removeProperty}>ลบประกาศ</button>}</div>
  </form><aside className="admin-images"><h2>ภาพอสังหาริมทรัพย์</h2><p>รองรับ JPG, PNG, WebP สูงสุด 10 MB ต่อภาพ บันทึกประกาศก่อนเพิ่มภาพ</p><label className="admin-upload">เพิ่มภาพหลายภาพ<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={!id} onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} /></label><label className="admin-upload admin-camera">ถ่ายภาพด้วยกล้อง<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={!id} onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} /></label>{progress > 0 && <div className="admin-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>}<div className="admin-image-list">{images.map((image, index) => <div key={image.id} className="admin-image-item"><img src={base ? `${base}/storage/v1/object/public/property-images/${image.storage_path.split("/").map(encodeURIComponent).join("/")}` : ""} alt={image.alt_text || `ภาพที่ ${index + 1}`} /><div><strong>{image.is_cover ? "ภาพปก" : `ภาพที่ ${index + 1}`}</strong><div className="admin-image-actions"><button type="button" disabled={image.is_cover} onClick={() => imageAction(image.id, "cover")}>ตั้งปก</button><button type="button" disabled={index === 0} onClick={() => imageAction(image.id, "swap", images[index - 1].id)}>ขึ้น</button><button type="button" disabled={index === images.length - 1} onClick={() => imageAction(image.id, "swap", images[index + 1].id)}>ลง</button><button type="button" onClick={() => deleteImage(image.id)}>ลบ</button></div></div></div>)}{!images.length && <p>ยังไม่มีภาพ</p>}</div></aside></div>;
}
