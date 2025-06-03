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
    loadMoreRows
  } = useContentWithBanner(onHeaderFocus,category,focusKey);

  if(isLoading)
  {
    return (
      <LoadingSkeleton />
    )
  }

  return (
  <FocusContext.Provider value={currentFocusKey}>
  <div ref = {ref} className="content-with-banner">

    <Banner data={focusedAssetData} banners={banners} />
    <Content 
      onAssetFocus={handleAssetFocus} 
      data={data} 
      setData={setData} 
      isLoading={isLoading} 
      setIsLoading={setIsLoading}
      loadMoreRows={loadMoreRows}
      handleAssetFocus = {handleAssetFocus} 
      />
    </div>
    </FocusContext.Provider>)
}

export default ContentWithBanner
