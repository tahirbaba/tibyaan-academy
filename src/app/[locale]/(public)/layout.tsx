import { SiteMotion } from "@/components/shared/site-motion";
import { PageBackdrop } from "@/components/shared/backdrop-video";

/**
 * Every public page: the shared motion layer (moving headings, cards that
 * lean toward the cursor). Pages keep their own Navbar/Footer as before.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteMotion variant="public" />
      <PageBackdrop />
    </>
  );
}
