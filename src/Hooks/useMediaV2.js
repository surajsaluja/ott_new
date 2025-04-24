import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { findCurrentEpisode } from "../Utils/MediaUtils";
import { useUserContext } from "../Context/userContext";
import useMediaService from "../Service/useMediaService";
import { DecryptAESString } from "../Utils/MediaUtils";

const isFreeFromPaid = (isPaid) =>
    typeof isPaid === "string"
        ? isPaid.toLowerCase() === "false" || isPaid === "0"
        : !isPaid;

const initial = {
    loading: false,
    error: null,
    mediaDetail: null,
    isUserSubscribed: false,
    isFree: false,
    mediaUrl: null,
    subtitleUrl: null,
    skipInfo: null,
    onScreenInfo: null,
    currentEpisode: null,
    mediaTitle: null,
};

const useMedia = (mediaId, category, isTrailer = false, userObjectId= null) => {

    const { userObjectId: userObjId } = useUserContext();
    const { loadMediaDetailById, getTokanizedMediaUrl } = useMediaService();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mediaDetails, setMediaDetails] = useState(null);
    const [isUserSubscribed, setIsUserSubscribed] = useState(false);
    const [isFree, setIsFree] = useState(false);
    const [mediaUrl, setMediaUrl] = useState(null);
    const [subtitleUrl, setSubtitleUrl] = useState(null);
    const [skipInfo, setSkipInfo] = useState(null);
    const [onScreenInfo, setOnScreenInfo] = useState(null);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [mediaTitle, setMediaTitle] = useState(null);

    const fetchDetails = useCallback(async (abortSignal) => {
        setLoading(true);
        setError(null);

        const isWebSeries = category.toLowerCase() === "web series";
        userObjectId = userObjectId ?? userObjId;

        try {
            const detailResponse = await loadMediaDetailById(
                mediaId,
                isWebSeries,
                userObjectId,
                abortSignal
            );

            if (!detailResponse?.isSuccess || !detailResponse.data?.detail) {
                throw new Error("Media details not found");
            }

            const mediaDetail = detailResponse.data.detail;
            setMediaDetails(mediaDetail);
            setMediaTitle(mediaDetail.title);

            const isPaid = mediaDetail.isPaid;
            const free = isFreeFromPaid(isPaid);
            setIsFree(free);
            setIsUserSubscribed(mediaDetail.isUserSubscribed);

            const skip = {
                skipIntroST: Number(mediaDetail.skipIntroST),
                skipIntroET: Number(mediaDetail.skipIntroET),
                skipRecapST: Number(mediaDetail.skipRecapST),
                skipRecapET: Number(mediaDetail.skipRecapET),
                nextEpisodeST: isWebSeries ? Number(mediaDetail.nextEpisodeST) : null,
            };
            setSkipInfo(skip);

            const screenInfo = {
                onScreenDescription: mediaDetail.onScreenDescription,
                onScreenDescription2: mediaDetail.onScreenDescription2,
                onScreenDescriptionST: Number(mediaDetail.onScreenDescriptionST),
                onScreenDescriptionET: Number(mediaDetail.onScreenDescriptionET),
                onScreenDescription2ST: Number(mediaDetail.onScreenDescription2ST),
                onScreenDescription2ET: Number(mediaDetail.onScreenDescription2ET),
                ageRatedText: `RATED ${mediaDetail.ageRangeId}+`,
            };
            setOnScreenInfo(screenInfo);

            if (isWebSeries) {
                const episode = findCurrentEpisode(mediaDetail.seasons, mediaId);
                setCurrentEpisode(episode);
            }

            if (mediaDetail.isUserSubscribed || free || isTrailer) {
                const tokenizedResponse = await getTokanizedMediaUrl(mediaDetail.mediaID, userObjectId, abortSignal);
                if (!tokenizedResponse?.isSuccess) {
                    throw new Error("Could not fetch tokenised media URL");
                }

                const tokenizedData = tokenizedResponse.data;
                const tokIsFree = isFreeFromPaid(tokenizedData.isPaid);
                const allowed = tokenizedData.isMediaPublished && (tokenizedData.isUserSubscribed || tokIsFree || isTrailer);

                setIsUserSubscribed(tokenizedData.isUserSubscribed);
                setIsFree(tokIsFree);

                if (allowed && !isTrailer) {
                    setMediaUrl(DecryptAESString(mediaDetail.mediaUrl));
                    setSubtitleUrl(mediaDetail.smiSubtitleUrl);
                } else {
                    setMediaUrl(DecryptAESString(mediaDetail.trailerUrl));
                    setSubtitleUrl(mediaDetail.smiSubtitleTrailerUrl ?? null);
                    setSkipInfo({
                        skipIntroST: 0,
                        skipIntroET: 0,
                        skipRecapST: 0,
                        skipRecapET: 0,
                        nextEpisodeST: 0,
                    });
                }
            } else {
                throw new Error("User is not subscribed to this content");
            }
        } catch (err) {
            if (abortSignal?.aborted) return;
            console.error("useMedia error:", err);
            toast.error("Failed to load media details");
            setError(err?.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [mediaId, category, isTrailer, userObjectId, userObjId]);

    useEffect(() => {
        if (!mediaId || !category) return;
        const controller = new AbortController();
        fetchDetails(controller.signal);
        return () => controller.abort();
      }, [mediaId, category, isTrailer, userObjectId]);

    return {
        loading,
        error,
        mediaDetails,
        mediaUrl,
        subtitleUrl,
        skipInfo,
        onScreenInfo,
        currentEpisode,
        mediaTitle,
        refresh: fetchDetails
    };
};

export default useMedia;
