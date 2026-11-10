import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminSignOut } from "@/components/admin-signout";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await requireAdmin();
  return <main className="admin-shell"><header className="admin-head"><div><Link href="/admin" className="admin-brand">TERVÉN <span>ADMIN</span></Link><p>{user.email} · {role}</p></div><AdminSignOut /></header><nav className="admin-nav" aria-label="เมนูผู้ดูแล"><Link href="/admin">ภาพรวม</Link><Link href="/admin/properties">ประกาศ</Link><Link href="/admin/submissions">คำขอฝากขาย</Link><Link href="/">ดูเว็บไซต์</Link></nav>{children}</main>;
}
