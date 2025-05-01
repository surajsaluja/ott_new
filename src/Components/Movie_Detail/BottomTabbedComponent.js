import { useState, useEffect } from "react";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../Common/FocusableButton";
import FullPageAssetContainer from "../Common/FullPageAssetContainer";
import './index.css';

const BottomTabbedComponent = ({
  isDrawerContentReady = true,
  tabs = [],
  focusKey
}) => {
  const {
    ref,
    focusKey: currentFocusKey,
    focusSelf
  } = useFocusable({
    focusable: true,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: true
  });

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    if (isDrawerContentReady) {
      // Delay focus to ensure DOM ref is attached
      const timer = setTimeout(() => {
        focusSelf();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isDrawerContentReady, focusSelf]);

  if (!isDrawerContentReady || tabs.length === 0) return null;

  return (
      <div className="bottom-content-detail">
        {/* Tab Buttons */}
        <FocusContext.Provider value={currentFocusKey}>
        <div className="bottomDrawer-detail-tabs" ref={ref}>
          {tabs.map((tab, index) => (
            <FocusableButton
              key={tab.id}
              text={tab.name}
              className="btn-bottomDrawer-detail-tab"
              focusClass="btn-bottomDrawer-detail-tab-focused"
              onFocus={() => setActiveTabIndex(index)}
            />
          ))}
        </div>
        </FocusContext.Provider>

        {/* Tab Content Carousel */}
        <div className="bottomDrawer-detail-assets-slider-wrapper">
          <div
            className="bottomDrawer-detail-assets-slider"
            style={{
              display: 'flex',
              width: `${tabs.length * 100}%`,
              transform: `translateX(-${activeTabIndex * (100 / tabs.length)}%)`,
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className="bottomDrawer-detail-tab-content"
                style={{ width: `${100 / tabs.length}%`, flexShrink: 0 }}
              >
                {typeof tab.renderContent === 'function' ? tab.renderContent() : null}
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default BottomTabbedComponent;