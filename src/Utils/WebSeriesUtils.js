import { fetchWebSeriesEpisodeBySeasonId } from "../Service/MediaService";

const episodeCache = {};
const seasonCache = {};
const current = {
    season: null,
    episode: null,
    webSeriesId: null
}

// Fetch and cache episodes
export const getEpisodes = async (webSeriesId, seasonId) => {
    if (episodeCache[webSeriesId]?.[seasonId]) {
        return {
            isSuccess: true,
            message: 'success',
            data: episodeCache[webSeriesId][seasonId]
        }
    }

    try {
        const episodesRes = await fetchWebSeriesEpisodeBySeasonId(webSeriesId, seasonId);
        if (episodesRes && episodesRes.isSuccess) {
            if (!episodeCache[webSeriesId]) episodeCache[webSeriesId] = {};
            let episodesProcessed = episodesRes?.data
                ? episodesRes.data.map((episode, index) => {
                    let skipInfo = {
                        skipIntroST: parseInt(episode.skipIntroST),
                        skipIntroET: parseInt(episode.skipIntroET),
                        skipRecapST: parseInt(episode.skipRecapST),
                        skipRecapET: parseInt(episode.skipRecapET),
                        nextEpisodeST: parseInt(episode.nextEpisodeST),
                    };

                    let onScreenInfo = {
                        onScreenDescription: episode.onScreenDescription,
                        onScreenDescription2: episode.onScreenDescription2,
                        onScreenDescriptionST: parseInt(episode.onScreenDescriptionST),
                        onScreenDescriptionET: parseInt(episode.onScreenDescriptionET),
                        onScreenDescription2ST: parseInt(episode.onScreenDescription2ST),
                        onScreenDescription2ET: parseInt(episode.onScreenDescription2ET),
                        ageRatedText: `RATED ${episode.ageRangeId}+`,
                    };

                    return {
                        ...episode,
                        skipInfo,
                        onScreenInfo,
                    };
                })
                : [];

            episodeCache[webSeriesId][seasonId] = episodesProcessed;
            return {
                isSuccess: true,
                message: 'success',
                data: episodeCache[webSeriesId][seasonId]
            }
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
        seasons = getSeasonsCache(webSeriesId);
    }
    if (!seasons) return null;

    for (const season of seasons) {
        let episodes = episodeCache[webSeriesId]?.[season.id];

        if (!episodes) {
            try {
                const episodesRes = await getEpisodes(webSeriesId, season.id);
                if (episodesRes && episodesRes.isSuccess) {
                    episodes = episodesRes.data;
                } else {
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
            current.season = {
                ...season,
                webSeriesId: webSeriesId
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

export const findEpisodesBySeasonId = async (webSeriesId, seasonId, mediaId) => {
    let episodes = episodeCache[webSeriesId]?.[seasonId];

    if (!episodes) {
        try {
            const episodesRes = await getEpisodes(webSeriesId, seasonId);
            if (episodesRes && episodesRes.isSuccess) {
                episodes = episodesRes.data;
            } else {
                throw new Error(episodesRes.message);
            }
        } catch (err) {

        }

        const episode = episodes.find((ep) => ep.mediaID == mediaId);
        if (episode) {
            current.episode = episode;
            setCurrentSeason(webSeriesId, seasonId);
            return {
                episodes: episodes,
                nextEpisodeMediaId: getNextEpisodeMediaId(episodes, episode.mediaID),
            };
        }

    }
}

const getNextEpisodeMediaId = (episodes, mediaId) => {
    const index = episodes.findIndex((ep) => ep.mediaID == mediaId);
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

export const setCurrentSeason = (webseriesId, seasonId) => {
    const season = seasonCache[webseriesId].find((season) => season.id == seasonId);
    if (season) {
        current.season = {
            ...season,
            webseriesId
        };
    } else {
        current.season = null;
    }
}

export const getSeasonsCache = (webSeriesId) => {
    return (seasonCache && seasonCache[webSeriesId]) || null;
}

export const getCurrentSeason = () => {
    return current.season;
}

export const getCurrentEpisode = () => {
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


