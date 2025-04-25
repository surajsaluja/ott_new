import { useRef } from "react";
import { getDeviceOS, getDeviceId, getDeviceName } from './deviceInfo'

let modalOpener = null;

let scrollAnimationFrame = null;

const easeInOutQuad = (t) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const linear = (t) => t;


export const getResizedOptimizedImage = (url, width, height) => {
  if (width && height)
    return url + "?im=Resize,width=" + width + ",height=" + height;
  else if (width && !height)
    return url + "?im=Resize,width=" + width;
  else if (!width && height)
    return url + "?im=Resize,height=" + height;
  else
    return url;
};

export const sanitizeAndResizeImage = (url, width) => {
  if (!url) return null;
  const lastPart = url.substring(url.lastIndexOf("/") + 1)
    .replace(/ /g, "%20")
    .replace("(", "%28")
    .replace(")", "%29");
  const sanitizedUrl = url.substring(0, url.lastIndexOf("/") + 1) + lastPart;
  return getResizedOptimizedImage(sanitizedUrl, width, null);
};


export const processPlaylistItems = (items) => {
  return items.map((item) => ({
    ...item,
    webThumbnail: sanitizeAndResizeImage(item.webThumbnail, 450),
    fullPageBanner: sanitizeAndResizeImage(item.fullPageBanner, 1920),
  }));
};

export const getProcessedPlaylists = (playlists, horizontalLazyLoadLimit = 10) => {
  return playlists.map((playlist) => {
    const items = processPlaylistItems(playlist.playlistItems || []);
    let modifiedItems = items.slice();

    if (playlist.playListId !== "0") {
      modifiedItems = modifiedItems.slice(0, horizontalLazyLoadLimit);

      if (items.length >= horizontalLazyLoadLimit) {
        const lastItem = modifiedItems[modifiedItems.length - 1];
        modifiedItems.push({
          ...lastItem,
          isSeeMore: true,
          bgHplColor: "black",
        });
      }
    }

    return {
      ...playlist,
      playlistItems: modifiedItems,
    };
  });
};

export const useThrottle = (callback, delay) => {
  const lastCall = useRef(0);

  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  };
};

export const getProcessedPlaylistsWithContinueWatch = (playlist, continueWatchData) => {
  if (
    continueWatchData &&
    continueWatchData.length > 0
  ) {
    const continueWatchPlaylist = {
      playListId: 0,
      playListTypeId: 0,
      playlistName: 'Continue Watch',
      playlistType: null,
      height: null,
      width: null,
      playlistItems: continueWatchData,
    };

    // Add "Continue Watch" playlist to the beginning
    playlist.unshift(continueWatchPlaylist);
  }

  return playlist;
}


export const getSanitizedToken = () => {
  let token = localStorage.getItem('jwttoken');
  return token ? `Bearer ${token.replace('Bearer ', '').replace(/"/g, '')}` : null;
};

export const getDeviceInfo = () => {
  const deviceInfo = {
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
    deviceOS: getDeviceOS()
  }
  return deviceInfo;
}

export const smoothScroll = (element, target, duration = 200, direction = "horizontal") => {
  if (scrollAnimationFrame) cancelAnimationFrame(scrollAnimationFrame);

  const start = direction === "horizontal" ? element.scrollLeft : element.scrollTop;
  const change = target - start;
  const startTime = performance.now();

  const animateScroll = (currentTime) => {
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easingFunction = direction === 'horizontal' ? linear : easeInOutQuad;
    const newVal = start + change * easingFunction(progress);

    if (direction === "horizontal") {
      element.scrollLeft = newVal;
    } else {
      element.scrollTop = newVal;
    }

    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(animateScroll);
    }
  };

  scrollAnimationFrame = requestAnimationFrame(animateScroll);
};


export const setModalOpener = (fn) => {
  modalOpener = fn;
};

export const showModal = (title = 'Title', description = 'Short description', buttons = []) => {
  if (modalOpener) {
    modalOpener({ title, description, buttons });
  } else {
    console.warn('Modal opener not set yet.');
  }
};
