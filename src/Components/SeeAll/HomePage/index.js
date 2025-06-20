import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import Banner from '../../Banner/MovieBanner';
import FullPageAssetContainer from '../../Common/FullPageAssetContainer';
import './index.css'
import useSeeAllPage from './Hooks/useSeeAllPage';

function SeeAllPlaylistContentHomePage({ focusKey }) {

    const {
        ref,
        currentFocusKey,
        focusedAssetData,
        playListData,
        isLoading,
        hasMore,
        loadMoreRows,
        onCardPress,
        handleAssetFocus,
        playListName
    } = useSeeAllPage(focusKey);

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div className='seeAll-content-wrapper' ref={ref} >
               {focusedAssetData && <Banner focusKey={'SEE_ALL_PAGE_BANNER'} data={focusedAssetData} /> }
                <div className='asset-container-wrapper'
                >
                    <FullPageAssetContainer
                        focusKey={'SEE_ALL_FULL_PAGE_CONTAINER'}
                        assets={playListData}
                        itemsPerRow={4}
                        title={playListName}
                        isLoading={isLoading}
                        isPagination={true}
                        hasMore={hasMore}
                        loadMoreRows={loadMoreRows}
                        onAssetPress={onCardPress}
                        handleAssetFocus={handleAssetFocus}
                    />
                </div>
            </div>
        </FocusContext.Provider>
    );
}

export default SeeAllPlaylistContentHomePage;
