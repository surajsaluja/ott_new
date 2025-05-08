import React, { useRef, useCallback } from "react";
import FocusableButton from "../Common/FocusableButton";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import "./Seasons_Tab.css";
import Episodes_List from "./Episodes_List";

function Seasons_Tab({
  seasons,
  selectedSeason,
  onSeasonSelect,
  episodesLength = 0,
  focusKey,
}) {
  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusable: true,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: true,
    autoRestoreFocus: true,
    forceFocus: true,
  });

  const tabsScrollingRef = useRef(null);

  const onTabFocus = useCallback(
    (el) => {
      tabsScrollingRef.current.scrollTo({
        top: el.y - 20,
        behavior: "smooth",
      });
    },
    [tabsScrollingRef]
  );

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className="season-container" ref={ref}>
        <div className="season-tabs">
          <div className={`seasonsTabScrollingWrapper`} ref={tabsScrollingRef}>
            {seasons.map((season) => (
              <FocusableButton
                key={season.id}
                text={<div className="season-button-text"><p className="season-name">{season.seasonName}</p><p className="episodes-length">{`${episodesLength} Episodes`}</p></div>}
                className={`tab_season ${
                  selectedSeason === season.id ? "tab_season_selected" : ""
                }`}
                focusClass="tab_season_focused"
                onFocus={(el) => {
                  onSeasonSelect(season.id);
                  onTabFocus(el);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
}

export default Seasons_Tab;
