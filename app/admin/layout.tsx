import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!["ADMIN", "STAFF"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <AdminShell user={{ name: session.user.name ?? "", email: session.user.email ?? "" }}>
      {children}
    </AdminShell>
  );
}
