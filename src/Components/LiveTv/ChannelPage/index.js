import React, { useEffect } from 'react'
import './index.css'
import FocusableButton from '../../Common/FocusableButton'
import { FocusContext } from '@noriginmedia/norigin-spatial-navigation'
import Content from '../../HomePageContent/Content'
import useLiveTvChannelPage from './Hooks/useLiveTvChannelPage'

const scheduledPrograms = [
  {
    "id": 28,
    "programmeId": 34,
    "tvId": 1,
    "tvName": "YRF Music",
    "name": null,
    "programmeName": "FRESH ARRIVALS",
    "url": "https://images.kableone.com/Images/TVImages/TVProgram/FreshArrivals_0b2d.jpg",
    "tokenId": null,
    "fromDate": "2025-06-10T06:30:00",
    "toDate": "2025-06-10T13:29:00",
    "title": "FRESH ARRIVALS"
  },
  {
    "id": 29,
    "programmeId": 36,
    "tvId": 1,
    "tvName": "YRF Music",
    "name": null,
    "programmeName": "POP CHARTBUSTERS",
    "url": "https://images.kableone.com/Images/TVImages/TVProgram/PopChartbusters_c529.jpg",
    "tokenId": null,
    "fromDate": "2025-06-10T13:30:00",
    "toDate": "2025-06-10T14:29:00",
    "title": "POP CHARTBUSTERS"
  },
  {
    "id": 36,
    "programmeId": 33,
    "tvId": 1,
    "tvName": "YRF Music",
    "name": null,
    "programmeName": "FILMY HITS",
    "url": "https://images.kableone.com/Images/TVImages/TVProgram/FilmyHits_34df.jpg",
    "tokenId": null,
    "fromDate": "2025-06-11T11:30:00",
    "toDate": "2025-06-11T12:29:00",
    "title": "FILMY HITS"
  },
  {
    "id": 37,
    "programmeId": 34,
    "tvId": 1,
    "tvName": "YRF Music",
    "name": null,
    "programmeName": "FRESH ARRIVALS",
    "url": "https://images.kableone.com/Images/TVImages/TVProgram/FreshArrivals_0b2d.jpg",
    "tokenId": null,
    "fromDate": "2025-06-11T12:30:00",
    "toDate": "2025-06-11T13:29:00",
    "title": "FRESH ARRIVALS"
  },
  {
    "id": 38,
    "programmeId": 36,
    "tvId": 1,
    "tvName": "YRF Music",
    "name": null,
    "programmeName": "POP CHARTBUSTERS",
    "url": "https://images.kableone.com/Images/TVImages/TVProgram/PopChartbusters_c529.jpg",
    "tokenId": null,
    "fromDate": "2025-06-11T13:30:00",
    "toDate": "2025-06-11T14:29:00",
    "title": "POP CHARTBUSTERS"
  }
]

function LiveTvChannelPage({ focusKey }) {

  const {scheduledContentData, currentFocusKey, ref} = useLiveTvChannelPage(focusKey);
 

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