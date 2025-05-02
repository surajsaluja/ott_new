import { useState, useEffect } from "react";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import FocusableButton from "../FocusableButton";
import './index.css';

const TabbedComponent = ({
  isParentContentReady = true,
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
    if (isParentContentReady) {
      // Delay focus to ensure DOM ref is attached
      const timer = setTimeout(() => {
        focusSelf();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isParentContentReady, focusSelf]);

  if (!isParentContentReady || tabs.length === 0) return null;

  return (
    <div className="tabbedContent-wrapper">
      {/* Tab Buttons */}
      <FocusContext.Provider value={currentFocusKey}>
        <div className="tabbedContent-tabs-wrapper" ref={ref}>
          {tabs.map((tab, index) => (
            <FocusableButton
              key={tab.id}
              text={tab.name}
              className="tabbedContent-tab"
              focusClass="tabbedContent-tab-focused"
              onFocus={() => setActiveTabIndex(index)}
            />
          ))}
        </div>
      </FocusContext.Provider>

      {/* Tab Content Carousel */}
      <div className="tabbedContent-window-slider-wrapper">
        <div className="tabbedContent-window-slider">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              style={{
                display: activeTabIndex === index ? 'block' : 'none',
              }}
              className="tabbedContent-tab-detail"
            >
              {typeof tab.renderContent === 'function' ? tab.renderContent() : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabbedComponent;