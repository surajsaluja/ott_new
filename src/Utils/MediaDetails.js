import { DecryptAESString } from "../Utils/MediaUtils";
import {
  fetchMediaDetailById,
  fetchTokanizedMediaUrl,
  fetchMediaRelatedItem,
  fetchWebSeriesEpisodeBySeasonId,
  fetchWebSeriesAllSeasonsWithEpisodes,
  fetchBannerWatchMediaDetails,
} from "../Service/MediaService";
import { sanitizeAndResizeImage, getResizedOptimizedImage } from "./index";
import { getTokanizedLiveTVUrl } from "../Service/LiveTVService";
import { useWebSeries } from "../Context/WebSeriesContext";
import { findEpisodesBySeasonId, findSeasonByMediaId, getEpisodes, setSeasonCache, } from "./WebSeriesUtils";

// const seasonCache = {};

const findCurrentEpisode = (seasons, currentMediaId) => {
  for (const season of seasons || []) {
    const episodes = season.episodes || [];
    for (let i = 0; i < episodes.length; i++) {
      const episode = episodes[i];
      if (episode.mediaID === currentMediaId) {
        const nextEpisode = episodes[i + 1] || null;
        return {
          currentSeason: season,
          currentEpisode: episode,
          nextEpisodeMediaId: nextEpisode?.mediaID || null,
        };
      }
    }
  }
  return {
    currentSeason: null,
    currentEpisode: null,
    nextEpisodeMediaId: null,
  };
};



const getIsContentFree = (isPaid) => {
  return typeof isPaid === "string"
    ? isPaid.toLowerCase() === "false" || isPaid === "0"
    : !isPaid;
};

const groupStarCasts = (starCastArray = []) => {
  if (!Array.isArray(starCastArray) || starCastArray.length === 0) {
    return null;
  }

  const groupedStarCasts = {
    Producer: [],
    Director: [],
    Writer: [],
    Starcast: [],
  };

  starCastArray.forEach(({ iStarcastType, displayName, profileImage }) => {
    if (groupedStarCasts[iStarcastType]) {
      groupedStarCasts[iStarcastType].push({ displayName, profileImage });
    }
  });

  // Check if all groups are still empty
  const hasAnyStarCast = Object.values(groupedStarCasts).some(
    (list) => list.length > 0
  );
  return hasAnyStarCast ? groupedStarCasts : null;
};


export const getMediaDetails = async (
  mediaId = null,
  categoryId = 1,
  itemWebSeriesId = 0,
  openWebSeries = false,
  isTrailer = true,
  userObjectId = null,
) => {

  const userObjId = localStorage.getItem("userObjectId");

  if (!mediaId) {
    return {
      isSuccess: false,
      message: "Media Id is required field",
    };
  }

  if (userObjectId == null && userObjId == null) {
    return {
      isSuccess: false,
      message: "UserObjectId not found",
    };
  }

  let mediaDetail = null;
  let mediaUrl = null;
  let currentEpisode = null;
  let success = false;
  let message = null;
  let webSeriesId = null;

  try {
    const isWebSeries = categoryId == 2;
    let response = await fetchMediaDetailById(
      mediaId,
      isWebSeries,
      openWebSeries,
      itemWebSeriesId,
      userObjectId ?? userObjId,
    );

    if (response && response.isSuccess) {
      response = response.data;

      if (!response.detail) {
        throw new Error("Media Details Not Found");
      }

      mediaDetail = parseMediaDetails(response.detail);

      mediaDetail.onScreenInfo = isTrailer ? {} : mediaDetail.onScreenInfo;
      mediaDetail.skipInfo = isTrailer ? {} : mediaDetail.skipInfo;
      mediaDetail.trailerPlayUrl = mediaDetail?.trailerUrl ? DecryptAESString(mediaDetail.trailerUrl) : null;
      mediaDetail.webThumbnailUrl = sanitizeAndResizeImage(
        mediaDetail.webThumbnailUrl,
        450
      );
      mediaDetail.fullPageBanner = getResizedOptimizedImage(
        mediaDetail.fullPageBanner,
        1920
      );
      mediaDetail.groupedStarCasts = groupStarCasts(isWebSeries ? response.starcastList : response.starcasts);

      if (isWebSeries) {
        mediaDetail.seasons = response.seasons;
        setSeasonCache(mediaDetail.webSeriesId, response.seasons);
        currentEpisode = await getEpisodes(mediaDetail.webSeriesId, mediaDetail.seasonId);
        // currentEpisode = await findEpisodesBySeasonId(mediaDetail.webSeriesID, mediaDetail.seasonId, mediaDetail.mediaID);
        if (currentEpisode && currentEpisode.data.length > 0) {
          mediaDetail.episodes = currentEpisode.data;
        }

      }

      success = true;
      message = "Data Retrived SuccessFully";
    } else {
      throw new Error(response?.message || "Invalid response for media detail");
    }
  } catch (error) {
    success = false;
    return {
      isSuccess: success,
      message: error.message || "Something went wrong",
    };
  }

  return {
    isSuccess: success,
    message: message,
    data: {
      mediaDetail,
    },
  };
};

export const getTokenisedMedia = async (
  mediaId,
  isTrailer,
  userObjectId = null
) => {
  const userObjId = localStorage.getItem("userObjectId");

  if (!mediaId) {
    return {
      isSuccess: false,
      message: "Media Id is required field",
    };
  }

  if (userObjId == null && userObjectId == null) {
    return {
      isSuccess: false,
      message: "UserObjectId not found",
    };
  }

  let isUserSubscribed = false;
  let isMediaPublished = false;
  let isFree = false;
  let mediaUrl = null;
  let success = false;
  let message = null;

  try {
    let response = await fetchTokanizedMediaUrl(
      mediaId,
      userObjectId ?? userObjId
    );
    if (response && response.isSuccess) {
      response = response.data;
      isUserSubscribed = response.isUserSubscribed;
      isMediaPublished = response.isMediaPublished;
      isFree = getIsContentFree(response.isPaid);

      if (isTrailer && response.trailerUrl) {
        mediaUrl = DecryptAESString(response.trailerUrl);
        success = true;
      } else if (isMediaPublished && !isTrailer) {
        if ((isUserSubscribed || isFree) && response.mediaUrl) {
          mediaUrl = DecryptAESString(response.mediaUrl);
          success = true;
          message = "Media Tokenised SuccessFully";
        } else {
          throw new Error("You are not a subscribed user to watch this movie!");
        }
      } else {
        throw new Error('Media Not Published');
      }

    } else {
      throw new Error(response?.message || "Invalid response for Tokenised Media");
    }
  } catch (error) {
    success = false;
    return {
      isSuccess: success,
      message: error.message || "Something went wrong",
    };
  }

  return {
    isSuccess: success,
    data: {
      mediaUrl,
      isUserSubscribed,
      isFree,
      isMediaPublished,
    },
  };
};

export const getMediaDetailWithTokenisedMedia = async (
  mediaId = null,
  categoryId = null,
  isTrailer = true,
  openWebSeries = false,
  webSeriesId = 0,
  userObjectId = null,
) => {
  let success = false;
  let mediaDetailReponse = null;
  let tokenisedMediaResponse = null;
  try {
    mediaDetailReponse = await getMediaDetails(
      mediaId,
      categoryId,
      isTrailer,
      userObjectId
    );
    if (mediaDetailReponse.isSuccess) {
      tokenisedMediaResponse = await getTokenisedMedia(
        mediaId,
        isTrailer,
        userObjectId
      );
      if (tokenisedMediaResponse.isSuccess) {
        success = true;
      } else {
        throw new Error(
          tokenisedMediaResponse.message || 'Could Not Get Tokenised Detail'
        );
      }
    } else {
      throw new Error(
        mediaDetailReponse.message || 'Could Not Get Media Detail'
      );
    }
  } catch (error) {
    success = false;
    return {
      isSuccess: success,
      message: error.message || "Something went wrong",
    };
  }

  return {
    isSuccess: success,
    data: {
      ...mediaDetailReponse.data,
      ...tokenisedMediaResponse.data,
    },
  };
};

export const getMediaRelatedItemDetails = async (
  mediaId = null,
  page = 1,
  pageSize = 10,
  language = 1
) => {
  let success = false;
  let relatedItemsReponse = null;
  try {
    if (mediaId == null) {
      throw new Error("mediaId can not be null");
    } else {
      relatedItemsReponse = await fetchMediaRelatedItem(
        mediaId,
        page,
        pageSize,
        language
      );
      if (relatedItemsReponse && relatedItemsReponse?.isSuccess) {
        success = true;
      } else {
        throw new Error(relatedItemsReponse?.message || `Could Not Get Related Media Items`);
      }
    }
  } catch (error) {
    success = false;
    return {
      isSuccess: success,
      message: error.message || "Something went wrong",
    };
  }

  return {
    isSuccess: success,
    data: relatedItemsReponse.data,
  };
};

export const getWebSeriesEpisodesBySeason = async (
  webSeriesId = null,
  seasonId = null,
  language = null,
  userObjectId = null,
  page = 1,
  pageSize = 10
) => {
  let success = false;
  let webSeriesEpisodesResponse = null;
  try {
    if (webSeriesId == null) {
      throw new Error("WebSeries Id can not be null");
    } else if (seasonId == null) {
      throw new Error("Season Id can not be null");
    } else {
      webSeriesEpisodesResponse = await fetchWebSeriesEpisodeBySeasonId(
        webSeriesId,
        seasonId,
        language,
        userObjectId,
        page,
        pageSize
      );
      if (webSeriesEpisodesResponse && webSeriesEpisodesResponse?.isSuccess) {
        success = true;
      } else {
        throw new Error(webSeriesEpisodesResponse?.message || `Could Not Get Episode Related To Items`);
      }
    }
  } catch (error) {
    success = false;
    return {
      isSuccess: success,
      message: error.message || "Something went wrong",
    };
  }

  return {
    isSuccess: success,
    data: webSeriesEpisodesResponse.data,
  };
};


export const getTokenisedTvMedia = async (channelHandle) => {
  if (!channelHandle) {
    return {
      isSuccess: false,
      message: "channelHandle is required field",
    };
  }

  let isUserSubscribed = false;
  let isMediaPublished = false;
  let isFree = false;
  let tvUrl = null;
  let success = false;
  let message = null;

  try {
    let response = await getTokanizedLiveTVUrl(
      channelHandle
    );
    if (response && response.isSuccess) {
      response = response.data;
      isUserSubscribed = response.isUserSubscribed;
      isMediaPublished = response.isMediaPublished;
      isFree = getIsContentFree(response.isPaid);

      if (isUserSubscribed || isFree) {
        tvUrl = response.tvUrl;
        tvUrl = DecryptAESString(tvUrl);
        success = true;
        message = "Media Tokenised SuccessFully";
      } else {
        throw new Error("You are not a subscribed user to watch this Content!");
      }
    } else {
      throw new Error(response?.message || "Invalid response for Tokenised Media");
    }
  } catch (error) {
    success = false;
    return {
      isSuccess: success,
      message: error.message || "Something went wrong",
    };
  }

  return {
    isSuccess: success,
    data: {
      tvUrl,
      isUserSubscribed,
      isFree,
      isMediaPublished,
    },
  };

}

export const getBannerPlayData = async (
  mediaId = null,
  categoryId = 1,
  itemWebSeriesId = 0,
  openWebSeries = false,
  isTrailer = false,
  userObjectId = null,
) => {

  const userObjId = localStorage.getItem("userObjectId");

  if (!mediaId) {
    return {
      isSuccess: false,
      message: "Media Id is required field",
    };
  }

  if (userObjectId == null && userObjId == null) {
    return {
      isSuccess: false,
      message: "UserObjectId not found",
    };
  }

  let mediaDetail = null;
  let skipInfo = null;
  let onScreenInfo = null;
  let mediaUrl = null;
  let currentEpisode = null;
  let isFree = false;
  let isMediaPublished = false;
  let userCurrentPlayTime = null;
  let success = false;
  let message = null;
  let webThumbnailUrl = null;
  let fullPageBannerUrl = null;
  let groupedStarCasts = null;
  let webSeriesId = null;
  let seasons = null;

  try {
    const isWebSeries = categoryId == 2;
    let response = await fetchBannerWatchMediaDetails(
      mediaId,
      openWebSeries,
      itemWebSeriesId,
      userObjectId ?? userObjId,
    );

    if (response && response.isSuccess) {
      response = response.data;

      if (!response.detail) {
        throw new Error("Media Details Not Found");
      }

      mediaDetail = parseMediaDetails(response.detail);

      mediaDetail.onScreenInfo = isTrailer ? {} : mediaDetail.onScreenInfo;
      mediaDetail.skipInfo = isTrailer ? {} : mediaDetail.skipInfo;
      mediaDetail.trailerPlayUrl = mediaDetail?.trailerUrl ? DecryptAESString(mediaDetail.trailerUrl) : null;
      mediaDetail.webThumbnailUrl = sanitizeAndResizeImage(
        mediaDetail.webThumbnailUrl,
        450
      );
      mediaDetail.fullPageBanner = getResizedOptimizedImage(
        mediaDetail.fullPageBanner,
        1920
      );
      mediaDetail.groupedStarCasts = groupStarCasts(isWebSeries ? response.starcastList : response.starcasts);

      if (mediaDetail.isMediaPublished) {
        if ((mediaDetail.isUserSubscribed || mediaDetail.isFree) && mediaDetail.mediaUrl) {
          mediaDetail.mediaUrl = DecryptAESString(mediaDetail.mediaUrl);
        } else {
          throw new Error('You are not subscibed user to watch this content!!');
        }
      } else {
        throw new Error('Media Not Published');
      }


      if (isWebSeries) {
        currentEpisode = await getEpisodes(mediaDetail.webSeriesId, mediaDetail.seasonId);
        // currentEpisode = await findEpisodesBySeasonId(mediaDetail.webSeriesID, mediaDetail.seasonId, mediaDetail.mediaID);
        if (currentEpisode && currentEpisode.data.length > 0) {
          mediaDetail.episodes = currentEpisode.data;
        }
      }

      success = true;
      message = "Data Retrived SuccessFully";
    } else {
      throw new Error(response?.message || "Invalid response for media detail");
    }
  } catch (error) {
    success = false;
    return {
      isSuccess: success,
      message: error.message || "Something went wrong",
    };
  }
  return {
    isSuccess: success,
    message: message,
    data: {
      mediaDetail,
    },
  };
};

export const parseMediaDetails = (mediaDet) => {
  let mediaDetail = null;
  let skipInfo = null;
  let onScreenInfo = null;
  let mediaUrl = null;
  let currentEpisode = null;
  let isFree = false;
  let isMediaPublished = false;
  let userCurrentPlayTime = null;
  let success = false;
  let message = null;
  let webThumbnailUrl = null;
  let fullPageBannerUrl = null;
  let groupedStarCasts = null;
  let webSeriesId = null;
  let seasons = null;

  mediaDetail = mediaDet;

  let isPaid = mediaDetail.isPaid;
  mediaDetail.isFree = getIsContentFree(isPaid);
  // userCurrentPlayTime = mediaDetail.playDuration;
  isMediaPublished = mediaDetail.isMediaPublished;

  mediaDetail.skipInfo = {
    skipIntroST: parseInt(mediaDetail.skipIntroST),
    skipIntroET: parseInt(mediaDetail.skipIntroET),
    skipRecapST: parseInt(mediaDetail.skipRecapST),
    skipRecapET: parseInt(mediaDetail.skipRecapET),
    nextEpisodeST: parseInt(mediaDetail.nextEpisodeST),
  };

  mediaDetail.onScreenInfo = {
    onScreenDescription: mediaDetail.onScreenDescription,
    onScreenDescription2: mediaDetail.onScreenDescription2,
    onScreenDescriptionST: parseInt(mediaDetail.onScreenDescriptionST),
    onScreenDescriptionET: parseInt(mediaDetail.onScreenDescriptionET),
    onScreenDescription2ST: parseInt(mediaDetail.onScreenDescription2ST),
    onScreenDescription2ET: parseInt(mediaDetail.onScreenDescription2ET),
    ageRatedText: `RATED ${mediaDetail.ageRangeId}+`,
  };

  return mediaDetail
}