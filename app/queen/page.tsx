 // app/queen/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function QueenPage() {
  const supabase = createServerComponentClient({ cookies });

  // 1. Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login"); // not logged in
  }

  // 2. Lookup role from User table
  const { data: userRow } = await supabase
    .from("User")
    .select("role")
    .eq("auth_id", session.user.id)
    .single();

  if (!userRow || (userRow.role !== "admin" && userRow.role !== "queen")) {
    redirect("/"); // no permission
  }

  // 3. Show the Queen’s chamber if allowed
  return (
    <main className="p-6 text-rose-200">
      <h1 className="text-3xl font-bold mb-4">👑 Queen’s Chamber</h1>
      <p>Welcome, my Queen. Only you (and admins) may enter here.</p>
    </main>
  );
}

