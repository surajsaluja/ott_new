import { useEffect, useState, useRef } from "react"
import { fetchScreenSaverContent } from '../../../Service/MediaService';
import { sanitizeAndResizeImage } from '../../../Utils';
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
const useScreenSaver = () =>{
   const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef(null);
    const isScreenSaverLoadedRef = useRef();
    const [screensaverResources, setScreensaverResources] = useState([]);
  
    const { ref, focusKey: currentFocusKey } = useFocusable({ focusKey: 'SCREENSAVER' });
  
    const loadScreenSaverData = async () => {
      try {
        const response = await fetchScreenSaverContent();
        if (response?.isSuccess && response?.data) {
          const processed = response.data.map((el) => ({
            ...el,
            fullPageBanner: sanitizeAndResizeImage(el.fullPageBanner, 1280),
          }));
          setScreensaverResources(processed);
        } else {
          throw new Error(response?.message || 'Failed to load screensaver data');
        }
      } catch (err) {
        console.error('Screensaver load error:', err);
      }
    };
  
    useEffect(() => {
        if(isScreenSaverLoadedRef.current) return;

      loadScreenSaverData();
      isScreenSaverLoadedRef.current = true;
    }, []);
  
    useEffect(() => {
      if (screensaverResources.length === 0) return;
  
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % screensaverResources.length);
      }, 2000);
  
      return () => clearInterval(intervalRef.current);
    }, [screensaverResources]);
  
    const onWatchClipSS = () => {
      console.log('Watch Now clicked');
      // trigger player
    };
  
    const onMoreInfoItemClickSS = () => {
      console.log('More Details clicked');
      // open detail page
    };

    return{
        ref,
        currentFocusKey,
        currentIndex,
        screensaverResources,
        onWatchClipSS,
        onMoreInfoItemClickSS
    }
}

export default useScreenSaver