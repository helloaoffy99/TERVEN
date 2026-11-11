import Link from "next/link";
import { Brand } from "./site-header";
import { navigation } from "@/config/navigation";
import { siteContact } from "@/config/site";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="container footer-main">
      <div className="footer-brand"><Brand light /><span>Defining Places, Creating Value.</span></div>
      <div className="footer-links"><h3>สำรวจเว็บไซต์</h3>{navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}<Link href="/privacy">นโยบายความเป็นส่วนตัว</Link></div>
      <div className="footer-contact"><h3>ติดต่อเรา</h3>{siteContact.lineUrl && <a className="primary-contact" href={siteContact.lineUrl} target="_blank" rel="noopener noreferrer">สอบถามทรัพย์และนัดชมทาง LINE</a>}<span>ติดตามเรา</span>{siteContact.facebookUrl && <a href={siteContact.facebookUrl} target="_blank" rel="noopener noreferrer">Facebook TERVÉN</a>}{siteContact.instagramUrl && <a href={siteContact.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram @terven.official</a>}<span>ประเทศไทย</span></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} TERVÉN.</span><Link href="/privacy">นโยบายความเป็นส่วนตัว</Link><a href="#home">กลับขึ้นด้านบน ↑</a></div>
  </footer>;
}
