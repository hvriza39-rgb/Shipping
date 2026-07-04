import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserLayout from "@/components/user/UserLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN" || session.user.role === "STAFF") {
    redirect("/admin/dashboard");
  }

  return (
    <UserLayout user={{ name: session.user.name ?? "", email: session.user.email ?? "" }}>
      {children}
    </UserLayout>
  );
}
