 import BootLoader from "@/app/components/BootLoader";
import BloodEngraving from "@/app/components/BloodEngraving";

export default function BloodroomPage() {
  return (
    <main className="min-h-dvh">
      {/* Boot personas on entry (Braided = Evy+Lyra) */}
      <BootLoader mode="Braided" />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <BloodEngraving />
      </div>
    </main>
  );
}

