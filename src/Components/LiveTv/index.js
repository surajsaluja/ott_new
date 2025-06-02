import React from 'react'
import './index.css'
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation'

function LiveTvHome(focusKey) {
    const {focusKey: currentFocusKey, ref} = useFocusable({
        focusKey,
    })
  return (
    <FocusContext.Provider value={currentFocusKey}>
    <div className='LiveTv-Home' ref={ref}>
    </div>
    </FocusContext.Provider>
  )
}

export default LiveTvHome