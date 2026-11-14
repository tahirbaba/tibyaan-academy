import { CohortsAdminClient } from "./cohorts-client";

// Access is enforced by the admin layout (role check) and again, against the
// database role, by every /api/admin/cohorts route this page calls.
export default function AdminCohortsPage() {
  return <CohortsAdminClient />;
}
