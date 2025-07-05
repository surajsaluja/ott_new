    import LoadingSkeleton from "../Common/MovieHomeSkeleton/LoadingSkeleton";
    import { useContentWithBanner } from "./Hooks";
    import { FocusContext } from '@noriginmedia/norigin-spatial-navigation';
    import Banner from "../Banner/MovieBanner";
    import Content from "../HomePageContent/Content";

    const ContentWithBanner = ({category,focusKey}) =>{

    const onHeaderFocus = () =>{};
    
      const {
        ref,
        currentFocusKey,
        hasFocusedChild,
        handleAssetFocus,
        focusedAssetData,
        data,
        setData,
        isLoading,
        setIsLoading,
        banners,
        loadMoreRows,
        onAssetPress,
        isBannerLoadedRef
      } = useContentWithBanner(onHeaderFocus,category,focusKey);

      if(isLoading)
      {
        return (
          <LoadingSkeleton />
        )
      }

      return (
      <FocusContext.Provider value={currentFocusKey}>
      <div ref = {ref} className="content-with-banner" style={{position:'relative', width: '100%', height: '100%'}}>

        <Banner data={focusedAssetData} banners={banners} focusKey={'BANNER_FOCUS_KEY'} isBannerLoadedRef={isBannerLoadedRef} />
        <div className="assetContent" style={{position: 'absolute', height: `${focusedAssetData == null ? '40vh' : '55vh'}`, bottom: 0, width: '100%'}}>
        <Content 
          onAssetFocus={handleAssetFocus} 
          data={data} 
          setData={setData} 
          isLoading={isLoading} 
          setIsLoading={setIsLoading}
          loadMoreRows={loadMoreRows}
          handleAssetFocus = {handleAssetFocus} 
          onAssetPress={onAssetPress}
          />
        </div>
        </div>
        </FocusContext.Provider>)
    }

    export default ContentWithBanner
