import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useRef, useCallback} from 'react';
import './index.css';
import AssetCard from '../AssetCard';

function FullPageAssetContainer({ assets = [], onAssetPress = () => {}, focusKey }) {
  const { ref, focusKey: currentFocusKey } = useFocusable({  
    focusable: true,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: false 
  });

  const assetScrollingRef  = useRef(null);

  const onAssetFocus = useCallback((el) => {

      assetScrollingRef.current.scrollTo({
        top: el?.offsetTop - assetScrollingRef?.current?.offsetTop - 20,
        behavior: 'smooth'
    });
    }, [assetScrollingRef]);

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className="asset-container">
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
            />
          ))
        ) : (
          <div className="no-assets-message">No assets found</div>
        )}
        </div>
        </div>
    </FocusContext.Provider>
  );
}

export default FullPageAssetContainer;
