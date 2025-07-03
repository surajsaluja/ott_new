import React from 'react';
import './index.css';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import Content from '../HomePageContent/Content';

const flattenCast = (data) => {
  const combined = [];

  Object.entries(data).forEach(([role, members]) => {
    members.forEach((member) => {
      combined.push({
        ...member,
        role
      });
    });
  });

  return combined;
};

const Credits = ({ data }) => {
  // const allMembers = flattenCast(data);
  const {ref,focusKey: currentFocusKey } = useFocusable({focusKey: 'STARCAST_CONTAINER'});

  return (
    <FocusContext.Provider value={currentFocusKey}>
    <div className="credits-container" ref={ref}>
        <Content
          onAssetFocus={() => { }}
          data={data}
          handleAssetFocus={() => { }}
          // onAssetPress={onRadioChannelEnterPress}
          isCircular={true}
          showTitle={true}
          parentScrollingRef={ref}
        />
    </div>
    </FocusContext.Provider>
  );
};

export default Credits;
