import { useState } from "react";
import { useIntersectionImageLoader } from "./useIntersectionImageLoader";

const useAssetCard = (data, dimensions) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
    const imgUrl = dimensions.displayImgType === 'web' ? data.webThumbnail : data.mobileThumbnail;
  const { imgRef, shouldLoad, imageUrl } = useIntersectionImageLoader(imgUrl || null);

  const handleLoad = () => setIsLoaded(true);
  const handleError = (e) => {
  console.log('Image load error:', e?.target?.src);
  setHasError(true);
  setIsLoaded(true);
};
  return {
    imgRef,
    shouldLoad,
    imageUrl,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
  };
};

export default useAssetCard