import EnrollmentRequestsClient from "./enrollment-requests-client";

// admin/layout.tsx already enforces the session and the admin role and renders
// <AdminShell>. This page used to do both again, which is why it was the only
// admin page that drew a second sidebar.
export default function EnrollmentRequestsPage() {
  return <EnrollmentRequestsClient />;
}
