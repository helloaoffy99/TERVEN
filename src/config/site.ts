export const siteContact = {
  phone: null as string | null,
  lineUrl: "https://lin.ee/58K7r2K" as string | null,
  email: null as string | null,
  officeAddress: null as string | null,
};

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://127.0.0.1:3000");
  try { return new URL(configured); } catch { return new URL("http://127.0.0.1:3000"); }
}
