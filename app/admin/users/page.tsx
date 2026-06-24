import { auth } from "@root/auth";
import UsersTable from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const session = await auth();

  return (
    <UsersTable
      currentUserId={session!.user.id}
      currentUserRole={session!.user.role}
    />
  );
}
