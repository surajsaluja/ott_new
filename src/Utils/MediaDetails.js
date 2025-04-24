import { toast } from "react-toastify";
import { DecryptAESString, findCurrentEpisode } from "../Utils/MediaUtils";
import { showModal } from "../Utils";
import useMediaService from "../Service/useMediaService";
import { useUserContext } from "../Context/userContext";

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

const getMediaDetails = async (mediaId, category, isTrailer, userObjectId) => {
  const { loadMediaDetailById, getTokanizedMediaUrl } = useMediaService();
  const { userObjectId: userObjId } = useUserContext();

  let isUserSubscribed = false;
  let mediaDetail = null;
  let skipInfo = null;
  let onScreenInfo = null;
  let mediaUrl = null;
  let subtitleUrl = null;
  let currentEpisode = null;
  let decryptedUrl = null;
  let mediaTitle = null;
  let isFree = false;

  try {
    const isWebSeries = category.toLowerCase() === "web series";
    let response = await loadMediaDetailById(mediaId, isWebSeries, userObjectId ?? userObjId);

    if (response && response.isSuccess) {
      response = response.data;
      mediaDetail = response.detail;

      if (!mediaDetail) {
        throw new Error('Media Details Not Found');
      }

      isUserSubscribed = mediaDetail.isUserSubscribed;
      let isPaid = mediaDetail.isPaid;
      isFree = typeof isPaid === "string"
        ? isPaid.toLowerCase() === "false" || isPaid === "0"
        : !isPaid;

      mediaId = mediaDetail.mediaID;

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

      mediaTitle = mediaDetail.title;

      currentEpisode = isWebSeries
        ? findCurrentEpisode(mediaDetail?.seasons, mediaId)
        : null;

      if (isUserSubscribed || isFree || isTrailer) {
        let tokenisedResponse = await getTokanizedMediaUrl(mediaId, userObjectId ?? userObjId);
        if (tokenisedResponse.isSuccess) {
          const tokenisedData = tokenisedResponse.data;
          isUserSubscribed = tokenisedData.isUserSubscribed;
          isPaid = tokenisedData.isPaid;
          isFree = typeof isPaid === "string"
            ? isPaid.toLowerCase() === "false" || isPaid === "0"
            : !isPaid;

          if (tokenisedData.isMediaPublished && (isUserSubscribed || isFree) &!isTrailer) {
            subtitleUrl = mediaDetail.smiSubtitleUrl;
            mediaUrl = mediaDetail.mediaUrl;
          } else {
            subtitleUrl = mediaDetail.smiSubtitleTrailerUrl || null;
            mediaUrl = mediaDetail.trailerUrl;

            skipInfo.skipIntroST = 0;
            skipInfo.skipIntroET = 0;
            skipInfo.skipRecapST = 0;
            skipInfo.skipRecapET = 0;
            skipInfo.nextEpisodeST = 0;
          }
        } else {
          throw new Error('Could Not Get Tokenised Media Url');
        }
      } else {
        throw new Error('User Not Subscribed');
      }

      return {
        mediaDetail,
        mediaUrl,
        subtitleUrl,
        skipInfo,
        onScreenInfo,
        currentEpisode,
        mediaTitle,
        isFree,
      };

    } else {
      throw new Error("Invalid response for media detail");
    }

  } catch (error) {
    console.error("Error fetching media detail:", error);
    toast.error("Failed to load media details");
    throw new Error(error.message || "Unknown error");
  }
};

export default getMediaDetails;
