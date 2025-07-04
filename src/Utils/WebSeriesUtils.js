import { fetchWebSeriesEpisodeBySeasonId } from "../Service/MediaService";

const episodeCache = {};
const seasonCache = {};
const current = {
    season : null,
    episode: null,
    webSeriesId : null
}

// Fetch and cache episodes
export const getEpisodes = async (webSeriesId, seasonId) => {
    if (episodeCache[webSeriesId]?.[seasonId]) {
        return {isSuccess: true,
                message: 'success',
                data : episodeCache[webSeriesId][seasonId]}
    }

    try {
        const episodesRes = await fetchWebSeriesEpisodeBySeasonId(webSeriesId, seasonId);
        if (episodesRes && episodesRes.isSuccess) {
            if (!episodeCache[webSeriesId]) episodeCache[webSeriesId] = {};
            let episodesProcessed = episodesRes?.data ? episodesRes?.data?.map((episode, index)=> ({
                title: episode.title,
                mediaID: episode.mediaID,
                seasonId: episode.seasonId,
                shortDescription: episode.shortDescription,
                categoryID: episode.categoryID,
                seasonName: episode.seasonName,
                webThumbnail: episode.webThumbnail,
                isAddedByUser: episode.isAddedByUser,
                duration: episode.duration,
                webSeriesId: episode.webSeriesId,
                 episodeNumber: String(index + 1).padStart(2, '0')
            })) : [];
            episodeCache[webSeriesId][seasonId] = episodesProcessed;
            return {isSuccess: true,
                message: 'success',
                data : episodesProcessed}
        } else {
            throw new Error(episodesRes.message);
        }
    } catch (error) {
        return {
            isSuccess: false,
            message: error.message || 'Unknown error',
            data: null
        }
    }
};

// Find season by mediaId
export const findSeasonByMediaId = async (mediaId, webSeriesId, seasonsData = null) => {
    let seasons = seasonCache[webSeriesId] || seasonsData;
    if (!seasonCache[webSeriesId]) {
        setSeasonCache(webSeriesId, seasons);
        seasons  = getSeasonsCache(webSeriesId);
    }
    if (!seasons) return null;

    for (const season of seasons) {
        let episodes = episodeCache[webSeriesId]?.[season.id];

        if (!episodes) {
            try {
                const episodesRes = await getEpisodes(webSeriesId, season.id);
                if(episodesRes && episodesRes.isSuccess){
                    episodes = episodesRes.data;
                }else{
                    throw new Error(episodesRes.message);
                }
            } catch (err) {
                console.error(`Failed to fetch episodes for season ${season.id}`, err);
                continue;
            }
        }

        const episode = episodes.find((ep) => ep.mediaID === mediaId);
        if (episode) {
            current.episode = episode;
            current.season = {...season,
                webSeriesId : webSeriesId
            };
            return {
                currentSeason: season,
                currentEpisode: episode,
                nextEpisodeMediaId: getNextEpisodeMediaId(episodes, episode.mediaID),
            };
        }
    }

    return null;
};

const getNextEpisodeMediaId = (episodes, mediaId) => {
    const index = episodes.findIndex((ep) => ep.mediaID === mediaId);
    return index >= 0 && index + 1 < episodes.length ? episodes[index + 1].mediaID : null;
};

export const setSeasonCache = (webSeriesId, seasons) => {
    // Add seasonNumber before storing
    const updatedSeasons = seasons.map((season, index) => ({
        ...season,
        seasonNumber: index + 1 // 1-based index
    }));
    seasonCache[webSeriesId] = updatedSeasons;
};

export const setCurrentSeason = (webseriesId,seasonId) =>{
    const season = seasonCache[webseriesId].find((season) => season.id === seasonId);
    if(season){
    current.season = {...season,
        webseriesId
    };
    } else{
        current.season = null;
    }
}

export const getSeasonsCache = (webSeriesId) => {
    return (seasonCache && seasonCache[webSeriesId]) || null;
}

export const getCurrentSeason = () =>{
    return current.season;
}

export const getCurrentEpisode = () =>{
    return current.episode;
}

export const clearWebSeriesCache = (webSeriesIdToKeep) => {
    // Clear episodeCache except for the provided webSeriesId
    Object.keys(episodeCache).forEach(key => {
        if (key !== webSeriesIdToKeep && key !== 'currentEpisode') {
            delete episodeCache[key];
        }
    });

    // Clear seasonCache except for the provided webSeriesId
    Object.keys(seasonCache).forEach(key => {
        if (key !== webSeriesIdToKeep && key !== 'currentSeason') {
            delete seasonCache[key];
        }
    });

    // Reset current if it doesn't match retained webSeriesId
    if (
        current.season?.webSeriesId !== webSeriesIdToKeep
    ) {
        current.season = null;
    }

    if (
        current.episode?.webSeriesId !== webSeriesIdToKeep
    ) {
        current.episode = null;
    }
};


