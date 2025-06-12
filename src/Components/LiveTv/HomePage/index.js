import React from 'react';
import './index.css';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import TvBanner from '../../Banner/TvBanner';
import Content from '../../HomePageContent/Content';
import { useLiveTv } from './Hooks/useLiveTv';
import LoadingSkeleton from '../../Common/MovieHomeSkeleton/LoadingSkeleton';

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
        <TvBanner focusKey='TV_BANNER_FOCUS_KEY' bannersData={liveTvBannersData} />
        <Content
          onAssetFocus={() => {}}
          data={liveTvHomePageData}
          handleAssetFocus={() => {}}
          onAssetPress={onChannelEnterPress}
        />
      </div>
    </FocusContext.Provider>
  );
}

export default LiveTvHome;
