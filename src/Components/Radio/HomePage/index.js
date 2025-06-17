import React, { useEffect } from 'react';
import './index.css';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import TvBanner from '../../Banner/TvBanner';
import Content from '../../HomePageContent/Content';
import { useRadioHomePage } from './Hooks/useRadioHomePage';
import LoadingSkeleton from '../../Common/MovieHomeSkeleton/LoadingSkeleton';

function RadioHome({ focusKey }) {
  const {
    focusKey: currentFocusKey,
    ref,
    focusSelf
  } = useFocusable({
    focusKey,
    preferredChildFocusKey: 'RADIO_BANNER_FOCUS_KEY',
    saveLastFocusedChild: false
  });

  useEffect(()=>{
    focusSelf();
  },[focusSelf])

  const {
    radioHomePageData,
    radioBannersData,
    isRadioDataLoading,
    onRadioChannelEnterPress
  } = useRadioHomePage();

  if (isRadioDataLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className='radio-home' ref={ref}>
        <TvBanner focusKey='RADIO_BANNER_FOCUS_KEY' bannersData={radioBannersData} />
        <Content
          onAssetFocus={() => { }}
          data={radioHomePageData}
          handleAssetFocus={() => { }}
          onAssetPress={onRadioChannelEnterPress}
          isCircular={true}
          showTitle={true}
        />
      </div>
    </FocusContext.Provider>
  );
}

export default RadioHome;
