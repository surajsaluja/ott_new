import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useCallback, useRef, useEffect } from "react";
import { showModal } from "../../../Utils";
import { useUserContext } from "../../../Context/userContext";
import { smoothScroll } from "../../../Utils";
import { useHistory } from "react-router-dom";

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

  // const onScrollToElement = 
  //   debounce((element) => {
  //     if (element && scrollingRowRef.current) {
  //       const parentRect = scrollingRowRef.current.getBoundingClientRect();
  //       const elementRect = element.getBoundingClientRect();

  //       const scrollLeft =
  //         scrollingRowRef.current.scrollLeft +
  //         (elementRect.left - parentRect.left - parentRect.x);

  //       smoothScroll(scrollingRowRef.current, scrollLeft);
  //     }
  //   }, 200);

  // const onScrollToElement = useThrottle((element) => {
  //   if (element && scrollingRowRef.current) {
  //     const parentRect = scrollingRowRef.current.getBoundingClientRect();
  //     const elementRect = element.getBoundingClientRect();

  //     const scrollLeft =
  //       scrollingRowRef.current.scrollLeft +
  //       (elementRect.left - parentRect.left - 80);

  //     smoothScroll(scrollingRowRef.current, scrollLeft);
  //   }
  // }, 300); // Adjust throttle interval to your liking

  const rafRef = useRef(null);

  const onScrollToElement = (element) => {
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



  const onAssetFocus = useCallback((element, data) => {
    onScrollToElement(element);
    handleAssetFocus(data);
  }, [onScrollToElement, smoothScroll]);


  return {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus,
  };
};

/* ------------------ Movie Home Page Hook ------------------ */
const useMovieHomePage = (focusKeyParam, data, setData, isLoading, setIsLoading, loadMoreRows,handleAssetFocus) => {
  const history = useHistory();
  const { userObjectId, isLoggedIn } = useUserContext();

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

  const loadMoreRef = useRef(null);

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
    if (element && ref.current) {
      const scrollTop = element.top - ref.current.offsetTop;
      ref.current.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, [ref, smoothScroll]);

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
