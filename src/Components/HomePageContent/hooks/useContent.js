import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useCallback, useRef, useEffect } from "react";
import { showModal } from "../../../Utils";
import { useUserContext } from "../../../Context/userContext";
import { smoothScroll } from "../../../Utils";
import { useHistory } from "react-router-dom";
import { debounce } from "lodash"
const SCROLL_OFFSET = 80;

/* ------------------ Content Row Hook ------------------ */
const useContentRow = (focusKey, onFocus, handleAssetFocus) => {
  const {
    ref,
    focusKey: currentFocusKey,
    hasFocusedChild,
  } = useFocusable({
    focusKey,
    trackChildren: true,
    saveLastFocusedChild: true,
    onFocus,
  });

  const scrollingRowRef = useRef(null);
  const rafRef = useRef(null);

const scrollToElement = (element) => {
    if (!element || !scrollingRowRef.current) return;

    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const parentRect = scrollingRowRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const scrollLeft =
        scrollingRowRef.current.scrollLeft +
        (elementRect.left - parentRect.left - parentRect.x);

      smoothScroll(scrollingRowRef.current, scrollLeft, 150);
    });
  };


//  const throttleScroll = useRef(throttle((element) => {
//     if (!element || !scrollingRowRef.current) return;
//     const parentRect = scrollingRowRef.current.getBoundingClientRect();
//     const elementRect = element.getBoundingClientRect();
//     const scrollLeft = scrollingRowRef.current.scrollLeft +
//       (elementRect.left - parentRect.left - SCROLL_OFFSET);
//     smoothScroll(scrollingRowRef.current, scrollLeft, 100);
//   }, 200)).current;

//   const debouncedSnap = useRef(debounce((element) => {
//     if (!element || !scrollingRowRef.current) return;
//     const parentRect = scrollingRowRef.current.getBoundingClientRect();
//     const elementRect = element.getBoundingClientRect();
//     const scrollLeft = scrollingRowRef.current.scrollLeft +
//       (elementRect.left - parentRect.left - SCROLL_OFFSET);
//     smoothScroll(scrollingRowRef.current, scrollLeft, 250);
//   }, 50)).current;

  // Debounced version of scrollToElement
  const debouncedScroll = useRef(
    debounce((element) => {
      scrollToElement(element);
    }, 100)
  ).current;

  const onAssetFocus = useCallback(
    (element, data) => {
      // Always update asset focus immediately
      handleAssetFocus(data);
      // Scroll only after focus is stable (debounced)
      // throttleScroll(element);      // during key repeat
    // debouncedSnap(element);
      debouncedScroll(element);
    },
    [handleAssetFocus,debouncedScroll]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedScroll.cancel();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus
  };
};


/* ------------------ Movie Home Page Hook ------------------ */
const useMovieHomePage = (focusKeyParam, data, setData, isLoading, setIsLoading, loadMoreRows,handleAssetFocus) => {
  const history = useHistory();
  const { userObjectId, isLoggedIn } = useUserContext();
  const scrollDebounceRef = useRef();
  const loadMoreRef = useRef(null);

  const { ref, focusKey, hasFocusedChild } = useFocusable({
    focusKey: focusKeyParam,
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  useEffect(()=>{
    if(!hasFocusedChild){
      handleAssetFocus(null);
    }
  },[hasFocusedChild]);

  useEffect(() => {
  // initialize debounce once
  scrollDebounceRef.current = debounce((scrollTop) => {
    if (ref.current) {
      ref.current.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, 50); // 300ms debounce
   return () => {
    scrollDebounceRef.current?.cancel?.();
  };
}, []);


  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreRows();
        }
      },
      {
        rootMargin: "600px",
        threshold: 0.5,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [data]);

const onRowFocus = useCallback((element) => {
  if (element && ref.current && scrollDebounceRef.current) {
    const scrollTop = element.top - ref.current.offsetTop;
    scrollDebounceRef.current(scrollTop);
  }
}, [ref]);

  const redirectToLogin = () => {
    history.push('/login', { from: '/' });
  };

  const onAssetPress = (item) => {
    if (isLoggedIn && userObjectId) {
      history.push(`/detail/${item?.assetData?.categoryID}/${item?.assetData?.mediaID}`);
        }
        else {
          showModal('Login',
            'You are not logged in !!',
            [
              { label: 'Login', action: redirectToLogin, className: 'primary' }
            ]
          );
        }
  };

  return {
    ref,
    focusKey,
    onRowFocus,
    onAssetPress,
    data,
    loadMoreRef,
    isLoading,
  };
};

export { useContentRow, useMovieHomePage };
