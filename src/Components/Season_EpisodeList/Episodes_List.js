import "./Episodes_List.css";
import { useRef, useCallback } from "react";
import { formatTime, getEclipsedTrimmedText } from "../../Utils";
import { MdOutlineTimer, MdStarRate } from "react-icons/md";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";

const EpisodeItem = ({ episode, onFocus : onEpisodeFocus , onEpisodeEnterPress}) => {
  const { ref, focused } = useFocusable({ onFocus: onEpisodeFocus, onEnterPress: onEpisodeEnterPress,extraProps: episode });
  return (
    <div
      ref={ref}
      className={`episode-item`}
    >
        <div className={`image-thumbnail-placeholder ${focused ? "focused" : ""}`}>
      <img
        src={episode.webThumbnail}
        alt={episode.title}
        className={`episode-thumbnail`}
      />
      </div>
      <div className="episode-meta">
        <div className="episode-title">{getEclipsedTrimmedText(episode.title,55)}</div>
        <div className="episode-info">
          {episode.smiSubtitleUrl && (
            <span>{episode.smiSubtitleUrl}</span>
          )}
          {episode.releasedYear && (
            <span>
           <span className="episode-list-bullet-seprator"></span> 
           <span>{episode.releasedYear}</span>
           </span>
          )}
          {episode?.duration && formatTime(episode.duration) && (
            <span>
              <span className="episode-list-bullet-seprator"></span> 
              <span>{formatTime(episode.duration)}</span>
            </span>
          )}
          {/* {episode?.rating && (
            <span>
              <i><MdStarRate /></i>
              {episode.rating}
            </span>
          )} */}
        </div>
        <div className="episode-desc">{getEclipsedTrimmedText(episode.shortDescription,200)}</div>
      </div>
    </div>
  );
};

const Episodes_List = ({ episodes: selectedEpisodes, focusKey, onEpisodeEnterPress =()=>{} }) => {
  const { ref, focusKey: currentFocusKey } = useFocusable({
    focusable: true,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: false,
  });

  const episodesScrollingRef = useRef(null);

  const onEpisodeFocus = useCallback(({ y }) => {
    episodesScrollingRef.current.scrollTo({
      top: y - 20,
      behavior: 'smooth'
  });
  }, [episodesScrollingRef]);

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className="episode-list-container" ref={ref}>
        <div className="episode-list" ref={episodesScrollingRef}>
          {selectedEpisodes.length === 0 ? (
            <div className="no-episodes">No episodes available</div>
          ) : (
            selectedEpisodes.map((episode, idx) => (
              <EpisodeItem
                key={`${episode.mediaID || "ep"}-${idx}`}
                episode={episode}
                onFocus={onEpisodeFocus}
                onEpisodeEnterPress={onEpisodeEnterPress}
              />
            ))
          )}
      </div>
      </div>
    </FocusContext.Provider>
  );
};

export default Episodes_List;
