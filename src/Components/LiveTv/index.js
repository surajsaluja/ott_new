import React, { useEffect } from 'react'
import './index.css'
import { FocusContext, setFocus, useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import TvBanner from '../Banner/TvBanner'

function LiveTvHome(focusKey) {
    const {focusKey: currentFocusKey, ref, focusSelf} = useFocusable({
        focusKey,
        preferredChildFocusKey: 'TV_BANNER_FOCUS_KEY'
    })

    const bannerData = [
  {
    "id": 1020,
    "tvId": 4,
    "channelHandle": "Saga-Hits-Movie",
    "name": "Saga Hits Movie",
    "bannerImage": "https://images.kableone.com/Images/TVImages/TVBanner/Virsa_1536_530_2_74de.jpg",
    "bannerDescription": "Watch Saga Hits Live TV",
    "bannerName": "Saga Hits Movie",
    "isReminder": false,
    "isClickable": true,
    "showTime": "2023-12-19T04:00:00",
    "source": null
  },
  {
    "id": 1022,
    "tvId": 1,
    "channelHandle": "YRF-Music",
    "name": "YRF Music",
    "bannerImage": "https://images.kableone.com/Images/TVImages/TVBanner/Mumkin_1536x530_c3b1_9783.jpg",
    "bannerDescription": "r",
    "bannerName": "test",
    "isReminder": false,
    "isClickable": false,
    "showTime": "2025-04-07T00:00:00",
    "source": null
  }
];

    // useEffect(()=>{
    //   setFocus('TV_BANNER_FOCUS_KEY');
    // },[focusSelf]);

  return (
    <FocusContext.Provider value={currentFocusKey}>
    <div className='LiveTv-Home' ref={ref}>
    <TvBanner focusKey={'TV_BANNER_FOCUS_KEY'} bannersData={bannerData}></TvBanner>
    <TvBanner focusKey={'TV_BANNER_FOCUS_KEY'} bannersData={bannerData}></TvBanner>
    </div>
    </FocusContext.Provider>
  )
}

export default LiveTvHome