/**
 * Compress image to target size (max 700 KB)
 * Used for profile picture uploads
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 700
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if needed
        const maxWidth = 800;
        const maxHeight = 800;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress with quality adjustment
        let quality = 0.8;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Reduce quality if still too large
        while (dataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (dataUrl.length / 1024 > maxSizeKB) {
          reject(
            new Error(
              `Image still too large after compression: ${(dataUrl.length / 1024).toFixed(2)} KB`
            )
          );
          return;
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image type. Use JPEG, PNG, WebP, or GIF.' };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'Image too large. Max 5 MB.' };
  }

  return { valid: true };
}
