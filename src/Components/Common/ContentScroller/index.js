import React, { useRef, useEffect, useState } from 'react';
import {
  useFocusable,
} from '@noriginmedia/norigin-spatial-navigation';
import './index.css';

const ContentScroller = ({ children }) => {
  const scrollRef = useRef(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);

  const { ref, focusKey, focused } = useFocusable({
    onEnterPress: () => { },
    onArrowPress: (direction) => {
      if (!scrollRef.current) return;

      if (direction === 'down') {
        scrollRef.current.scrollBy({ top: 50, behavior: 'smooth' });
        const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
        updateThumb();
        return scrollTop + clientHeight >= scrollHeight;
      }
      if (direction === 'up') {
        scrollRef.current.scrollBy({ top: -50, behavior: 'smooth' });
        updateThumb();
        return scrollRef.current.scrollTop <= 0;
      }

    }
  });

   const updateThumb = () => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const thumbHeightRatio = clientHeight / scrollHeight;
    const newThumbHeight = clientHeight * thumbHeightRatio;
    const newThumbTop = (scrollTop / scrollHeight) * clientHeight;

    setThumbHeight(newThumbHeight);
    setThumbTop(newThumbTop);
  };

  useEffect(() => {
    ref.current && ref.current.focus();
    updateThumb();
  }, []);

  return (
    <div
      ref={ref}
      className='content-scroller-container'
    >
      <div
        ref={scrollRef}
        className='content-scroller-wrapper'
      >
        {children}
      </div>
      <div className='scroll-thumb-wrapper'>
     <div
        className="scroll-thumb"
        style={{
          height: `${thumbHeight}px`,
          top: `${thumbTop}px`,
          backgroundColor: `${focused ? 'red' : '#333'}`
        }}
      />
    </div>
    </div>
  );
};

export default ContentScroller;
