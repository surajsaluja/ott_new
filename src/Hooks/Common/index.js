import React,{useRef, useState} from "react";

export const getResizedOptimizedImage = (url, width, height) =>{
  if(width && height)
        return url + "?im=Resize,width=" + width + ",height=" + height;
    else if(width && !height)
        return url + "?im=Resize,width=" + width;
    else if(!width && height)
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