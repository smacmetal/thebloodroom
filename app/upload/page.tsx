import RoleImageUploader from "@/components/RoleImageUploader";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <RoleImageUploader />
    </main>
  );
}
