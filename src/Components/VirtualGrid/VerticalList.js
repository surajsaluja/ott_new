import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import React, { useEffect } from 'react'
import HorizontalList from './HorizontalList'

function VerticalList() {
    const {ref, focusKey: currentFocusKey, focusSelf} = useFocusable({
        focusKey: 'VERTICAL_LIST',
    });
    useEffect(()=>{
        focusSelf();
    },[focusSelf])

  return (
    <FocusContext.Provider value={currentFocusKey}>
        <div ref={ref}>
            <HorizontalList focusKey={'LIST_1'}/>
            <HorizontalList focusKey={'LIST_2'}/>
        </div>

    </FocusContext.Provider>
  )
}

export default VerticalList