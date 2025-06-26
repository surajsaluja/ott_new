import React, { createContext, useContext, useState } from 'react';
import { fetchWebSeriesEpisodeBySeasonId } from '../Service/MediaService';

const WebSeriesContext = createContext();

const fetchEpisodes = async (webSeriesId, seasonId) => {
  const res = await fetchWebSeriesEpisodeBySeasonId(webSeriesId, seasonId);
  if (!res.ok) throw new Error(`Failed to fetch episodes for season ${seasonId}`);
  return res.json();
};

export const WebSeriesProvider = ({ children }) => {
  const [episodeCache, setEpisodeCache] = useState({}); // { [webSeriesId]: { [seasonId]: episodes[] } }
  const [currentSeasonId, setCurrentSeasonId] = useState(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seasonListCache, setSeasonListCache] = useState({}); // { [webSeriesId]: [season objects] }

  const getEpisodes = async (webSeriesId, seasonId, forceFetch = false) => {
    setLoading(true);
    setError(null);

    try {
      if (
        !forceFetch &&
        episodeCache[webSeriesId] &&
        episodeCache[webSeriesId][seasonId]
      ) {
        return episodeCache[webSeriesId][seasonId];
      }

      const episodes = await fetchEpisodes(webSeriesId, seasonId);

      setEpisodeCache((prev) => ({
        ...prev,
        [webSeriesId]: {
          ...(prev[webSeriesId] || {}),
          [seasonId]: episodes,
        },
      }));

      return episodes;
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectSeason = (seasonId) => {
    setCurrentSeasonId(seasonId);
    setCurrentEpisodeId(null);
  };

  const selectEpisode = (episodeId) => {
    setCurrentEpisodeId(episodeId);
  };

  // 🔍 Find the season which contains the mediaId
  const findSeasonByMediaId = async (mediaId, webSeriesId, seasons = null) => {
    try {
      const allSeasons = seasons || seasonListCache[webSeriesId];

      if (!allSeasons || allSeasons.length === 0) {
        throw new Error('Season list is not provided or cached.');
      }

      for (const season of allSeasons) {
        const cached = episodeCache[webSeriesId]?.[season.id];
        const episodes = cached || await getEpisodes(webSeriesId, season.id);

        const match = episodes.find(ep => ep.mediaId === mediaId);
        if (match) {
          return season; // Return the season object containing the episode
        }
      }

      return null; // Not found in any season
    } catch (err) {
      console.error(`Failed to find season by mediaId ${mediaId}:`, err);
      return null;
    }
  };

  return (
    <WebSeriesContext.Provider
      value={{
        episodeCache,
        currentSeasonId,
        currentEpisodeId,
        selectSeason,
        selectEpisode,
        getEpisodes,
        findSeasonByMediaId,
        setSeasonListCache, // optionally expose this for caching season lists externally
        loading,
        error,
      }}
    >
      {children}
    </WebSeriesContext.Provider>
  );
};

export const useWebSeries = () => useContext(WebSeriesContext);
