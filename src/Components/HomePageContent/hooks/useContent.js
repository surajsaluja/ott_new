import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useCallback, useRef, useEffect, useContext } from "react";
import { smoothScroll } from "../../../Utils";
import { debounce } from "lodash"
import { useMemo } from "react";
import { FocusedAssetUpdateContext } from "../../../Context/movieBannerContext";
const SCROLL_OFFSET = 80;

const useContentRow = (focusKey, onFocus, handleAssetFocus) => {
  const {
    ref,
    focusKey: currentFocusKey,
    hasFocusedChild,
  } = useFocusable({
    focusKey,
    // trackChildren: true,
    saveLastFocusedChild: false,
  });

  const scrollingRowRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(()=>{
    console.log('<<< content row rendered');
  })

  return {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
  };
};

const useMovieHomePage = (
  focusKeyParam,
  data,
  isLoading,
  loadMoreRows,
  isPagination,
  hasMoreRows

) => {
  const loadMoreRef = useRef(null);

  const { ref, focusKey, hasFocusedChild} = useFocusable({
    focusKey: focusKeyParam,
    trackChildren: false
  });

  // const updateFocusedAssetContextValue = useContext(FocusedAssetUpdateContext);

  useEffect(()=>{
    console.log('content container re rendered');
  })

  //  useEffect(() => {
  //   // console.log('>> has focused child', hasFocusedChild);
  //   if (!hasFocusedChild) {
  //   //  updateFocusedAssetContextValue(null);
  //   }
  // }, [hasFocusedChild]);

  useEffect(() => {
  const node = loadMoreRef.current;
  console.log('load more useEffect',{
    node: node,
    hasMoreRows,
    isPagination,
    loadMoreRows

  });

  if (!node || !hasMoreRows || !isPagination) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isLoading) {
        console.log('>> load more rows called');
        loadMoreRows();
      }
    },
    {
      rootMargin: '450px', // trigger before bottom,
      threshold: 0,
    }
  );

  observer.observe(node);
  return () => observer.disconnect();
}, [data, loadMoreRows, isLoading, hasMoreRows, isPagination]);  // 👈 added hasMoreRows

  return {
    ref,
    focusKey,
    data,
    loadMoreRef,
    isLoading,
  };
};

export { useContentRow, useMovieHomePage };
