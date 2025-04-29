import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function FullPageAssetContainer({ assets = [], onAssetPress = () => {} }) {
  const { ref, focusKey: currentFocusKey } = useFocusable({ focusKey: 'Assets_Container' });
  const [isLoading, setIsLoading] = useState(true);
  const dummyAssetBoxCount = 10;

  useEffect(() => {
    if (assets && assets.length > 0) {
      setIsLoading(false);
    }
  }, [assets]);

  return (
    <>
      {isLoading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {Array.from({ length: dummyAssetBoxCount }).map((_, idx) => (
            <div key={idx} className="dummyAsset_box" />
          ))}
        </div>
      ) : (
        <FocusContext.Provider value={currentFocusKey}>
          <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap' }}>
            {assets.map((asset, idx) => (
              <AssetCard key={asset.id || idx} asset={asset} onClick={() => onAssetPress(asset)} />
            ))}
          </div>
        </FocusContext.Provider>
      )}
    </>
  );
}

function AssetCard({ asset, onClick }) {
  const { ref, focused } = useFocusable();
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);
  const imgRef = useRef(null);

  const handleLoad = () => setIsImgLoaded(true);
  const handleError = () => {
    setHasImgError(true);
    setIsImgLoaded(true);
  };

  const imageUrl = asset?.webThumbnail || ''; // Adjust based on actual asset structure

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={'asset_box'}
    >
      {!isImgLoaded && (
        <div className="shimmer-placeholder card-image" />
      )}
      {!hasImgError && (
        <img
          ref={imgRef}
          className={`card-image ${focused ? 'focused' : ''} ${isImgLoaded ? 'show' : 'hide'}`}
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
