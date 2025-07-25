import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { FixedSizeList as HList } from 'react-window';
import React, { useRef, memo, useCallback, useEffect, useDebugValue } from 'react';
import './index.css'

const THUMBNAIL_GAP = 50;
const ITEM_WIDTH = 350;
const ITEM_HEIGHT = 50;
const ITEM_COUNT = 10;

const ThumbnailItem = memo(({ index, lastNavTimeRef, rowRef, focusKey, rowHeight }) => {
    const { ref, focused } = useFocusable({
        focusKey,
        onFocus: () => {
            if(rowRef)
           rowRef.current.scrollToItem(index,'smart');
        },
        onEnterPress: () => {},
        focusable: true,
        onArrowPress: (direction) => {
            if (!focused) return false;
            if (direction === 'left' || direction === 'right') {
                const now = Date.now();
                if (now - lastNavTimeRef.current < 50) return false;
                lastNavTimeRef.current = now;
                return true;
            }
        },
    });

    useEffect(()=>{
        console.log(`<<item rerendered  ${focusKey}`);
    })

    return (
        <div
            ref={ref}
            style={{
                width: ITEM_WIDTH,
                height: rowHeight - 50,
                marginRight: THUMBNAIL_GAP,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: focused ?  '3px solid white' : 'none',
                backgroundColor: 'grey',
                color: '#000',
                fontWeight: focused ? 'bold' : 'normal',
                borderRadius: 8,
            }}
        >
            {focusKey}
        </div>
    );
});

const HorizontalList = ({ index, focusKey, style, verticalListRef, rowHeight }) => {
    const { ref, focusKey: listFocusKey, focusSelf } = useFocusable({
        focusKey,
        saveLastFocusedChild: false,
        onFocus: () => {
            verticalListRef.current.scrollToItem(index, 'smart');
        },
    });

    const listRef = useRef(null);
    const lastNavTimeRef = useRef(0);

    const renderItem = useCallback(
        ({ index, style }) => (
            <div style={style} key={index}>
                <ThumbnailItem
                    index={index}
                    lastNavTimeRef={lastNavTimeRef}
                    rowRef={listRef}
                    focusKey={`${focusKey}_${index}`}
                    rowHeight = {rowHeight}
                />
            </div>
        ),
        [focusKey]
    );

    return (
        <FocusContext.Provider value={listFocusKey}>
            <div
                className='row-horizontal'
                ref={ref}
                style={{
                    ...style,
                    height: rowHeight, // <-- apply the dynamic height here
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 30, // <-- adds spacing between rows
                }}
            >
                <HList
                    ref={listRef}
                    height={rowHeight} // <-- apply the dynamic height here as well
                    width={window.innerWidth}
                    itemCount={ITEM_COUNT}
                    itemSize={ITEM_WIDTH + THUMBNAIL_GAP}
                    layout="horizontal"
                    overscanCount={10}
                >
                    {renderItem}
                </HList>
            </div>
        </FocusContext.Provider>
    );
};

export default HorizontalList;
