import Link from "next/link";

export default function NotFound() {
  return <main className="not-found-page"><div className="container"><span className="section-kicker">404 / PAGE NOT FOUND</span><h1>ไม่พบหน้าที่คุณกำลังมองหา</h1><p>ลิงก์อาจเปลี่ยนไป หรือหน้านี้ยังไม่มีในเว็บไซต์</p><div><Link className="dark-button" href="/">กลับหน้าแรก →</Link><Link className="outline-button" href="/properties">ดูอสังหาริมทรัพย์ →</Link></div></div></main>;
}
