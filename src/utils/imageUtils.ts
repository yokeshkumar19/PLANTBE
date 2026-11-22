/**
 * Utility for generating lightweight, persistent Base64 thumbnails from user uploaded files.
 * Storing Base64 Data URLs ensures scan images persist in localStorage across page reloads
 * and app restarts, unlike ephemeral blob: URLs which are revoked or garbage collected.
 */
export async function createThumbnailDataUrl(
  file: File,
  maxDim = 240,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      // Safety timeout: resolve if image loading hangs
      const timeout = setTimeout(() => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
        fallbackFileReader(file).then(resolve);
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          URL.revokeObjectURL(objectUrl);
          let width = img.width || 200;
          let height = img.height || 200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            fallbackFileReader(file).then(resolve);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch {
          fallbackFileReader(file).then(resolve);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
        fallbackFileReader(file).then(resolve);
      };

      img.src = objectUrl;
    } catch {
      fallbackFileReader(file).then(resolve);
    }
  });
}

/**
 * Fallback to standard FileReader if canvas processing is unavailable
 */
function fallbackFileReader(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      // If file is very large (> 1MB), avoid bloating localStorage
      if (file.size > 1024 * 1024) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve((reader.result as string) || "");
      };
      reader.onerror = () => {
        resolve("");
      };
      reader.readAsDataURL(file);
    } catch {
      resolve("");
    }
  });
}
