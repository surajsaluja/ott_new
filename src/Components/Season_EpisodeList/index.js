import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React from 'react'
import Seasons_Tab from './Seasons_Tab';
import Episodes_List from './Episodes_List';
import './index.css'

function Season_EpisodeList({ seasons, selectedSeason, onSeasonSelect, episodes, focusKey }) {
  
  const SEASON_TABS_FOCUS_KEY = "SEASON_TABS";
  const EPISODES_LIST_FOCUS_KEY = "EPISODES_LIST";

  const { ref, focusKey: currentFocusKey } = useFocusable({
      focusable: true,
      trackChildren: true,
      focusKey,
      saveLastFocusedChild: false,
      autoRestoreFocus: true,
      forceFocus: true,
      preferredChildFocusKey: SEASON_TABS_FOCUS_KEY
    });

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className={'season-episode-list'}>
      <Seasons_Tab seasons={seasons} selectedSeason={selectedSeason} onSeasonSelect={onSeasonSelect} focusKey={SEASON_TABS_FOCUS_KEY}/>
      {episodes && episodes.length > 0 ? (<Episodes_List episodes={episodes} focusKey={EPISODES_LIST_FOCUS_KEY}/>) : (<div className='episode-error-container'>No Episodes Available</div>)}
      </div>
    </FocusContext.Provider>
  )
}

export default Season_EpisodeList