import React from 'react'
import BottomDrawer from '../Common/BottomDrawer/index.js'
import TabbedComponent from '../Common/TabbedComponent/index.js'
function TestComp() {
  return (
    <BottomDrawer isOpen={true} onClose={()=>{}}>
                    <TabbedComponent />
                </BottomDrawer>
  )
}

export default TestComp