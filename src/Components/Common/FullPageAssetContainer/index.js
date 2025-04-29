import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useState } from 'react';
import './index.css';

function FullPageAssetContainer({ assets, onAssetPress }) {
    const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({ focusKey: 'Assets_Container' });
    const [isLoading, setIsLoading] = useState(true);
    const dummyAssetBoxCount = 15;

    return (
        <>
            {isLoading ? (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {Array.from({ length: dummyAssetBoxCount }).map((_, idx) => (
                        <div
                            key={idx}
                            className="dummyAsset_box"
                        >
                        </div>
                    ))}
                </div>
            ) : (
                <FocusContext.Provider value={currentFocusKey}>
                    <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {assets.map((asset, idx) => (
                            <div 
                                key={asset.id || idx}
                                onClick={() => onAssetPress(asset)}
                                style={{ width: 100, height: 150, background: '#999', margin: 10 }}
                            >
                                {asset.title}
                            </div>
                        ))}
                    </div>
                </FocusContext.Provider>
            )}
        </>
    );
}

export default FullPageAssetContainer;
