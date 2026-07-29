"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadProductImages(
  formData: FormData,
): Promise<{ urls: string[] } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const files: File[] = [];
  for (let i = 0; ; i++) {
    const file = formData.get(`file_${i}`) as File | null;
    if (!file) break;
    if (file.size > 0) files.push(file);
  }

  if (files.length === 0) return { urls: [] };

  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) return { error: uploadError.message };

    const { data: publicUrl } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    urls.push(publicUrl.publicUrl);
  }

  return { urls };
}
