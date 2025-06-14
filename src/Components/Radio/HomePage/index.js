import React from 'react';
import './index.css';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import TvBanner from '../../Banner/TvBanner';
import Content from '../../HomePageContent/Content';
import { useRadioHomePage } from './Hooks/useRadioHomePage';
import LoadingSkeleton from '../../Common/MovieHomeSkeleton/LoadingSkeleton';

function RadioHome({ focusKey }) {
  const {
    focusKey: currentFocusKey,
    ref
  } = useFocusable({
    focusKey,
    preferredChildFocusKey: 'RADIO_BANNER_FOCUS_KEY',
    saveLastFocusedChild: false
  });

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
          onAssetFocus={() => {}}
          data={radioHomePageData}
          handleAssetFocus={() => {}}
          onAssetPress={onRadioChannelEnterPress}
        />
      </div>
    </FocusContext.Provider>
  );
}

export default RadioHome;
