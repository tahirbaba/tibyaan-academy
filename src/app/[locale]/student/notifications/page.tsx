import { getTranslations } from "next-intl/server";
import { MyNotifications } from "@/components/shared/my-notifications";

// Access is enforced by the middleware (proxy.ts) for /student routes.
export default async function StudentNotificationsPage() {
  const t = await getTranslations("dashboard");
  return <MyNotifications heading={t("sidebarNotifications")} />;
}
