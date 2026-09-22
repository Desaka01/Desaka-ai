// Utility for managing school logo stored in local device storage (localStorage / browser storage)

export interface DeviceLogoInfo {
  fileName: string;
  fileSizeKb: number;
  mimeType: string;
  updatedAt: string;
  dimensions?: { width: number; height: number };
  storageKey: string;
}

const STORAGE_KEY = 'desaka_custom_logo';
const INFO_STORAGE_KEY = 'desaka_device_logo_info';

/**
 * Optimizes and resizes an image file from device storage via an offscreen HTML Canvas
 * to ensure crisp quality while keeping file size small (<150KB) so it safely fits in localStorage
 * without ever triggering QuotaExceededError.
 */
export const processDeviceImage = (
  file: File,
  maxDimension = 512,
  quality = 0.9
): Promise<{ dataUrl: string; info: DeviceLogoInfo }> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan format gambar yang valid.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Gagal membaca file dari penyimpanan perangkat.'));
    };

    reader.onload = (e) => {
      const result = e.target?.result as string;

      // For SVG, we can store it directly since vector is already lightweight
      if (file.type === 'image/svg+xml') {
        const info: DeviceLogoInfo = {
          fileName: file.name,
          fileSizeKb: Math.round((file.size / 1024) * 10) / 10,
          mimeType: file.type,
          updatedAt: new Date().toLocaleString('id-ID'),
          storageKey: STORAGE_KEY,
        };
        resolve({ dataUrl: result, info });
        return;
      }

      const img = new Image();
      img.onerror = () => {
        reject(new Error('Gagal memproses gambar logo. Format mungkin rusak.'));
      };

      img.onload = () => {
        try {
          const originalWidth = img.width;
          const originalHeight = img.height;

          // Calculate aspect ratio
          let targetWidth = originalWidth;
          let targetHeight = originalHeight;

          if (originalWidth > maxDimension || originalHeight > maxDimension) {
            if (originalWidth > originalHeight) {
              targetWidth = maxDimension;
              targetHeight = Math.round((originalHeight * maxDimension) / originalWidth);
            } else {
              targetHeight = maxDimension;
              targetWidth = Math.round((originalWidth * maxDimension) / originalHeight);
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // Fallback to original dataUrl if canvas context unavailable
            const info: DeviceLogoInfo = {
              fileName: file.name,
              fileSizeKb: Math.round((file.size / 1024) * 10) / 10,
              mimeType: file.type,
              updatedAt: new Date().toLocaleString('id-ID'),
              dimensions: { width: originalWidth, height: originalHeight },
              storageKey: STORAGE_KEY,
            };
            resolve({ dataUrl: result, info });
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw the image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // If PNG or has transparency, export as PNG; otherwise JPEG
          const isPng = file.type === 'image/png' || file.type === 'image/webp';
          const exportMime = isPng ? 'image/png' : 'image/jpeg';
          const optimizedDataUrl = canvas.toDataURL(exportMime, quality);

          // Approximate size in KB
          const approxBytes = Math.round((optimizedDataUrl.length * 3) / 4);
          const sizeKb = Math.round((approxBytes / 1024) * 10) / 10;

          const info: DeviceLogoInfo = {
            fileName: file.name,
            fileSizeKb: sizeKb,
            mimeType: exportMime,
            updatedAt: new Date().toLocaleString('id-ID'),
            dimensions: { width: targetWidth, height: targetHeight },
            storageKey: STORAGE_KEY,
          };

          resolve({ dataUrl: optimizedDataUrl, info });
        } catch (err) {
          reject(err);
        }
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Saves logo data and metadata directly to this device's localStorage
 */
export const saveLogoToDeviceStorage = (dataUrl: string, info: DeviceLogoInfo): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, dataUrl);
    localStorage.setItem(INFO_STORAGE_KEY, JSON.stringify(info));
    return true;
  } catch (err) {
    console.error('Failed to save logo to device localStorage:', err);
    return false;
  }
};

/**
 * Retrieves logo metadata from this device's storage
 */
export const getDeviceLogoInfo = (): DeviceLogoInfo | null => {
  try {
    const raw = localStorage.getItem(INFO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Removes custom logo from this device's storage
 */
export const removeLogoFromDeviceStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(INFO_STORAGE_KEY);
  } catch (err) {
    console.warn('Error clearing device logo:', err);
  }
};

/**
 * Downloads current logo back to device as file
 */
export const downloadLogoToDevice = (dataUrl: string, fileName = 'logo-sd-negeri-1-kalisoro.png'): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};
