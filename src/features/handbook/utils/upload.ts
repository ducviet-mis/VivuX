import { getSupabaseClient } from '@/lib/supabase/client';

export async function uploadHandbookImage(file: File): Promise<string | null> {
  const supabase = getSupabaseClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`; // Bucket root

  const { error } = await supabase.storage
    .from('handbook_images')
    .upload(filePath, file);

  if (error) {
    console.error('Upload error:', error);
    alert('Lỗi tải ảnh: ' + error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('handbook_images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
