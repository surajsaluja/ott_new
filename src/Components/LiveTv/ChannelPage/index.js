import React, { useEffect } from 'react'
import './index.css'
import FocusableButton from '../../Common/FocusableButton'
import { FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation'
import Content from '../../HomePageContent/Content'
import useLiveTvChannelPage from './Hooks/useLiveTvChannelPage'

const PLAY_BTN_FOCUS_KEY  = 'PLAY_BTN_FOCUS_KEY';

function LiveTvChannelPage({ focusKey }) {

  const {scheduledContentData, currentFocusKey, ref} = useLiveTvChannelPage(focusKey);

  useEffect(()=>{
    setFocus(PLAY_BTN_FOCUS_KEY);
  },[]);
 

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className='liveTvChannelContainer' ref={ref}>
        <div className='channelTopWrapper'>
          <div className='channelImageWrapper'>
            <img src="https://images.kableone.com/Images/TVImages/TVChannel/02_TV_3284.jpg"></img>
          </div>
          <div className='channelInformationContainer'>
            <div className='playButtonContainer'>
              <FocusableButton
                text='PLAY NOW'
                className='playBtnLiveTvChannel'
                focusClass='playBtnLiveTvChannel-focused'
                focuskey={PLAY_BTN_FOCUS_KEY}
              />
            </div>
            <div className='channelInformationWrapper'>
              <div className='channelInfoTitle'>
                YRF MUSIC
              </div>
              <div className='channelInfoDescription'>
                <p>Lorem Ipsum dhohdeo ljhdcoehd lkdheoihdoieh dclkejdpoicjei pjcpioejcioe kejdioejdopie kejdcoiejoie elkjdoejdoe kjdeopjdpej ;ejdpoejdpoje ;ldjepjdpoej deojdepoj</p>
              </div>
            </div>
          </div>
          <div className='playInfoBand'>

          </div>
        </div>
        

        {/* <div className='channelScheduleContainer'> */}
         <Content 
      onAssetFocus={()=>{}} 
      data={scheduledContentData} 
      setData={()=>{}} 
      isLoading={false} 
      setIsLoading={()=>{}}
      loadMoreRows={()=>{}}
      handleAssetFocus = {()=>{}}
      className = "liveTvChannelScheduleContent" 
      />
        </div>
      {/* </div> */}
    </FocusContext.Provider>
  )
}

export default LiveTvChannelPage