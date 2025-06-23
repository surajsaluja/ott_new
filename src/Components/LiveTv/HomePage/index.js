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
    focusKey: currentFocusKey,
    ref
  } = useFocusable({
    focusKey,
    preferredChildFocusKey: 'TV_BANNER_FOCUS_KEY',
    saveLastFocusedChild: false
  });

  const {
    liveTvHomePageData,
    isTvDataLoading,
    liveTvBannersData,
    onChannelEnterPress
  } = useLiveTv();

  if (isTvDataLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className='LiveTv-Home' ref={ref}>
        <div className='LiveTv-Home-Content'>
          {/* <div className="ImageSliderWrapper"> */}
            <ImageSlider data={liveTvBannersData} />
          {/* </div> */}
          <Content
            onAssetFocus={() => { }}
            data={liveTvHomePageData}
            handleAssetFocus={() => { }}
            onAssetPress={onChannelEnterPress}
            scrollingRef={ref}
          />
        </div>
      </div>
    </FocusContext.Provider>
  );
}

export default LiveTvHome;
