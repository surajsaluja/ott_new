const imageBlobCache = new Map(); // url → blob URL
const listeners = new Map();      // url → Set<callback>
const loading = new Set();        // urls currently loading

let currentBaseUrl = null;

export const clearCacheOnBaseUrlChange = (newBaseUrl) => {
  if (newBaseUrl === currentBaseUrl) return;

  console.log(`[Cache] Base URL changed: clearing old cache...`);
  for (const [url, blobUrl] of imageBlobCache.entries()) {
    if (url.startsWith(currentBaseUrl)) {
      URL.revokeObjectURL(blobUrl);
      imageBlobCache.delete(url);
      console.log(`[Cache] Cleared blob for ${url}`);
    }
  }

  currentBaseUrl = newBaseUrl;
};

export const preloadImageBlob = (url) => {
  if (imageBlobCache.has(url)) {
    console.log(`[Cache] Image already cached for URL: ${url}`);
    return;
  }
  if (loading.has(url)) {
    console.log(`[Cache] Image already loading for URL: ${url}`);
    return;
  }

  loading.add(url);
  console.log(`[Fetch] Starting fetch for URL: ${url}`);

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
      return res.blob();
    })
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      imageBlobCache.set(url, objectUrl);
      console.log(`[Cache] Image loaded and cached for URL: ${url}`);
      notify(url, objectUrl);
    })
    .catch((err) => {
      console.warn(`[Cache] Failed to load image for URL: ${url}`, err);
      notify(url, null);
    })
    .finally(() => loading.delete(url));
};

export const getCachedImageUrl = (url) => {
  const cached = imageBlobCache.get(url);
  if (cached) {
    console.log(`[Cache] Cache hit for URL: ${url}`);
  } else {
    console.log(`[Cache] Cache miss for URL: ${url}`);
  }
  return cached || null;
};

export const subscribeToImage = (url, callback) => {
  if (!listeners.has(url)) listeners.set(url, new Set());
  listeners.get(url).add(callback);
};

export const unsubscribeFromImage = (url, callback) => {
  listeners.get(url)?.delete(callback);
};

const notify = (url, blobUrl) => {
  listeners.get(url)?.forEach((cb) => cb(blobUrl));
};
