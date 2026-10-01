import { getTranslations } from "next-intl/server";
import { MyNotifications } from "@/components/shared/my-notifications";

// Access is enforced by the middleware (proxy.ts) for /teacher routes.
export default async function TeacherNotificationsPage() {
  const t = await getTranslations("teacher");
  return <MyNotifications heading={t("sidebarNotifications")} />;
}
