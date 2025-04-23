import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { DecryptAESString, findCurrentEpisode } from "../Utils/MediaUtils";
import { loadMediaDetailById } from "../Service/MediaService";
import { useUserContext } from "../Context/userContext";

const useMedia = () => {
  const [mediaDetails, setMediaDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isCancelled = useRef(false);
  const {isUserSubscribed} = useUserContext();
  let isTrailer = false;
  let isFree = false;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      isCancelled.current = true;
    };
  }, []);

  const checkMediaUserSubscriptionStatus  = () =>{
    if(isUserSubscribed || isFree)
    {}

  }

  const getMediaDetails = async (mediaId, userObjectId, category) => {
    if (!mediaId || !userObjectId || !category) return;

    setLoading(true);
    setError(null);
    isCancelled.current = false;

    const isWebSeries = category.toLowerCase() === "web series";

    try {
      let response = await loadMediaDetailById(mediaId, userObjectId, isWebSeries);

      if (response && response.isSuccess) {
        response = response.data;
        const detail = response.detail;

        if (!detail) {
          toast.error("Failed to get media detail");
          setError("No media detail found");
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

        if (!isCancelled.current) {
          setMediaDetails({
            detail,
            skipInfo,
            currentEpisode,
            onScreenInfo,
            decryptedUrl
          });
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
    getMediaDetails,
    mediaDetails,
    loading,
    error
  };
};

export default useMedia;
