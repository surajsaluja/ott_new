import React from 'react';
import './index.css';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import TvBanner from '../../Banner/TvBanner';
import Content from '../../HomePageContent/Content';
import { useLiveTv } from './Hooks/useLiveTv';
import LoadingSkeleton from '../../Common/MovieHomeSkeleton/LoadingSkeleton';
import Carousel from '../../Common/Carousal_Banner';
import ImageSlider from '../../Common/Carousal_Banner';

function LiveTvHome({ focusKey }) {

  const {
    ref,
    currentFocusKey,
    liveTvHomePageData,
    isTvDataLoading,
    liveTvBannersData,
    onChannelEnterPress,
    onBannerEnterPress,
    onBannerFocus
  } = useLiveTv(focusKey);

  if (isTvDataLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className='LiveTv-Home' ref={ref}>
        <div className='LiveTv-Home-Content'>
          <ImageSlider
          focusKey={'TV_BANNER_FOCUS_KEY'}
           data={liveTvBannersData} 
           onBannerEnterPress={onBannerEnterPress} 
           onBannerFocus={onBannerFocus}/>
           <div className='live-tv-header'>
            <div>OUR CHANNELS</div>
           </div>
          <Content
            onAssetFocus={() => { }}
            data={liveTvHomePageData}
            handleAssetFocus={() => { }}
            onAssetPress={onChannelEnterPress}
            parentScrollingRef={ref}
          />
        </div>
      </div>
    </FocusContext.Provider>
  );
}

export default LiveTvHome;
