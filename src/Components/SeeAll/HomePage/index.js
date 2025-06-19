import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useHistory } from 'react-router-dom';
import Banner from '../../Banner/MovieBanner';
import FullPageAssetContainer from '../../Common/FullPageAssetContainer';
import { fetchPlayListContent } from '../../../Service/MediaService';
import { getCategoryIdByCategoryName } from '../../../Utils'; // Assumed utility

const PLAYLIST_PAGE_SIZE = 10;

function SeeAllPlaylistContentHomePage({ focusKey, isLoggedIn }) {
    const playListId = 236;

    const [playListData, setPlayListData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const hasMoreRef = useRef(true);
    const history = useHistory();

    const loadPlayListData = async (page = 1) => {
        if (page === 1) setPlayListData([]);
        setIsLoading(true);
        try {
            if (isLoggedIn) {
                const response = await fetchPlayListContent(playListId, page, PLAYLIST_PAGE_SIZE);
                if (response?.isSuccess) {
                    const newData = response.data;
                    setPlayListData(prev => (page === 1 ? newData : [...prev, ...newData]));
                    hasMoreRef.current = newData.length === PLAYLIST_PAGE_SIZE;
                    setPageNum(page);
                } else {
                    throw new Error(response?.message || 'Failed to load playlist.');
                }
            } else {
                throw new Error('Please login to view the playlist content.');
            }
        } catch (error) {
            console.error('Playlist Data Error', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPlayListData(1);
    }, []);

    const loadMoreRows = useCallback(async () => {
        if (isLoading || !hasMoreRef.current) return;
        await loadPlayListData(pageNum + 1);
    }, [isLoading, pageNum]);

    const onCardPress = useCallback((assetData) => {
        const categoryId = getCategoryIdByCategoryName(assetData?.category);
        history.push(`/detail/${categoryId}/${assetData?.mediaID}`);
    }, [history]);

    const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({
        focusKey,
        focusable: !isLoading && playListData.length > 0
    });

    useEffect(() => {
        if (!isLoading && playListData.length > 0) {
            focusSelf();
        }
    }, [focusSelf, isLoading, playListData]);

    return (
        <FocusContext.Provider value={currentFocusKey}>
            <div className='seeAll-content-wrapper' ref={ref}>
                <Banner focusKey={'SEE_ALL_PAGE_BANNER'} data={[]} />
                <FullPageAssetContainer
                    focusKey={'SEE_ALL_FULL_PAGE_CONTAINER'}
                    assetData={playListData}
                    isLoading={isLoading}
                    onEndReached={loadMoreRows}
                    onAssetPress={onCardPress}
                />
            </div>
        </FocusContext.Provider>
    );
}

export default SeeAllPlaylistContentHomePage;
