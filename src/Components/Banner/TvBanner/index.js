import React, { useRef, useCallback,useState, useEffect } from 'react';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { FixedSizeList as List } from "react-window";
import './index.css';
import FocusableBanner from './FocusableBanner';

function TvBanner({ focusKey, bannersData }) {

   const [listWidth, setListWidth] = useState(window.innerWidth);
  
   useEffect(() => {
    const handleResize = () => setListWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusKey,
    focusable: true,
  });

  const lastNavTimeRef = useRef(null);
  const tvBannerListRef = useRef(null);

  const scrollBannerToCenter = (index) => {
    tvBannerListRef.current?.scrollToItem(index, 'center');
  };

  const onBannerFocus = (index) => {
    console.log(`Banner ${index} focused`);
  };

  const onBannerEnterPress = (index) => {
    console.log(`Banner ${index} enter pressed`);
    // Handle enter press logic
  };

  const renderItem = useCallback(
    ({ index, style }) => (
      <div style={style} key={index}>
        <FocusableBanner
          index={index}
          data={bannersData[index]}
          scrollToCenter={scrollBannerToCenter}
          onFocus={onBannerFocus}
          onEnterPress={onBannerEnterPress}
          lastNavTimeRef={lastNavTimeRef}
        />
      </div>
    ),
    [bannersData]
  );

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className='Tv-Banner-Container'>
        {bannersData.length > 0 && (
          <List
            ref={tvBannerListRef}
            width={listWidth}
            itemCount={bannersData.length}
            itemSize={listWidth}
            layout="horizontal"
            overscanCount={bannersData.length}
          >
            {renderItem}
          </List>
        )}
      </div>
    </FocusContext.Provider>
  );
}

export default TvBanner;