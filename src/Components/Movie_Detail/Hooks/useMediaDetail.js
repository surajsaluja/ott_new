import { setFocus, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useHistory } from "react-router-dom";
import Hls from "hls.js";
import { getMediaDetails, getMediaRelatedItemDetails, getTokenisedMedia, getWebSeriesEpisodesBySeason } from "../../../Utils/MediaDetails";
import { getMediaRelatedItem, updateMediaItemToWishlist } from "../../../Service/MediaService";
import { getProcessedPlaylists } from "../../../Utils";
import FullPageAssetContainer from "../../Common/FullPageAssetContainer";
import { toast } from "react-toastify";
import Season_EpisodeList from "../../Season_EpisodeList";
import StarCastContainer from "../../StarCastContainer";
import useOverrideBackHandler from "../../../Hooks/useOverrideBackHandler";
import { useUserContext } from "../../../Context/userContext";
import { showModal } from "../../../Utils";
import { clearWebSeriesCache } from "../../../Utils/WebSeriesUtils";
import { CACHE_KEYS, SCREEN_KEYS, setCache } from "../../../Utils/DataCache";

const useMediaDetail = (mediaId, categoryId, focusKey) => {
    // References for Focusable
    const { ref, focusKey: btnControlsFocusKey, hasFocusedChild, focusSelf } = useFocusable({
        focusable: true,
        trackChildren: true,
        focusKey,
        saveLastFocusedChild: true
    });

    //states
    const [isLoading, setIsLoading] = useState(false);
    const [mediaDetail, setMediaDetail] = useState(null);
    const [webSeriesId, setWebSeriesId] = useState(null);
    const [webSeriesSeasons, setWebSeriesSeasons] = useState([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState(null);

    const [relatedItems, setRelatedItems] = useState([]);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [isDrawerContentReady, setDrawerContentReady] = useState(false);
    const [isRelatedItemsLoading, setIsRelatedItemsLoading] = useState(true); // Add a loading state for related items
    const [groupedStarCasts, setGroupedStarCasts] = useState(null);
    const [isSeasonsLoading, setIsSeasonsLoading] = useState(true);
    const [showResumeBtn, setShowResumeButton] = useState(false);
    const [isMediaFavourite, setIsMediaFavourite] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [isMediaPublished, setIsMediaPublished] = useState(false);
    const [webSeriesEpisodeSelected, setWebSeriesEpisodeSelected] = useState(null);
    const webSeriesNextEpisodeMediaId = useRef(null);
    const [videoElement, setVideoElement] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const hlsRef = useRef(null);
    const videoPlayerRef = useRef(null);

    const { isLoggedIn, userObjectId } = useUserContext();

    // Support Functions
    const history = useHistory();

    const returnUserToHomePage = () => {
        history.replace('/');
        return;
    }

    // useEffects
    useEffect(() => {
        if (!mediaId) {
            returnUserToHomePage();
            return;
        }
        fetchMediaDetail(mediaId);
        setRelatedItems(null); // Reset related items when mediaId changes
        setIsRelatedItemsLoading(true); // Reset loading state
        setWebSeriesSeasons([]);
        setIsSeasonsLoading(true);
        setGroupedStarCasts(null);
        setIsError(false);
        setErrorMessage(false);
        setIsMediaPublished(false);
        setSelectedSeasonId(null);
        setWebSeriesEpisodeSelected(null);
        handleBottomDrawerClose();
        setIsVideoLoaded(false);
        setIsPlaying(false);
    }, [mediaId]);

    useEffect(() => {
        if (!webSeriesId) return
        clearWebSeriesCache(webSeriesId);
    }, [webSeriesId])

    const handleBackPressed = () => {
        if (isDrawerOpen) {
            handleBottomDrawerClose();
            return;
        } else {
            history.goBack();
        }
    }

    useOverrideBackHandler(() => {
        handleBackPressed();
    });

    // set Focus to Page when media Loads
    useEffect(() => {
        if (!isLoading && !isError && focusSelf) {
            setTimeout(() => {
                focusSelf();
            }, 50);
        }

        if (isError) {
            setTimeout(() => {
                focusSelf();
            }, 50)
        }
    }, [isLoading, focusSelf, isError]);

    useEffect(() => {
        if (isDrawerOpen) {
            const timer = setTimeout(() => {
                setDrawerContentReady(true);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setDrawerContentReady(false); // Reset when closing
            setTimeout(() => {
                focusSelf();
            }, 50);
        }
    }, [isDrawerOpen]);


    // Data Fetching Functions

    const fetchMediaDetail = async (mediaId) => {
        try {
            setCache(CACHE_KEYS.CURRENT_SCREEN, categoryId == 1 ? SCREEN_KEYS.DETAILS.MOVIES_DETAIL_PAGE : SCREEN_KEYS.DETAILS.WEBSERIES_DETAIL_PAGE);
            setIsLoading(true);
            const mediaDetailsResponse = await getMediaDetails(mediaId, categoryId);
            if (mediaDetailsResponse.isSuccess) {
                let mediaDet = mediaDetailsResponse.data.mediaDetail;
                setMediaDetail(mediaDet);
                setGroupedStarCasts(mediaDet.groupedStarCasts);
                setIsMediaFavourite(mediaDet.isAddedByUser);
                setShowResumeButton(mediaDet.playDuration > 0);
                setIsMediaPublished(mediaDet.isMediaPublished);
                if (categoryId == 2 && mediaDet.seasons && mediaDet.seasons.length > 0) {
                    setWebSeriesId(mediaDet.webSeriesId);
                    setWebSeriesSeasons(mediaDet.seasons.length > 0 ? mediaDet.seasons : []);
                    setSelectedSeasonId(mediaDet.currentSeason);
                    setWebSeriesEpisodeSelected(mediaDet.currentEpisode);
                    webSeriesNextEpisodeMediaId.current = mediaDet.nextEpisodeMediaId;
                }
                getRelatedMediaItems(mediaId);
            }
            else {
                setMediaDetail([]);
                setIsLoading(false);
                setIsError(true);
                setErrorMessage(mediaDetailsResponse.message);
            }
        } catch (err) {
            toast.error(err);
            setMediaDetail(null);
            returnUserToHomePage();
        } finally {
            setIsLoading(false);
        }
    }

    const getRelatedMediaItems = async (mediaId) => {
        try {
            const response = await getMediaRelatedItemDetails(mediaId, null, 1, 20);
            if (response.isSuccess && response.data?.length) {
                setRelatedItems(getProcessedPlaylists(response.data, 20));
            } else {
                setRelatedItems([]);
            }
        } catch (err) {
            toast.error("Failed to load related items");
            setRelatedItems([]);
        } finally {
            setIsRelatedItemsLoading(false); // Set loading to false after fetching (success or failure)
        }
    };

    const redirectToLogin = () => {
        history.push('/login', { from: '/' });
    };


    const onRelatedItemEnterPress = (assetData) => {
        if (isLoggedIn && userObjectId) {
            history.replace(`/detail/${assetData?.categoryID}/${assetData?.mediaID}`);
        }
        else {
            showModal('Login',
                'You are not logged in !!',
                [
                    { label: 'Login', action: redirectToLogin, className: 'primary' }
                ]
            );
        }
    }

    const updateMediaWishlistStatus = async () => {
        try {
            const data = {
                "VideoId": mediaId
            }
            let favouriteResponse = await updateMediaItemToWishlist(data);
            if (favouriteResponse?.isSuccess) {
                setIsMediaFavourite(favouriteResponse.message.includes('removed') ? false : true);
            } else {
                throw new Error('Error Updating Wishlist')
            }
        } catch (error) {

        }
    }

    // Seasons and Episodes Functions






    // Bottom Drawer Functions

    const handleBottomDrawerClose = () => {
        setDrawerOpen(false);
    }

    const handleBottomDrawerOpen = () => {
        if (!isDrawerOpen) {
            setTimeout(() => {
                setDrawerOpen(true);
            }, 100)
        }
    };

    // watch functions

    const watchMovie = async (isTrailer, isResume) => {
        const tokenisedResponse = await getTokenisedMedia(mediaId, isTrailer);
        if (tokenisedResponse.isSuccess) {
            history.push('/play', {
                src: tokenisedResponse.data.mediaUrl,
                thumbnailBaseUrl: isTrailer ? mediaDetail.trailerBasePath : mediaDetail.trickyPlayBasePath,
                title: mediaDetail.title,
                mediaId: mediaDetail.mediaID,
                onScreenInfo: mediaDetail.onScreenInfo,
                skipInfo: mediaDetail.skipInfo,
                isTrailer: isTrailer,
                playDuration: isResume ? mediaDetail.playDuration : 0,
                nextEpisodeMediaId: webSeriesNextEpisodeMediaId.current
            });
        } else {
            showModal('Warning',
                tokenisedResponse.message,
            );
        }
    }

    // Render Data On Bottom Drawer

    const RenderRelatedItems = useCallback(() => {
        if (isRelatedItemsLoading) return <p>Loading related items...</p>;
        if (!relatedItems.length) return <p>No related items available.</p>;

        return <FullPageAssetContainer
            assets={relatedItems}
            focusKey={'AST_CNT_DET_REL'}
            onAssetPress={onRelatedItemEnterPress} />;
    }, [isRelatedItemsLoading, relatedItems]);

    const onEpisodeEnterPress = (episode) => {
        history.replace(`/detail/${episode?.categoryID}/${episode?.mediaID}`);
    }

    const RenderSeasonEpisodes = useCallback(() => {
        if (!webSeriesSeasons || webSeriesSeasons.length === 0) return <p>No Seasons available</p>;

        return <Season_EpisodeList
            focusKey={'SEASON_CNT'}
            onEpisodeEnterPress={onEpisodeEnterPress}
            setIsSeasonsLoading={setIsSeasonsLoading}
            isSeasonsLoading={isSeasonsLoading}
            webSeriesId={webSeriesId} />
    }, [webSeriesId]);

    const RenderCastData = useCallback(() => {
        if (groupedStarCasts == null) return <p>No Star Cast Available</p>;

        return <StarCastContainer data={groupedStarCasts} />
    }, [groupedStarCasts])

    // dynamic tabs based on movies or webseries

    const tabs = useMemo(() => {
        if (!mediaDetail) return [];

        const dynamicTabs = [];

        if (categoryId == 2 && webSeriesSeasons.length > 0) {
            dynamicTabs.push({
                name: 'Seasons & Episodes',
                action: null,
                id: 1,
                renderContent: RenderSeasonEpisodes,
            });
        }

        dynamicTabs.push({
            name: 'More Like This',
            action: null,
            focusKey: 'tabDetail_RelatedItems',
            id: 2,
            renderContent: RenderRelatedItems,
        });

        if (groupedStarCasts != null) {
            dynamicTabs.push({
                name: 'StarCast',
                action: null,
                focusKey: 'tabDetail_startCast',
                id: 3,
                renderContent: RenderCastData,
            });
        }

        return dynamicTabs;
    }, [mediaDetail, webSeriesSeasons, RenderRelatedItems, RenderSeasonEpisodes]);

    
    const handleVideoCanPlay = () => {
        setIsVideoLoaded(true);
        videoElement.play().catch(error => {
            console.error("Autoplay prevented:", error);
        });
    }

    const handleVideoPlay = () => {
        setIsPlaying(true);
    }

    const handleVideoEnd = () => {
        setIsPlaying(false);
        setIsVideoLoaded(false);
    }

    const videoRef = useCallback((node) => {
        if (node !== null) {
            setVideoElement(node);
            videoPlayerRef.current = node;
        }
    }, []);

     const handlePlayerVisibilityChange = () => {
                console.log(document.hidden);
                if (document.hidden) {
                    videoElement.pause();
                    setIsPlaying(false);
                    console.log('video paused');
                } else {
                    videoElement.play();
                    setIsPlaying(true);
                    console.log('video played');
                }
            }

    useEffect(() => {
        if(!isLoading){
        setIsVideoLoaded(false);
        setIsPlaying(false);

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (!mediaDetail?.trailerPlayUrl || !videoElement) {
            console.warn('trailer not avialable');
            return;
        }

        const playTrailer = () => {
            if (!videoElement) return;

            let hls;

            videoElement.pause();
            videoElement.src = "";
            setIsVideoLoaded(false);

            videoElement.addEventListener("waiting", () => { });
            videoElement.addEventListener("canplay", handleVideoCanPlay);
            videoElement.addEventListener("playing", handleVideoPlay);
            videoElement.addEventListener("ended", handleVideoEnd)
            videoElement.addEventListener("stalled", () => { });
            window.addEventListener('visibilitychange', handlePlayerVisibilityChange);

            if (Hls.isSupported()) {
                hls = new Hls();
                hlsRef.current = hls;
                hls.loadSource(mediaDetail.trailerPlayUrl);
                hls.attachMedia(videoElement);

                hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
                    if (videoElement.textTracks) {
                        for (let i = 0; i < videoElement.textTracks.length; i++) {
                            videoElement.textTracks[i].mode = "disabled";
                        }
                    }
                });
            } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
                videoElement.src = mediaDetail.trailerPlayUrl;
            }

            // Disable subtitles/text tracks
            // Disable all subtitles / text tracks
            if (videoElement.textTracks) {
                for (let i = 0; i < videoElement.textTracks.length; i++) {
                    videoElement.textTracks[i].mode = "disabled";
                }
            }

            return () => {
                videoElement.removeEventListener("waiting", () => { });
                videoElement.removeEventListener("canplay", handleVideoCanPlay);
                videoElement.removeEventListener("playing", handleVideoPlay);
                videoElement.removeEventListener("ended", handleVideoEnd)
                videoElement.removeEventListener("stalled", () => { });
                window.removeEventListener('visibilitychange', handlePlayerVisibilityChange);
                if (hls) hls.destroy();
                setIsPlaying(false);
            };
        };

        const delayPlay = setTimeout(playTrailer, 2000);
        return () => clearTimeout(delayPlay);
    }
    }, [isLoading,mediaDetail, videoElement]);


    return {
        ref,
        btnControlsFocusKey,
        isLoading,
        mediaDetail,
        isDrawerOpen,
        tabs,
        isDrawerContentReady,
        isError,
        errorMessage,
        isMediaPublished,
        handleBottomDrawerOpen,
        handleBottomDrawerClose,
        showResumeBtn,
        isMediaFavourite,
        updateMediaWishlistStatus,
        watchMovie,
        handleBackPressed,
        isVideoLoaded,
        isPlaying,
        videoPlayerRef,
        videoRef
    }
}

export default useMediaDetail