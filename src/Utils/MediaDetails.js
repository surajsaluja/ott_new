import { toast } from "react-toastify";
import { DecryptAESString } from "../Utils";
import { loadMediaDetailById } from "../Service/MediaService";

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


export const getMediaDetails = ({ mediaId, userId, category }) => {
let mediaDetails = null;

    if (!mediaId || !userId || !category) return null;

    const loadMediaDataById = async () => {
      const isWebSeries = category.toLowerCase() === "web series";


      try {
        const response = loadMediaDetailById(mediaId, userId, isWebSeries);

        const detail = response.data?.data?.detail;

        if (!detail) {
          toast.error("Failed to get media detail");
          return;
        }

        const isUserSubscribed = detail.isUserSubscribed;
        const isPaid = detail.isPaid;
        const isFree = typeof isPaid === "string"
          ? isPaid.toLowerCase() === "false" || isPaid === "0"
          : !isPaid;

        const skipInfo = {
          skipIntroST: parseInt(detail.skipIntroST),
          skipIntroET: parseInt(detail.skipIntroET),
          skipRecapST: parseInt(detail.skipRecapST),
          skipRecapET: parseInt(detail.skipRecapET),
          nextEpisodeST: isWebSeries ? parseInt(detail.nextEpisodeST) : null,
        };

        const onScreenInfo = {
          onScreenDescription: detail.onScreenDescription,
          onScreenDescription2: detail.onScreenDescription2,
          onScreenDescriptionST: parseInt(detail.onScreenDescriptionST),
          onScreenDescriptionET: parseInt(detail.onScreenDescriptionET),
          onScreenDescription2ST: parseInt(detail.onScreenDescription2ST),
          onScreenDescription2ET: parseInt(detail.onScreenDescription2ET),
          ageRatedText: `RATED ${detail.ageRangeId}+`,
        };

        let subtitleUrl = null;
        let mediaUrl = "";

        if (detail.isMediaPublished && (isUserSubscribed || isFree)) {
          subtitleUrl = detail.smiSubtitleUrl;
          mediaUrl = detail.mediaUrlWithoutSRT;
        } else {
          subtitleUrl = detail.smiSubtitleTrailerUrl || null;
          mediaUrl = detail.trailerUrl;

          // Override skip info for trailers
          skipInfo.skipIntroST = 0;
          skipInfo.skipIntroET = 0;
          skipInfo.skipRecapST = 0;
          skipInfo.skipRecapET = 0;
          skipInfo.nextEpisodeST = 0;
        }

        const currentEpisode = isWebSeries
          ? findCurrentEpisode(detail?.seasons, mediaId)
          : null;

        const decryptedUrl = DecryptAESString(mediaUrl);

        // onWatchClipVOD3(
        //   decryptedUrl,
        //   detail.title,
        //   currentPlayableItem.id,
        //   parseInt(detail.playDuration),
        //   skipInfo,
        //   webseriesAllDetails?.seasons,
        //   currentEpisode,
        //   !detail.isMediaPublished,
        //   subtitleUrl,
        //   isFree,
        //   onScreenInfo
        // );

        mediaDetails  = {
            detail,
            skipInfo,
            currentEpisode,
            onScreenInfo,
            decryptedUrl
        };
      } catch (error) {
        console.error("Error fetching media detail:", error);
        toast.error("Failed to load media details");
      }
    };

    loadMediaDataById();

  return mediaDetails;
};  