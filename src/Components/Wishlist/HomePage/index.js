
import FullPageAssetContainer from '../../Common/FullPageAssetContainer';
import { FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import useWishList from './Hooks';
import LoadingSkeleton from '../../Common/MovieHomeSkeleton/LoadingSkeleton';

function WishlistHome({ focusKey }) {

  const {
    ref,
    wishlistData,
    isLoading,
    hasMore,
    currentFocusKey,
    loadMoreRows,
    onCardPress,
    isError,
    errorMessage
  } = useWishList(focusKey)


  return (
    <FocusContext.Provider value={currentFocusKey}>
    <div className="search-page" ref={ref}>
       <FullPageAssetContainer
          focusKey="WISHLIST_PAGE_ASSETS"
          assets={wishlistData}
          itemsPerRow={4}
          title="MY FAVOURITES"
          isLoading={isLoading}
          isPagination={true}
          hasMore={hasMore}
          loadMoreRows={loadMoreRows}
          onAssetPress={onCardPress}
        />
      </div>
    </FocusContext.Provider>
  );
}

export default WishlistHome;
