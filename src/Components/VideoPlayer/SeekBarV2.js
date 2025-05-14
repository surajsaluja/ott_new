import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useFocusable,
  initNavigation,
  FocusContext,
  focusElementByKey
} from '@noriginmedia/norigin-spatial-navigation';
import './SeekBarV2.css';
import FocusableButton from '../Common/FocusableButton';
import AssetCard from '../Common/AssetCard';

const THUMBS_VISIBLE = 7;

const SeekBar = ({
  videoRef,
  visible,
  onClose,
  thumbnailBaseUrl,
  thumbnailInterval = 10
}) => {
  const [seekTime, setSeekTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekDirection = useRef(null);
  const seekInterval = useRef(null);

  const duration = videoRef?.current?.duration || 0;
  const currentTime = videoRef?.current?.currentTime || 0;
  const activeIndex = Math.floor(seekTime / thumbnailInterval) || 0;
  const totalThumbnails = Math.floor(duration / thumbnailInterval);

  const centerIndex = activeIndex;
  const startIndex = Math.max(0, centerIndex - Math.floor(THUMBS_VISIBLE / 2));
  const endIndex = Math.min(totalThumbnails, startIndex + THUMBS_VISIBLE - 1);

  const thumbnails = useMemo(() => {
    const list = [];
    if (startIndex != 0) {
      for (let i = startIndex; i <= endIndex; i++) {
        list.push({
          time: i * thumbnailInterval,
          src: `${thumbnailBaseUrl}${String(i.toString().padStart(9, '0'))}.jpg`,
          index: i,
          key: `THUMB_${i}`
        });
      }
    }
    return list;
  }, [startIndex, endIndex, thumbnailBaseUrl, thumbnailInterval]);

  const { ref, focusKey } = useFocusable({
    focusKey: 'THUMBNAIL_ROW',
    isFocusBoundary: true
  });

  // Focus center thumbnail when visible
  // useEffect(() => {
  //   if (visible) {
  //     setSeekTime(videoRef?.current?.currentTime || 0);
  //     const middleThumb = thumbnails.find(t => t.index === activeIndex);
  //     if (middleThumb) {
  //       setTimeout(() => {
  //         // focusElementByKey(`THUMB_${middleThumb.index}`);
  //       }, 0);
  //     }
  //   } else {
  //     stopSeekHold();
  //   }
  // }, [visible, thumbnails]);

  const seekTo = (time) => {
    if (videoRef?.current) {
      videoRef.current.currentTime = time;
    }
  };

  const onThumbnailPress = (time) => {
    seekTo(time);
    onClose?.();
  };

  // const startSeekHold = (dir) => {
  //   seekDirection.current = dir;
  //   seekInterval.current = setInterval(() => {
  //     setSeekTime((prev) => {
  //       const next =
  //         dir === 'right'
  //           ? Math.min(prev + thumbnailInterval, duration)
  //           : Math.max(prev - thumbnailInterval, 0);
  //       return next;
  //     });
  //   }, 200);
  // };

  // const stopSeekHold = () => {
  //   clearInterval(seekInterval.current);
  //   seekInterval.current = null;
  //   seekDirection.current = null;
  // };

  const handleEnter = () => {
    seekTo(seekTime);
    onClose?.();
  };

  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (!visible) return;

  //     if (e.repeat) return;

  //     if (e.key === 'ArrowRight') {
  //       setIsSeeking(true);
  //       startSeekHold('right');
  //     } else if (e.key === 'ArrowLeft') {
  //       setIsSeeking(true);
  //       startSeekHold('left');
  //     } else if (e.key === 'Enter' && isSeeking) {
  //       handleEnter();
  //       setIsSeeking(false);
  //     } else if (e.key === 'Backspace') {
  //       onClose?.();
  //     }
  //   };

  //   const handleKeyUp = (e) => {
  //     if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
  //       stopSeekHold();
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   window.addEventListener('keyup', handleKeyUp);
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //     window.removeEventListener('keyup', handleKeyUp);
  //   };
  // }, [visible, isSeeking, seekTime]);

  if (!visible) return null;

  return (
    <FocusContext.Provider value={focusKey}>
      <div className="seekbar-container1 slide-in1">
        <div className="thumbnail-strip1">
          <div className='thumbnials-wrapper1' ref={ref}>
          {Array.from({ length: 50 }, (_, i) => i).map(({ src, time, key },index) => (
            <AssetCard
              key={index}
              onEnterPress={()=>{}}
              assetData={{title:`index ${index}`}}
            />
          ))}
          </div>
        </div>

        <div className="seek-time-indicator1">{(seekTime)}</div>

        <div className="progress-bar1">
          <div
            className="progress-indicator1"
            style={{ width: `${(seekTime / duration) * 100}%` }}
          />
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default SeekBar;