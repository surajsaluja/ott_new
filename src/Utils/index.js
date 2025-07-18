import { useRef } from "react";
import { getDeviceOS, getDeviceId, getDeviceName } from './deviceInfo'
import { checkIsUserOnline } from "../Service/AuthService";

let modalOpener = null;

let scrollAnimationFrame = null;

const easeInOutQuad = (t) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const linear = (t) => t;


export const formatTime = (time) => {
  const [h = 0, m = 0, s = 0] = time?.split(":").map(Number);
  if(h == 0 && m == 0 && s==0) return null;
  const styles = {
    grey: { color: "grey" },
    white: { color: "white" },
  };
  const pad = (num) => String(num).padStart(2, "0");

  return (
    <label>
      {h > 0 && <label style={styles.white}>{pad(h)}h </label>}
      {(h > 0 || m > 0) && <label style={styles.white}>{pad(m)}m </label>}
      {s > 0 && (
        <label style={styles.white}>{pad(s)}s</label>
      )}
    </label>
  );
};


export const getEclipsedTrimmedText = (text = '', maxLength = 0) => {
  if (!text || typeof text !== 'string') return '';
  if (maxLength <= 0) return '';
  return text.length > maxLength
    ? text.substring(0, maxLength).trimEnd() + '...'
    : text;
};

export const getResizedOptimizedImage = (url, width, height) => {
  if (!url) return null;

  // Prevent double optimization
  const hasResizeParam = url.includes("?im=Resize") || url.includes("&im=Resize");
  if (hasResizeParam) return url;

  const resizeParams = [];
  if (width) resizeParams.push(`width=${width}`);
  if (height) resizeParams.push(`height=${height}`);

  if (resizeParams.length === 0) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}im=Resize,${resizeParams.join(",")}`;
};


// utils/calculateDimensions.js
export const calculateDimensions = (height, width, showTitle = false) => {
  const gap = 40;
  const homeContentWrapper = document.getElementById('homeContentWrapper');
  const viewportHeight = window.innerHeight;
let maxHeight = 320;

if (homeContentWrapper && homeContentWrapper.offsetHeight > 0.45 * viewportHeight) {
  maxHeight = homeContentWrapper.offsetHeight - 70;
}
  maxHeight = maxHeight - (showTitle ? 70 : 0);

  const defaultDimensions = {
    itemWidth: 360,
    itemHeight: 200,
    containerHeight: 200 + gap,
    displayImgType: 'web',
    aspectRatio : 360/200,
  };

  if (height === null || width === null) {
    return defaultDimensions;
  }

  const aspectRatio = height / width;
  let itemWidth, itemHeight;

  if (aspectRatio > 1.9 || aspectRatio === 1) {
    itemHeight = Math.min(maxHeight,((200 * aspectRatio) + 16));
    itemWidth = itemHeight / aspectRatio;
  } else {
    itemHeight = Math.min(maxHeight,200 * aspectRatio);
    itemWidth = itemHeight/aspectRatio;
  }

  return {
    itemWidth,
    itemHeight,
    containerHeight: itemHeight + gap,
    displayImgType: 'mobile',
    aspectRatio,
  };
};

export const sanitizeAndResizeImage = (url, width) => {
  if (!url) return null;

  const lastPart = url
    .substring(url.lastIndexOf("/") + 1)
    .replace(/ /g, "%20")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");

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

      if (items.length > 0 && items[0].totalRows > horizontalLazyLoadLimit) {
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

export const processLiveTvCategoriesToPlaylist = (categories)=>{
  // convert the categories object to playlist as required by content component
  return categories.map((category)=>{

    let categoryItems  = category.channels.map((item)=>{
      return {
        ...item,
        title:item.name,
        playListId: item.category,
        mediaID: item.id,
        category: 'LiveTv',
        webThumbnail: sanitizeAndResizeImage(item.image,450)
      }
    })

    let cat = {
      playListId: category.id,
      playlistName: category.category,
      playListType: 'LiveTv',
      playlistItems: categoryItems
    };

    return cat;

  });
}

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

export const showModal = (title = 'Title', description = 'Short description', buttons = [], showCloseButton=true) => {
  if (modalOpener) {
    modalOpener({ title, description, buttons, showCloseButton });
  } else {
    console.warn('Modal opener not set yet.');
  }
};

export function timeformat(date) {
  var h = date.getHours();
  var m = date.getMinutes();
  var x = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  h = h ? h : 12;
  m = m < 10 ? '0'+m: m;
  var mytime= h + ':' + m + ' ' + x;
  return mytime;
}

export function getTodayMidnightDate(){
	var date = new Date();
	date.setHours(24,0,0,0);
	return date;
}

export function convertUTCDateToLocalDate(newdate) {
	var date = new Date(newdate);
	var newDate = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
	return newDate;
}

export function formattedDateForBanner(serverdate){
	let d = convertUTCDateToLocalDate(serverdate);
	var h = d.getHours();
  	var m = d.getMinutes();
  	var x = h >= 12 ? 'pm' : 'am';
	h = h % 12;
  	h = h ? h : 12;
  	m = m < 10 ? '0'+m: m;
	let mytime= h + ':' + m + ' ' + x;
	return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
    d.getFullYear() + " " + mytime;
}

export function  getUtcDate(){
	var now = new Date();
	var d = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
	return d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" +  d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
}

export function getCategoryIdByCategoryName(categoryName){
  let catId  = null;
  switch(categoryName.toUpperCase()){
    case "MOVIES" : 
      catId  = 1;
      break;
    case "WEB SERIES":
      catId = 2;
      break;
    default:
      catId = null;
  }

  return catId;
}

export const exitApplication = () =>{
    let tizen  = window.tizen;
    try{
     if (typeof tizen !== 'undefined' && tizen.application) {
      tizen.application.getCurrentApplication().exit();
    } else {
      console.warn('Tizen API is not available.');
    }
    }catch(error){
      console.error('error at exit application',error);
    }
  }

  export const showExitApplicationModal = () =>{
    showModal('Confirm Exit Application',
      'Are You Sure You Want To Exit The Application',
      [
        {label: 'Yes', action: exitApplication, className: 'primary'}
      ]
    )
  }

  export const checkUserNetWorkConnection = async () =>{
    try{
      const res = await checkIsUserOnline();
      if(res){
        return true;
      }
      else{
        throw new Error(res.message);
      }
    }
     catch(error){
      return false;
     }
  }
