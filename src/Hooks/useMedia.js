import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { DecryptAESString, findCurrentEpisode } from "../Utils/MediaUtils";
import { useUserContext } from "../Context/userContext";
import { showModal } from "../Utils";
import useMediaService from "../Service/useMediaService";

const useMedia = (mediaId, category, isTrailer, userObjectId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isCancelled = useRef(false);
  const { loadMediaDetailById, getTokanizedMediaUrl } = useMediaService();
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

  const { userObjectId: userObjId } = useUserContext();

  useEffect(() => {
    getMediaDetails();
    return () => {
      isCancelled.current = true;
    };
  }, []);

  const getMediaDetails = async () => {

    setLoading(true);
    setError(null);
    isCancelled.current = false;

    const isWebSeries = category.toLowerCase() === "web series";

    try {
      let response = await loadMediaDetailById(mediaId, isWebSeries, userObjectId ?? userObjId);

      if (response && response.isSuccess) {
        response = response.data;
        mediaDetail = response.detail;

        if (!mediaDetail) {
          throw new Error({ message: 'Media Details Not Found' });
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
            //mediaUrl = isTrailer ? tokenisedData.trailerUrl : tokenisedData.mediaUrl;
            if (tokenisedData.isMediaPublished && (isUserSubscribed || isFree)) {
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
            throw new Error({ message: 'Could Not Get Tokenised Media Url' });
          }
        } else {
          // showModal('Subscription Not Valid','You Are Not Subscribed To Watch This Content');
          throw new Error({ message: 'User Not Subscribed' });
          return false;
        }

      } else {
        toast.error("Response Not Found for Media Detail");
        setError("Invalid response");
      }
    } catch (error) {
      console.error("Error fetching media detail:", error);
      toast.error("Failed to load media details");
      setError(error.message || "Unknown error");
    } finally {
      if (!isCancelled.current) {
        setLoading(false);
      }
    }
  };

  return {
    mediaDetail,
    loading,
    error
  };
};

export default useMedia;
