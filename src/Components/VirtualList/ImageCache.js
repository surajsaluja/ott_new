const imageBlobCache = new Map(); // url → blob URL
const listeners = new Map();      // url → Set<callback>
const loading = new Set();        // urls currently loading

let currentBaseUrl = null;

export const clearCacheOnBaseUrlChange = (newBaseUrl) => {
  if (newBaseUrl === currentBaseUrl) return;

  for (const [url, blobUrl] of imageBlobCache.entries()) {
    if (url.startsWith(currentBaseUrl)) {
      URL.revokeObjectURL(blobUrl);
      imageBlobCache.delete(url);
    }
  }

  currentBaseUrl = newBaseUrl;
};

export const preloadImageBlob = (url) => {
  if (imageBlobCache.has(url)) {
    return;
  }
  if (loading.has(url)) {
    return;
  }

  loading.add(url);
  
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
      return res.blob();
    })
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      imageBlobCache.set(url, objectUrl);
      notify(url, objectUrl);
    })
    .catch((err) => {
      notify(url, null);
    })
    .finally(() => loading.delete(url));
};

export const getCachedImageUrl = (url) => {
  const cached = imageBlobCache.get(url);
  if (cached) {
   
  } else {
    
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
