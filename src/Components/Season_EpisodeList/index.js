import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useState, useCallback, useRef, useEffect } from 'react'
import Seasons_Tab from './Seasons_Tab';
import Episodes_List from './Episodes_List';
import './index.css'
import { getCurrentSeason, getEpisodes, getSeasonsCache } from '../../Utils/WebSeriesUtils';

function Season_EpisodeList({ webSeriesId, focusKey, onEpisodeEnterPress, setIsSeasonsLoading, isSeasonsLoading }) {

  const SEASON_TABS_FOCUS_KEY = "SEASON_TABS";
  const EPISODES_LIST_FOCUS_KEY = "EPISODES_LIST";

 const [episodes,setEpisodes] = useState([]);
 const [seasonSelected,setSeasonSelected] = useState(null);
 const [seasons,setSeasons] = useState([]);

 useEffect(()=>{
  let currentSeason = getCurrentSeason();
  const seasonsData = getSeasonsCache(webSeriesId);
  setSeasonSelected(currentSeason.id);
  setSeasons(seasonsData);
  loadEpisodes(currentSeason.id);
 },[webSeriesId])

  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusable: true,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: false,
    autoRestoreFocus: true,
    forceFocus: true,
    preferredChildFocusKey: SEASON_TABS_FOCUS_KEY
  });

  const loadEpisodes = useCallback(async (seasonId) => {
    if(!seasonId) return;
          try {
            setIsSeasonsLoading(true);
              const episodesRes = await getEpisodes(webSeriesId,seasonId);
                if(episodesRes && episodesRes.isSuccess){
                      setEpisodes(episodesRes.data);
                  }else{
                      throw new Error(episodesRes.message);
                  }
          } catch (err) {
              console.error('Failed to load episodes', err);
          }
          finally {
              setIsSeasonsLoading(false);
          }
      }, [webSeriesId]);

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className={'season-episode-list'}>
        <Seasons_Tab
          seasons={seasons}
          selectedSeason={seasonSelected}
          onSeasonSelect={loadEpisodes}
          episodesLength={episodes.length}
          focusKey={SEASON_TABS_FOCUS_KEY} />
        {episodes && episodes.length > 0 ? (<Episodes_List
          episodes={episodes}
          focusKey={EPISODES_LIST_FOCUS_KEY}
          onEpisodeEnterPress={onEpisodeEnterPress}
        />) : (<div className='episode-error-container'>No Episodes Available</div>)}
      </div>
    </FocusContext.Provider>
  )
}

export default Season_EpisodeList