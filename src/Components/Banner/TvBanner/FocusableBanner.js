import React from 'react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';

const FocusableBanner = ({ index, data, scrollToCenter, onFocus, onEnterPress, lastNavTimeRef }) => {
  const { ref, focused } = useFocusable({
    onEnterPress: () => onEnterPress(index),
    onFocus: () => {
      scrollToCenter(index);
      onFocus(index);
    },
  });

  return (
    <div
        ref={ref}
        style={{
        //   width: THUMBNAIL_WIDTH,
          // height: THUMBNAIL_HEIGHT + 30,
        //   marginRight: THUMBNAIL_GAP,
        padding: "5px",
          height: "100%",
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div
          className={`thumbnail1`}
          style={{height:"94%", justifyContent: "center", padding: "4px" ,outline:`${focused ? '4px solid white' : ''}`}}
          //transition={{ type: "spring", stiffness: 300 }}
        >
          {data.bannerImage ? (
            <img
              src={data.bannerImage}
              alt={`Thumb ${index}`}
              style={{  height: "100%", display: "block", objectFit:'contain' }}
            />
          ) : (
            <div className="thumbnail-placeholder" />
          )}
          <div className="thumbnail-time-label">
           
          </div>
        </div>
      </div>
  );
};

export default FocusableBanner;
