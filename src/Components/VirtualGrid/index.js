import React, { useState, useRef, useEffect } from 'react';
import {
  VariableSizeList as VerticalList,
  FixedSizeList as HorizontalList
} from 'react-window';
import {
    FocusContext,
  useFocusable
} from '@noriginmedia/norigin-spatial-navigation';


const ITEM_WIDTH = 300;
const ITEM_HEIGHT = 220;
const ROW_HEIGHT = 280;
const INITIAL_ROWS = 5;
const ITEMS_PER_ROW = 10;

const generateItem = (rowIndex, itemIndex) => ({
  id: `item-${rowIndex}-${itemIndex}`,
  title: `Item ${rowIndex}-${itemIndex}`
});

const generateRow = (rowIndex) => ({
  id: `row-${rowIndex}`,
  title: `Category ${rowIndex}`,
  items: Array.from({ length: ITEMS_PER_ROW }, (_, i) => generateItem(rowIndex, i))
});

export default function VerticalHorizontalList() {
  const verticalListRef = useRef(null);
  const [rows, setRows] = useState(() =>
    Array.from({ length: INITIAL_ROWS }, (_, i) => generateRow(i))
  );

  const {ref, focusKey:currentFocusKey, focusSelf} = useFocusable({
    focusKey: 'VERTICAL_LIST_CNT',
    saveLastFocusedChild: true
  });

  useEffect(()=>{
    focusSelf();
  },[focusSelf]);

  const loadMoreRows = () => {
    const newRows = Array.from({ length: 3 }, (_, i) => generateRow(rows.length + i));
    setRows((prev) => [...prev, ...newRows]);
  };

  const handleVerticalItemsRendered = ({ visibleStopIndex }) => {
    if (visibleStopIndex >= rows.length - 2) {
      loadMoreRows();
    }
  };

  const getItemSize = () => ROW_HEIGHT;

  const Row = ({ index, style }) => {
    const horizontalListRef = useRef(null);
    const { ref } = useFocusable({
      focusKey: `ROW-${index}`,
      saveLastFocusedChild: true,
      onFocus: () => {
        verticalListRef.current?.scrollToItem(index, 'smart');
      }
    });


    return (
      <div ref={ref} style={style}>
        <div style={{ paddingLeft: 60, marginBottom: 6, fontSize: 20, color: '#fff' }}>
          {rows[index].title}
        </div>

        
          <HorizontalList
            ref={horizontalListRef}
            height={ITEM_HEIGHT}
            width={window.innerWidth}
            itemCount={rows[index].items.length}
            itemSize={ITEM_WIDTH}
            layout="horizontal"
            overscanCount={4}
          >
            {({ index: itemIdx, style }) => (
              <Item
                item={rows[index].items[itemIdx]}
                style={style}
                itemIndex={itemIdx}
                rowIndex={index}
                horizontalListRef={horizontalListRef}
              />
            )}
          </HorizontalList>
      </div>
    );
  };

  return (
    <FocusContext.Provider value={currentFocusKey}>
        <div ref={ref}>
    <VerticalList
      ref={verticalListRef}
      height={window.innerHeight}
      width={window.innerWidth}
      itemCount={rows.length}
      itemSize={getItemSize}
      onItemsRendered={handleVerticalItemsRendered}
      overscanCount={2}
    >
      {Row}
    </VerticalList>
    </div>
    </FocusContext.Provider>
  );
}

const Item = ({ item, style, rowIndex, itemIndex, horizontalListRef }) => {
  const { ref, focused } = useFocusable({
    focusKey: `ITEM-${rowIndex}-${itemIndex}`,
    onFocus: () => {
      horizontalListRef?.current?.scrollToItem(itemIndex, 'smart');
    }
  });

  return (
    <div
      ref={ref}
      style={{
        ...style,
        marginRight: 10,
        width: ITEM_WIDTH - 20,
        height: ITEM_HEIGHT - 20,
        background: focused ? '#ff7f00' : '#444',
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        border: focused ? '4px solid #ffd700' : '4px solid transparent',
        transform: focused ? 'scale(1.05)' : 'scale(1.0)',
        transition: 'all 200ms ease-in-out',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: focused ? '0 0 20px rgba(255,215,0,0.8)' : 'none',
      }}
    >
      {item.title}
    </div>
  );
};
