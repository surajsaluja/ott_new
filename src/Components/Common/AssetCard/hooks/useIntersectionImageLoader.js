  import { useEffect, useState, useRef } from 'react';

  export const useIntersectionImageLoader = (imageUrl) => {
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
      if (!imgRef.current) return;

      const scrollRoot = imgRef.current.closest(".ContentRowScrollingWrapper") || null;
      

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Load once
          }
        },
        {
          root: scrollRoot, // horizontal scroll container
          rootMargin: '300px 500px 300px 500px', // preload both directions
          threshold: 0.1
        }
      );

      observer.observe(imgRef.current);

      return () => {
        observer.disconnect();
      };
    }, [imgRef]);

    return { imgRef, shouldLoad: isVisible, imageUrl };
  };
