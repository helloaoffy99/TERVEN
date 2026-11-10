import { HomeContent } from "@/components/home-content";
import { listPublicProperties } from "@/lib/live-properties";

export default async function HomePage() {
  return <HomeContent properties={await listPublicProperties()} intakeEnabled={process.env.SUBMISSIONS_ENABLED === "true" && Boolean(process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL)} />;
}
