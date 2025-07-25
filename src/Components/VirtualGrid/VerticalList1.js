import React, { useEffect, useRef, useCallback, useDebugValue } from 'react';
import { VariableSizeList as List } from 'react-window';
import HorizontalList from './HorizontalList';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';

function VerticalList1({ data }) {
  const verticalListRef = useRef(null);

  // Stable item height function
  const getItemSize = useCallback((index)=>{
    debugger;
    let height  = data[index]?.height ?? 200;
    console.log(height +" " + index + " "+ data[index].title);
    return height;
  },[data])

  const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({
    focusKey: 'VERTICAL_LIST_1',
  });

  useEffect(() => {
    focusSelf();
  }, [focusSelf]);

  // Move Row out of the render body
  const Row = useCallback(({ index, style }) => {
    const height = style.height;
    return (
      <div style={style}>
        <HorizontalList
          focusKey={`LIST_${index}`}
          verticalListRef={verticalListRef}
          index={index}
          rowHeight={height}
        />
      </div>
    );
  }, []);

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div ref={ref}>
        <List
          ref={verticalListRef}
          height={window.innerHeight}
          itemCount={data.length}
          itemSize={getItemSize}
          width={window.innerWidth}
          overscanCount={5}
        >
          {Row}
        </List>
      </div>
    </FocusContext.Provider>
  );
}

export default VerticalList1;
