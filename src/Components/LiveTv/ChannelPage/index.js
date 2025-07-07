import React, { useEffect } from 'react'
import './index.css'
import FocusableButton from '../../Common/FocusableButton'
import { FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation'
import Content from '../../HomePageContent/Content'
import useLiveTvChannelPage from './Hooks/useLiveTvChannelPage'

const PLAY_BTN_FOCUS_KEY  = 'PLAY_BTN_FOCUS_KEY';

function LiveTvChannelPage({ focusKey }) {

  const {
    scheduledContentData, 
    currentFocusKey, 
    ref,
    channelInfo,
  onPlayLiveTvEnterPress} = useLiveTvChannelPage(focusKey);

  useEffect(()=>{
    setFocus(PLAY_BTN_FOCUS_KEY);
  },[]);
 

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className='liveTvChannelContainer' ref={ref}>
        <div className='channelTopWrapper'>
          <div className='channelImageWrapper'>
            <img src={channelInfo.channelImage}></img>
          </div>
          <div className='channelInformationContainer'>
            <div className='playButtonContainer'>
              <FocusableButton
                text='PLAY NOW'
                className='playBtnLiveTvChannel'
                focusClass='playBtnLiveTvChannel-focused'
                focuskey={PLAY_BTN_FOCUS_KEY}
                onEnterPress={onPlayLiveTvEnterPress}
              />
            </div>
            <div className='channelInformationWrapper'>
              <div className='channelInfoTitle'>
                {channelInfo.channelTitle}
              </div>
              <div className='channelInfoDescription'>
                <p>{channelInfo.channelDescription}</p>
              </div>
            </div>
          </div>
          <div className='playInfoBand'>

          </div>
        </div>
        

        {/* <div className='channelScheduleContainer'> */}
         {scheduledContentData && scheduledContentData.length > 0 &&
         <Content 
      data={scheduledContentData} 
      className = "liveTvChannelScheduleContent"
      // onAssetPress={onPlayLiveTvEnterPress} 
      />}
        </div>
      {/* </div> */}
    </FocusContext.Provider>
  )
}

export default LiveTvChannelPage