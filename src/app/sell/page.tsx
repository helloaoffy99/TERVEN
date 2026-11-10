import type { Metadata } from "next";
import { SellerForm } from "@/components/seller-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "ฝากขายอสังหาริมทรัพย์ | TERVÉN", description: "ส่งข้อมูลอสังหาริมทรัพย์เพื่อให้ TERVÉN ติดต่อกลับเรื่องการฝากขาย" };

export default function SellPage() {
  const enabled = process.env.SUBMISSIONS_ENABLED === "true" && Boolean(process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL);
  return <main className="inner-page"><section className="page-hero sell-page-hero"><div className="container"><span className="section-kicker">SELL WITH TERVÉN</span><h1>ทรัพย์ของคุณ สมควรได้รับการนำเสนออย่างดีที่สุด</h1><p>ส่งข้อมูลอสังหาริมทรัพย์เพื่อให้ผู้ดูแลติดต่อกลับ</p></div></section><section className="container seller-layout"><div className="seller-intro"><span className="section-kicker">YOUR PROPERTY, YOUR STORY</span><h2>เริ่มจากข้อมูล<br /><em>ที่สำคัญ</em></h2><p>กรอกข้อมูลพื้นฐานเกี่ยวกับทรัพย์และช่องทางติดต่อกลับ</p>{!enabled && <div className="sample-banner"><strong>ยังไม่เปิดรับข้อมูล</strong><span>ระบบกำลังตั้งค่า โปรดรอการเปิดใช้งานก่อนส่งข้อมูลส่วนตัว</span></div>}</div><SellerForm enabled={enabled} /></section></main>;
}
