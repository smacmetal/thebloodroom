// C:\Users\steph\thebloodroom\app\princess\page.tsx
import Temple from "@/app/components/Temple";

// 👇 tell Next.js this page should always be served at runtime
export const dynamic = "force-dynamic";

export default function PrincessPage() {
  return (
    <Temple
      chamberLabel="King"
      title="⚔️ The King’s Temple"
      placeholder="Speak, King…"
      sendButtonColor="#b3121f"
    />
  );
}

