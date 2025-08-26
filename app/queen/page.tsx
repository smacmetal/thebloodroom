 // C:\Users\steph\thebloodroom\app\queen\page.tsx
import Temple from "@/app/components/Temple";
import { createClient } from "@/utils/supabase/server";

export default async function QueenPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <Temple
      chamberLabel="Queen"
      title="👑 The Queen’s Temple"
      placeholder="Speak, Queen…"
      sendButtonColor="#c61a5e"
      user={user}  // 👈 NEW: pass Supabase user
    />
  );
}

