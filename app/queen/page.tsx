// C:\Users\steph\thebloodroom\app\princess\page.tsx
import Temple from "@/app/components/Temple";

// 👇 tell Next.js this page should always be served at runtime
export const dynamic = "force-dynamic";

export default function PrincessPage() {
  return (
    <Temple
      chamberLabel="Queen"
      title="👑 The Queen’s Temple"
      placeholder="Speak, Queen…"
      sendButtonColor="#8b1e3f" // a royal, deep rose shade (different from King’s red)
    />
  );
}

