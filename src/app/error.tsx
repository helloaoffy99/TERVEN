"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="not-found-page"><div className="container"><span className="section-kicker">TERVÉN</span><h1>ไม่สามารถโหลดข้อมูลได้ในขณะนี้</h1><p>กรุณาลองใหม่อีกครั้ง หากปัญหายังอยู่โปรดติดต่อผู้ดูแลเว็บไซต์</p><button className="dark-button" onClick={reset}>ลองอีกครั้ง</button></div></main>;
}
