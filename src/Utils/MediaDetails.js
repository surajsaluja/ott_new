import { DecryptAESString } from "../Utils/MediaUtils";
import {
  fetchMediaDetailById,
  fetchTokanizedMediaUrl,
  fetchMediaRelatedItem,
  fetchWebSeriesEpisodeBySeasonId,
} from "../Service/MediaService";
import { sanitizeAndResizeImage, getResizedOptimizedImage } from "./index";

const findCurrentEpisode = (seasons, currentMediaId) => {
  for (const season of seasons || []) {
    for (const episode of season.episodes || []) {
      if (episode.mediaID === currentMediaId) {
        return episode;
      }
    }
  }
  return null;
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
      groupedStarCasts[iStarcastType].push({displayName, profileImage});
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
  isTrailer = true,
  userObjectId = null
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

  try {
    const isWebSeries = categoryId == 2;
    let response = await fetchMediaDetailById(
      mediaId,
      isWebSeries,
      userObjectId ?? userObjId
    );

    if (response && response.isSuccess) {
      response = response.data;
      mediaDetail = response.detail;

      if (!mediaDetail) {
        throw new Error("Media Details Not Found");
      }

      let isPaid = mediaDetail.isPaid;
      isFree = getIsContentFree(isPaid);
      userCurrentPlayTime = mediaDetail.playDuration;
      isMediaPublished = mediaDetail.isMediaPublished;
      mediaUrl = isTrailer ? mediaDetail.trailerUrl : mediaDetail.mediaUrl;
      webThumbnailUrl = sanitizeAndResizeImage(
        mediaDetail.webThumbnailUrl,
        450
      );
      fullPageBannerUrl = getResizedOptimizedImage(
        mediaDetail.fullPageBanner,
        1920
      );
      groupedStarCasts = groupStarCasts(isWebSeries ? response.starcastList : response.starcasts);
      mediaDetail.groupedStarCasts = groupedStarCasts;
      mediaDetail.seasons = isWebSeries ? response.seasons : null;

      skipInfo = {
        skipIntroST: parseInt(mediaDetail.skipIntroST),
        skipIntroET: parseInt(mediaDetail.skipIntroET),
        skipRecapST: parseInt(mediaDetail.skipRecapST),
        skipRecapET: parseInt(mediaDetail.skipRecapET),
        nextEpisodeST: isWebSeries ? parseInt(mediaDetail.nextEpisodeST) : null,
      };

      onScreenInfo = {
        onScreenDescription: mediaDetail.onScreenDescription,
        onScreenDescription2: mediaDetail.onScreenDescription2,
        onScreenDescriptionST: parseInt(mediaDetail.onScreenDescriptionST),
        onScreenDescriptionET: parseInt(mediaDetail.onScreenDescriptionET),
        onScreenDescription2ST: parseInt(mediaDetail.onScreenDescription2ST),
        onScreenDescription2ET: parseInt(mediaDetail.onScreenDescription2ET),
        ageRatedText: `RATED ${mediaDetail.ageRangeId}+`,
      };

      mediaDetail.onScreenInfo = onScreenInfo;
      mediaDetail.skipInfo = skipInfo;

      currentEpisode = isWebSeries
        ? findCurrentEpisode(response?.seasons, mediaId)
        : null;

      mediaUrl = mediaUrl ? DecryptAESString(mediaUrl) : mediaUrl;
      success = true;
      message = "Data Retrived SuccessFully";
    } else {
      throw new Error("Invalid response for media detail");
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
      skipInfo,
      onScreenInfo,
      currentEpisode,
      userCurrentPlayTime,
      webThumbnailUrl,
      fullPageBannerUrl,
      groupedStarCasts,
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

      if (isUserSubscribed || isFree || isTrailer) {
        mediaUrl = isTrailer ? response.trailerUrl : response.mediaUrl;
        mediaUrl = DecryptAESString(mediaUrl);
        success = true;
        message = "Media Tokenised SuccessFully";
      } else {
        throw new Error("You are not a subscribed user to watch this movie!");
      }
    } else {
      throw new Error("Invalid response for Tokenised Media");
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
  userObjectId = null
) => {
  let success = false;
  let mediaDetailReponse = null;
  let tokenisedMediaResponse = null;
  try {
    mediaDetailReponse = await this.getMediaDetails(
      mediaId,
      categoryId,
      isTrailer,
      userObjectId
    );
    if (mediaDetailReponse.isSuccess) {
      tokenisedMediaResponse = await this.getTokenisedMedia(
        mediaId,
        isTrailer,
        userObjectId
      );
      if (tokenisedMediaResponse.isSuccess) {
        success = true;
      } else {
        throw new Error(
          `Could Not Get Tokenised Detail : ${tokenisedMediaResponse.error}`
        );
      }
    } else {
      throw new Error(
        `Could Not Get Media Detail : ${mediaDetailReponse.error}`
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
  userObjectId = null,
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
        userObjectId,
        page,
        pageSize,
        language
      );
      if (relatedItemsReponse.isSuccess) {
        success = true;
      } else {
        throw new Error(`Could Not Get Related Media Items`);
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
  language = null ,
  userObjectId = null,
  page = 1,
  pageSize = 10
) => {
  let success = false;
  let webSeriesEpisodesResponse = null;
  try {
    if (webSeriesId == null) {
      throw new Error("WebSeries Id can not be null");
    } else if(seasonId == null) {
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
      if (webSeriesEpisodesResponse.isSuccess) {
        success = true;
      } else {
        throw new Error(`Could Not Get Episode Related To Items`);
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
