import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useCallback, useRef, useEffect } from "react";
import { smoothScroll } from "../../../Utils";
import { debounce } from "lodash"
import { useMemo } from "react";
const SCROLL_OFFSET = 80;

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

  const scrollToElement = useCallback((element) => {
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
  }, []);

  const debouncedScroll = useMemo(() => 
    debounce((element) => scrollToElement(element), 100),
    [scrollToElement]
  );

  const onAssetFocus = useCallback(
    (element, data) => {
      handleAssetFocus(data);
      debouncedScroll(element);
    },
    [handleAssetFocus, debouncedScroll]
  );

  useEffect(() => () => {
    debouncedScroll.cancel();
    cancelAnimationFrame(rafRef.current);
  }, [debouncedScroll]);

  return {
    ref,
    currentFocusKey,
    hasFocusedChild,
    scrollingRowRef,
    onAssetFocus
  };
};

const useMovieHomePage = (
  focusKeyParam,
  data,
  setData,
  isLoading,
  setIsLoading,
  loadMoreRows,
  handleAssetFocus,
  parentScrollingRef
) => {
  const scrollDebounceRef = useRef();
  const loadMoreRef = useRef(null);

  const { ref, focusKey, hasFocusedChild } = useFocusable({
    focusKey: focusKeyParam,
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  useEffect(() => {
    if (!hasFocusedChild) {
      handleAssetFocus(null);
    }
  }, [hasFocusedChild, handleAssetFocus]);

  useEffect(() => {
    scrollDebounceRef.current = debounce((scrollTop) => {
      if (ref.current) {
        ref.current.scrollTo({ top: scrollTop, behavior: "smooth" });
      }
    }, 50);

    return () => {
      scrollDebounceRef.current?.cancel?.();
    };
  }, [ref]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          // loadMoreRows();
        }
      },
      {
        rootMargin: "600px",
        threshold: 0.5,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [data, loadMoreRows, isLoading]);

  const onRowFocus = useCallback(
    (element) => {
      const scroller = parentScrollingRef?.current ?? ref.current;
      if (!element || !scroller) return;

      const containerRect = scroller.getBoundingClientRect();
      const scrollTop = element.top - containerRect.top;

      if (parentScrollingRef) {
        const containerHeight = containerRect.height;
        const centerOffset = scrollTop - containerHeight / 2 + (element.height ?? 0) / 2;
        scroller.scrollTo({ top: centerOffset, behavior: "smooth" });
      } else {
        scrollDebounceRef.current?.(scrollTop - 15);
      }
    },
    [ref, parentScrollingRef]
  );

  return {
    ref,
    focusKey,
    onRowFocus,
    data,
    loadMoreRef,
    isLoading,
  };
};

export { useContentRow, useMovieHomePage };
