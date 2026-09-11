/**
 * Safe client-side image compression & optimization helper.
 * Automatically resizes large images down to web-friendly dimensions
 * so they fit comfortably within Firestore's 1MB document size limit
 * and localStorage quotas without failing or lagging.
 */

export async function compressImageFile(
  file: File,
  maxWidth = 480,
  maxHeight = 480,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's SVG, base64 dataURL directly since it's already vector
    if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal membaca file SVG.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Enable high quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas (cleared canvas preserves alpha channel)
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const isTransparent = 
          file.type === 'image/png' || 
          file.type === 'image/webp' || 
          file.type === 'image/gif' ||
          /\.(png|webp|gif)$/i.test(file.name);

        let resultDataUrl = '';

        if (isTransparent) {
          // Attempt WebP first for ultra-lightweight size with full alpha channel support
          try {
            const webpUrl = canvas.toDataURL('image/webp', quality);
            if (webpUrl.startsWith('data:image/webp') && webpUrl.length < 500000) {
              resultDataUrl = webpUrl;
            } else {
              resultDataUrl = canvas.toDataURL('image/png');
            }
          } catch {
            resultDataUrl = canvas.toDataURL('image/png');
          }

          // If PNG is still quite heavy (> 600KB), fallback to webp or compressed PNG
          if (resultDataUrl.length > 700000) {
            try {
              const fallbackWebp = canvas.toDataURL('image/webp', 0.82);
              if (fallbackWebp.startsWith('data:image/webp')) {
                resultDataUrl = fallbackWebp;
              }
            } catch {}
          }
        } else {
          resultDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(resultDataUrl);
      };
      img.onerror = () => reject(new Error('Format gambar tidak dapat diproses oleh browser.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas file gambar.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Normalizes external image URLs (e.g. Google Drive, Dropbox, GitHub) into
 * direct embeddable image URLs so browsers can render them without CORS/HTML viewer blocks.
 */
export function normalizeImageUrl(inputUrl: string): string {
  if (!inputUrl) return '';
  let url = inputUrl.trim();

  // 1. Google Drive Links:
  // Examples:
  // https://drive.google.com/file/d/1B.../view?usp=sharing
  // https://drive.google.com/open?id=1B...
  // https://drive.google.com/uc?id=1B...
  // https://drive.google.com/uc?export=view&id=1B...
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                        url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 2. Imgur Links:
  // e.g. https://imgur.com/abc1234 -> https://i.imgur.com/abc1234.png
  if (url.includes('imgur.com/') && !url.includes('i.imgur.com/')) {
    const match = url.match(/imgur\.com\/(?:gallery\/|a\/)?([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      return `https://i.imgur.com/${match[1]}.png`;
    }
  }

  // 3. Dropbox Links:
  // e.g. https://www.dropbox.com/s/xyz/logo.png?dl=0 -> raw=1
  if (url.includes('dropbox.com')) {
    return url.replace(/\?dl=0$/, '?raw=1').replace(/&dl=0$/, '&raw=1');
  }

  // 4. GitHub Blob Links:
  // e.g. https://github.com/user/repo/blob/main/logo.png -> raw.githubusercontent.com
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  return url;
}

/**
 * Checks if a given image URL can be loaded successfully by the browser.
 */
export function checkImageUrlCanLoad(url: string, timeoutMs = 7000): Promise<{ ok: boolean; reason?: string }> {
  return new Promise((resolve) => {
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/'))) {
      resolve({ ok: false, reason: 'URL harus diawali dengan https:// atau /' });
      return;
    }

    const img = new Image();
    // Use no-referrer to prevent hotlink blocks by Google Drive, Imgur, etc.
    img.referrerPolicy = 'no-referrer';
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        // On slow connections, resolve ok to not block user
        resolve({ ok: true }); 
      }
    }, timeoutMs);

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve({ ok: true });
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        // If it's a valid https link, resolve ok with a soft warning or let user proceed
        resolve({
          ok: false,
          reason: 'Browser tidak dapat memuat gambar dari tautan ini. Jika menggunakan Google Drive, pastikan file sudah disetel ke "Siapa saja yang memiliki link / Publik".'
        });
      }
    };

    img.src = url;
  });
}

