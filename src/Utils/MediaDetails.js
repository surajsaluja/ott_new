import { DecryptAESString} from "../Utils/MediaUtils";
import { loadMediaDetailById, getTokanizedMediaUrl } from "../Service/MediaService";
import { useUserContext } from "../Context/userContext";
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
}

const groupStarCasts = (starCastArray = []) => {
  if (!Array.isArray(starCastArray) || starCastArray.length === 0) {
    return null;
  }

  const groupedStarCasts = {
    Producer: [],
    Director: [],
    Writer: [],
    Starcast: []
  };

  starCastArray.forEach(({ iStarcastType, displayName }) => {
    if (groupedStarCasts[iStarcastType]) {
      groupedStarCasts[iStarcastType].push(displayName);
    }
  });

  // Check if all groups are still empty
  const hasAnyStarCast = Object.values(groupedStarCasts).some(list => list.length > 0);
  return hasAnyStarCast ? groupedStarCasts : null;
};



export const getMediaDetails = async (mediaId = null, category = 'movie', isTrailer = true, userObjectId = null) => {
  const userObjId  = localStorage.getItem('userObjectId');

  if(!mediaId)
    {
      return {
        isSuccess: false,
        message: 'Media Id is required field'
      }
    }

  if(userObjectId == null && userObjId == null)
  {
    return {
      isSuccess: false,
      message: 'UserObjectId not found'
    }
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
  let groupedStartCasts = null;

  try {
    const isWebSeries = category.toLowerCase() === "web series";
    let response = await loadMediaDetailById(mediaId, isWebSeries, userObjectId ?? userObjId);

    if (response && response.isSuccess) {
      response = response.data;
      mediaDetail = response.detail;

      if (!mediaDetail) {
        throw new Error('Media Details Not Found');
      }

      let isPaid = mediaDetail.isPaid;
      isFree = getIsContentFree(isPaid);
      userCurrentPlayTime = mediaDetail.playDuration;
      isMediaPublished = mediaDetail.isMediaPublished;
      mediaUrl = isTrailer ? mediaDetail.trailerUrl : mediaDetail.mediaUrl;
      webThumbnailUrl =  sanitizeAndResizeImage(mediaDetail.webThumbnailUrl,450);
      fullPageBannerUrl = getResizedOptimizedImage(mediaDetail.fullPageBanner,1920);
      groupedStartCasts =  groupStarCasts(response.starcasts);
      mediaDetail.groupedStartCasts = groupedStartCasts;

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

      currentEpisode = isWebSeries
        ? findCurrentEpisode(mediaDetail?.seasons, mediaId)
        : null;

      mediaUrl = mediaUrl ? DecryptAESString(mediaUrl) : mediaUrl;
      success = true;
      message = 'Data Retrived SuccessFully'

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
      groupedStartCasts
      
    }
  };
};

export const getTokenisedMedia = async (mediaId, isTrailer, userObjectId = null) => {
  const userObjId  = localStorage.getItem('userObjectId');

  if(!mediaId)
    {
      return {
        isSuccess: false,
        message: 'Media Id is required field'
      }
    }

  if(userObjId == null && userObjectId == null)
  {
    return {
      isSuccess: false,
      message: 'UserObjectId not found'
    }
  }

  let isUserSubscribed = false;
  let isMediaPublished = false;
  let isFree = false;
  let mediaUrl = null;
  let success = false;
  let message = null;

  try {
    let response = await getTokanizedMediaUrl(mediaId, userObjectId ?? userObjId);
    if (response && response.isSuccess) {
      response = response.data;
      isUserSubscribed = response.isUserSubscribed;
      isMediaPublished = response.isMediaPublished;
      isFree = getIsContentFree(response.isPaid);

      if (isUserSubscribed || isFree || isTrailer) {
        mediaUrl = isTrailer ? response.trailerUrl : response.mediaUrl;
        mediaUrl = DecryptAESString(mediaUrl);
        success = true;
        message = 'Media Tokenised SuccessFully';
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
    isMediaPublished
    }
  }
}

export const getMediaDetailWithTokenisedMedia = async (mediaId, category, isTrailer, userObjectId = null) => {


  let success = false;
  let mediaDetailReponse = null;
  let tokenisedMediaResponse = null;
  try {
    mediaDetailReponse = await this.getMediaDetails(mediaId, category, isTrailer, userObjectId);
    if (mediaDetailReponse.isSuccess) {
      tokenisedMediaResponse = await this.getTokenisedMedia(mediaId, isTrailer, userObjectId);
      if (tokenisedMediaResponse.isSuccess) {
        success = true;
      }
      else {
        throw new Error(`Could Not Get Tokenised Detail : ${tokenisedMediaResponse.error}`);
      }
    } else {
      throw new Error(`Could Not Get Media Detail : ${mediaDetailReponse.error}`)
    }
  } catch (error) {
    success = false;
    return {
      isSuccess: success,
      message: error.message || "Something went wrong",
    }
  }

  return{
    isSuccess : success,
    data:{
      ...mediaDetailReponse.data,
      ...tokenisedMediaResponse.data
    }
  }
}


export const getMediaRelatedItemDetails = async (mediaId,userObjectId) =>{

}