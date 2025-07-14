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
    isBannerLoaded,
    onRadioChannelEnterPress,
    onBannerEnterPress,
    onBannerFocus,
    setIsBannerLoaded
  } = useRadioHomePage(focusKey);

  // if (isRadioDataLoading || !isBannerLoaded) {
  //   return <LoadingSkeleton />;
  // }

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className='radio-home' ref={ref}>
        {(isRadioDataLoading || !isBannerLoaded) && <LoadingSkeleton />}
        <div className='radio-home-content'  style={{ display : isRadioDataLoading || !isBannerLoaded ? 'none' : 'block' }}>
          <ImageSlider 
          focusKey='RADIO_BANNER_FOCUS_KEY' 
          data={radioBannersData}
          onBannerEnterPress={onBannerEnterPress}
          onBannerFocus={onBannerFocus}
          setIsBannerLoaded={setIsBannerLoaded}/>
          <div className='radio-header'>
            <div>OUR RADIO CHANNELS</div>
           </div>
           <div className='radio-content'>
        <Content
          onAssetFocus={() => { }}
          data={radioHomePageData}
          handleAssetFocus={() => { }}
          onAssetPress={onRadioChannelEnterPress}
          isCircular={true}
          showTitle={true}
          parentScrollingRef={ref}
          isPagination = {false}
          hasMoreRows = {false}
        />
        </div>
      </div>
        
      </div>
    </FocusContext.Provider>
  );
}

export default RadioHome;
