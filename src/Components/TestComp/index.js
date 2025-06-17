import React from 'react'
import BottomDrawer from '../Common/BottomDrawer/index.js'
import TabbedComponent from '../Common/TabbedComponent/index.js'
import LiveTvChannelPage from '../LiveTv/ChannelPage/index.js'
import ChannelBanner from '../LiveTv/ChannelPage/index.js'
import LiveTvPlayer from '../LiveTv/Player/index.js'
import LiveTvHome from '../LiveTv/HomePage'
import RadioHome from '../Radio/HomePage/index.js'
import RadioPlayer from '../Radio/Player/index.js'
import WishlistHome from '../Wishlist/HomePage/index.js'
// import SeekBarWithPreview from '../VirtualList/SeekWithPreview.js'
// import VirtualizedSeekbarWithThumbnails from '../VirtualList/HorizontalList.js'
function TestComp() {
  return (
   <WishlistHome focusKey={'WISHLIST_PAGE'}/>
  )
}

export default TestComp