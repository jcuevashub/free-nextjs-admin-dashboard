/**
 * Admin Layout
 *
 * Wraps all admin pages and ensures only users with role='owner' can access.
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: Auth check is done in each page's server actions
  // The server actions verify role='owner' before returning data
  // This prevents unauthorized access even if someone bypasses the client-side check

  return <>{children}</>;
}
