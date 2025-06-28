const cacheStore = {};

export const CACHE_KEYS = {
  RADIO: {
    HOME_DATA: "RADIO_HOME_DATA",
    BANNERS_DATA: "RADIO_BANNER_DATA",
  },
  HOME_PAGE: {
    HOME_DATA: "HOME_DATA",
    BANNERS_DATA: "HOME_BANNER_DATA",
  },
  MOVIE_PAGE: {
    HOME_DATA: "MOVIE_HOME_DATA",
    BANNERS_DATA: "MOVIE_BANNER_DATA",
  },
  WEBSERIES_PAGE:{
    HOME_DATA: "WEB_HOME_DATA",
    BANNERS_DATA: "WEB_BANNER_DATA",
  },
  LIVE_TV_PAGE:{
    HOME_DATA: "LIVETV_HOME_DATA",
    BANNERS_DATA: "LIVETV_BANNER_DATA",
  },
  MENU:{
    MENU_DATA: 'MENU_DATA'
  },
  API_KEY:{
    API_KEY_DATA: 'API_KEY_DATA',
    APP_IDLE_TIME: 'APP_IDLE_TIME',
    APP_MIN_VERSION: 'APP_MIN_VERSION'
  },
  FAVOURITES:{
    FAVOURITE_DATA: 'FAVOUORITE_DATA'
  },
  SEARCH:{
    TRENDING_SEARCH: 'TRENDING_SEARCH_DATA'
  }
};

export const setCache = (key, data) => {
  cacheStore[key] = {
    data,
    timestamp: Date.now(),
  };
};

export const getCache = (key) => {
  return cacheStore[key]?.data || null;
};

export const hasCache = (key) => {
  return !!cacheStore[key];
};

export const clearCache = (key) => {
  delete cacheStore[key];
};

export const clearAllCache = () => {
  Object.keys(cacheStore).forEach((key) => delete cacheStore[key]);
};
