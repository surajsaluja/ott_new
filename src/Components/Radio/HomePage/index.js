import React, { useEffect } from 'react';
import './index.css';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import TvBanner from '../../Banner/TvBanner';
import Content from '../../HomePageContent/Content';
import { useRadioHomePage } from './Hooks/useRadioHomePage';
import LoadingSkeleton from '../../Common/MovieHomeSkeleton/LoadingSkeleton';
import ImageSlider from '../../Common/Carousal_Banner';

function RadioHome({ focusKey }) {

  const {
    ref,
    currentFocusKey,
    radioHomePageData,
    radioBannersData,
    isRadioDataLoading,
    onRadioChannelEnterPress,
    onBannerEnterPress,
    onBannerFocus
  } = useRadioHomePage(focusKey);

  if (isRadioDataLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className='radio-home' ref={ref}>
        <div className='radio-home-content'>
          <ImageSlider 
          focusKey='RADIO_BANNER_FOCUS_KEY' 
          data={radioBannersData}
          onBannerEnterPress={onBannerEnterPress}
          onBannerFocus={onBannerFocus} />
          <div className='radio-header'>
            <div>OUR RADIO CHANNELS</div>
           </div>
        <Content
          onAssetFocus={() => { }}
          data={radioHomePageData}
          handleAssetFocus={() => { }}
          onAssetPress={onRadioChannelEnterPress}
          isCircular={true}
          showTitle={true}
          parentScrollingRef={ref}
        />
      </div>
        
      </div>
    </FocusContext.Provider>
  );
}

export default RadioHome;
