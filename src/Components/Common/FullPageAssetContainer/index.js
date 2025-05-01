import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import FocusableButton from '../FocusableButton';

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
      <div ref={ref}>
    {assets.length > 0 ? (
      <div className="asset-container">
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
              asset={asset}
              index={idx}
              onClick={() => onAssetPress(asset)}
            />
          ))
        )}
      </div>
    ):(<p>No Assets Found</p>)}
    </div>
    </FocusContext.Provider>
  );
}


function AssetCard({ asset, onClick,focusKey }) {
  const { ref, focused } = useFocusable({focusKey});
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);
  const imgRef = useRef(null);

  const handleLoad = () => setIsImgLoaded(true);
  const handleError = () => {
    setHasImgError(true);
    setIsImgLoaded(true);
  };

  const imageUrl = asset?.webThumbnail || null;

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`asset_box ${focused ? 'focused' : ''}`}
    >
      {!isImgLoaded && (
        <div className={`card-image shimmer-placeholder`}><p>{asset.title}</p></div>
      )}
      {!hasImgError && imageUrl && (
        <img
          ref={imgRef}
          className={`card-image ${isImgLoaded ? 'show' : 'hide'}`}
          src={imageUrl}
          alt={asset.title || ''}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {hasImgError && (
        <div className="error-placeholder">Image not available</div>
      )}
    </div>
  );
}

export default FullPageAssetContainer;
