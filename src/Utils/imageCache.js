// imageCache.js
const MAX_CACHE_SIZE = 100;
const imageCache = new Map();
const accessQueue = []; // Track access order for LRU (Least Recently Used) eviction

export const getCachedImage = (url) => {
  if (imageCache.has(url)) {
    // Update access time by moving to end of queue
    const index = accessQueue.indexOf(url);
    if (index > -1) {
      accessQueue.splice(index, 1);
    }
    accessQueue.push(url);
    return imageCache.get(url);
  }
  return null;
};

export const setCachedImage = (url, image) => {
  // If cache is full, remove the least recently used item
  if (imageCache.size >= MAX_CACHE_SIZE) {
    const oldestUrl = accessQueue.shift();
    if (oldestUrl) {
      imageCache.delete(oldestUrl);
    }
  }

  // Add new image to cache
  imageCache.set(url, image);
  accessQueue.push(url); // Track as most recently used
};

export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const cached = getCachedImage(url);
    if (cached) {
      resolve(cached);
      return;
    }

    const img = new Image();
    img.src = url;
    
    img.onload = () => {
      setCachedImage(url, img);
      resolve(img);
    };
    
    img.onerror = (error) => {
      // Remove from queue if it was added during loading
      const index = accessQueue.indexOf(url);
      if (index > -1) {
        accessQueue.splice(index, 1);
      }
      reject(error);
    };
  });
};

// Optional: Add cache clearing functionality
export const clearImageCache = () => {
  imageCache.clear();
  accessQueue.length = 0;
};

// Optional: Get current cache size
export const getCacheSize = () => imageCache.size;