import { useState } from "react";
import { useIntersectionImageLoader } from "./useIntersectionImageLoader";

const useAssetCard = (data) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { imgRef, shouldLoad, imageUrl } = useIntersectionImageLoader(data.webThumbnail || null);

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