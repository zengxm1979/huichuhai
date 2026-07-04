import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HomePageSections } from "@/components/marketing/HomePageSections";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HomePageSections />
      </main>
      <SiteFooter />
    </>
  );
}
