import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import AssetCard from '../AssetCard';

function FullPageAssetContainer({ assets = [], onAssetPress = () => {},focusKey }) {
  const { ref, focusKey: currentFocusKey } = useFocusable({  
    focusable: true,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: false });
  const [isLoading, setIsLoading] = useState(true);
  const dummyAssetBoxCount = 10;

  useEffect(() => {
    if(assets && assets.length == 0){
      setIsLoading(false);
    }
    if (assets && assets.length > 0) {
      setIsLoading(false);
    }
  }, [assets]);

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref} className="asset-container">
    {assets.length > 0 ? (
      <div>
        {isLoading ? (
          Array.from({ length: dummyAssetBoxCount }).map((_, idx) => (
            <div key={idx} className="dummyAsset_box" />
          ))
        ) : assets.length === 0 ? (
          <div className="no-assets-message">No assets found</div>
        ) : (
          assets.map((asset, idx) => (
            <AssetCard
              key={`${asset.id}_${idx}`}
              focusKey={`${asset.id}_${idx}`}
              assetData={asset}
              index={idx}
              onEnterPress={() => onAssetPress(asset)}
              onAssetFocus={()=>{}}
            />
          ))
        )}
      </div>
    ):(<p>No Assets Found</p>)}
    </div>
    </FocusContext.Provider>
  );
}

export default FullPageAssetContainer;
