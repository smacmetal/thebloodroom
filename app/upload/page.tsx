 import RoleImageUploader from "@/app/components/RoleImageUploader";

export const metadata = {
  title: "Upload — The Bloodroom",
};

export default function UploadPage() {
  return (
    <main className="min-h-screen p-6 bg-[#0b0709] text-[#fbe9ed]">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-2xl border border-[#4b2228] bg-[#261217] p-6">
          <h1 className="text-2xl font-bold text-[#ffe0e7]">Upload</h1>
          <p className="mt-2 text-sm text-[#e0a8b1]">
            Add an image to a chamber’s wall. Uses signed Blob upload if configured,
            else falls back to the server uploader.
          </p>
        </div>

        <RoleImageUploader />
      </div>
    </main>
  );
}

