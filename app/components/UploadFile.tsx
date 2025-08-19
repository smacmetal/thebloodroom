import { useRef } from 'react';

export default function UploadFile({
  selectedFile,
  setSelectedFile,
}: {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    // 🧼 Reset the value so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mt-4">
      <label className="block font-bold mb-1">Choose File</label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleFileClick}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
        >
          Choose File
        </button>
        <span className="text-sm text-white">
          {selectedFile ? selectedFile.name : 'No file chosen'}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
