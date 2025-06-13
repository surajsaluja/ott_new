import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useRef, useCallback, useState, useEffect} from 'react';
import './index.css';
import AssetCard from '../AssetCard';
import Spinner from '../Spinner';

function FullPageAssetContainer({ 
  assets = [],
  itemsPerRow = 4, 
  onAssetPress = () => {},
  title='', 
  focusKey, 
  isLoading = false }) 
  {
  const { ref, focusKey: currentFocusKey } = useFocusable({  
    focusable: true,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: false 
  });


  const assetScrollingRef  = useRef(null);
   const [dimensions, setDimensions] = useState({
    itemWidth: 337, // Default fallback
    itemHeight: 200,
    aspectRatio: 3/2
  });

  // Calculate dimensions based on container width
  useEffect(() => {
    const calculateDimensions = () => {
      if (assetScrollingRef.current) {
        const containerWidth = assetScrollingRef.current.offsetWidth - 10;
        const gap = 20;
        const itemWidth = ((containerWidth - (itemsPerRow * gap))  / itemsPerRow);
        
        setDimensions({
          itemWidth,
          itemHeight: 'auto', // Maintain 3:2 aspect ratio
          aspectRatio: 3/2,
          containerHeight: 'auto',
          displayImgType: 'web'
        });
      }
    };

    calculateDimensions();
    
    // Add resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(calculateDimensions);
    if (assetScrollingRef.current) {
      resizeObserver.observe(assetScrollingRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);


  const onAssetFocus = useCallback((el) => {

      assetScrollingRef.current.scrollTo({
        top: el?.offsetTop - assetScrollingRef?.current?.offsetTop - 20,
        behavior: 'smooth'
    });
    }, [assetScrollingRef]);

  return (
    <>
    {!isLoading && <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className="asset-container">
        {title && <p className='asset-container-title'>{title}</p>}
        <div className={'asset-scrolling-wrapper'} ref={assetScrollingRef}>
        {assets.length > 0 ? (
          assets.map((asset, idx) => (
            <AssetCard
              key={`${asset.id}_${idx}`}
              focusKey={`${asset.id}_${idx}`}
              assetData={asset}
              index={idx}
              onEnterPress={() => onAssetPress(asset)}
              onAssetFocus={onAssetFocus}
              dimensions={dimensions}
              showTitle={true}
            />
          ))
        ) : (
          <div className="no-assets-message">No assets found</div>
        )}
        </div>
        </div>
    </FocusContext.Provider>}
    {isLoading && <Spinner/>}
    </>
  );
}

export default FullPageAssetContainer;
