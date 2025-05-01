import React from 'react'
import BottomDrawer from '../Common/BottomDrawer/index.js'
import BottomTabbedComponent from '../Movie_Detail/BottomTabbedComponent.js'

function TestComp() {
  return (
    <BottomDrawer isOpen={true} onClose={()=>{}}>
                    <BottomTabbedComponent />
                </BottomDrawer>
  )
}

export default TestComp