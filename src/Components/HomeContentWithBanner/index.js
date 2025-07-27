    import LoadingSkeleton from "../Common/MovieHomeSkeleton/LoadingSkeleton";
    import { useContentWithBanner } from "./Hooks";
    import { FocusContext } from '@noriginmedia/norigin-spatial-navigation';
    import Banner from "../Banner/MovieBanner";
    import Content from "../HomePageContent/Content";
import { useMovieBannerContext } from "../../Context/movieBannerContext";
import { useEffect } from "react";

    const ContentWithBanner = ({category,focusKey}) =>{

    // const onHeaderFocus = () =>{};
    useEffect(()=>{
      console.log('content page rendered');
    })
    
      const {
        ref,
        currentFocusKey,
        hasFocusedChild,
        handleAssetFocus,
        // focusedAssetData,
        data,
        setData,
        isLoading,
        setIsLoading,
        banners,
        loadMoreRows,
        onAssetPress,
        isBannerLoadedRef,
        categoryState,
        hasMoreRows
      } = useContentWithBanner(category,focusKey);
  
      if(isLoading || data.length == 0)
      {
        return (
          <LoadingSkeleton />
        )
      }

      return (
      <FocusContext.Provider value={currentFocusKey} key={categoryState}>
      <div ref = {ref} className="content-with-banner" style={{position:'relative', width: '100%', height: '100%'}}>

        <Banner focusKey={'BANNER_FOCUS_KEY'} isBannerLoadedRef={isBannerLoadedRef} />
        <div className="assetContent" style={{position: 'absolute', height: `55vh`, bottom: 0, width: '100%'}}>
        <Content 
          data={data} 
          setData={setData} 
          isLoading={isLoading} 
          setIsLoading={setIsLoading}
          loadMoreRows={loadMoreRows}
          handleAssetFocus = {handleAssetFocus} 
          onAssetPress={onAssetPress}
          focusKey={'PLAYLIST_DATA_CONTENT_WITH_BANNER'}
          isPagination = {true}
          hasMoreRows = {hasMoreRows}
          // changeBanner = {true}
          />
        </div>
        </div>
        </FocusContext.Provider>)
    }

    export default ContentWithBanner
