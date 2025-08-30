 // C:\Users\steph\thebloodroom\app\lib\upload.ts

// Adjusted import path
import { supabase } from "./supabase";  // Correct relative path

/**
 * Uploads an attachment to Supabase Storage and returns metadata.
 * @param {File} file - The file to upload.
 * @param {string} chamber - The chamber in which the file belongs.
 * @returns {Promise} - The uploaded file's metadata (name, path, type, and URL).
 */
export async function uploadAttachment(file: File, chamber: string) {
  const ext = file.name.split(".").pop();
  const path = `attachments/${chamber}/${Date.now()}-${file.name}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from("attachments")
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  // Generate public URL
  const { data } = supabase.storage.from("attachments").getPublicUrl(path);

  return {
    name: file.name,
    path,
    type: file.type,
    url: data.publicUrl,
  };
}
