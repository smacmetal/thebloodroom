 import WorkroomPro from "@/app/components/WorkroomPro";

export default function WorkroomPage() {
  return (
    <main className="min-h-dvh">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-rose-300">Workroom</h1>
          <p className="text-rose-200/80 mt-1">
            Focus mode. No sanctum audio or effects here—just us doing the work.
          </p>
        </header>

        <WorkroomPro />
      </div>
    </main>
  );
}

