import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import './index.css';
import useScreenSaver from './Hooks/useScreenSaver';
import FocusableButton from '../Common/FocusableButton';
import React, { memo } from 'react';

const ScreenSaverContent = memo(({ resource }) => {
  if (!resource) return null;

  return (
    <div className="screen-saver-screen-item active" key={resource.title}>
      <img src={resource.fullPageBanner} alt={resource.title} />
      <div className="screen-saver-info">
        <h1 className="montserrat-extrabold">{resource.title}</h1>
        <ul className="screen-saver-genres">
          {resource.genre?.split(',').map((gr, i) => (
            <li key={i} className={i > 0 ? 'with-dot' : ''}>{gr}</li>
          ))}
        </ul>
        <h2>{resource.caption}</h2>
      </div>
    </div>
  );
});

const Screensaver = () => {
  const {
    ref,
    currentFocusKey,
    currentIndex,
    screensaverResources,
    onWatchClipSS,
    onMoreInfoItemClickSS,
  } = useScreenSaver();

  const current = screensaverResources[currentIndex];

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className="screensaver" ref={ref}>
        <ScreenSaverContent resource={current} />

        {/* Buttons should not rerender on screen content change */}
        <div className='screen-saver-buttons-container'>
          <FocusableButton
            className='screen-saver-button'
            focusClass='screen-saver-button-focused'
            text='Watch Now'
            focusKey='SCREEN_SAVER_WATCH_BUTTON'
            onEnterPress={onWatchClipSS}
          />
          <FocusableButton
            className='screen-saver-button'
            focusClass='screen-saver-button-focused'
            text='More Info'
            focusKey='SCREEN_SAVER_DETAIL_BUTTON'
            onEnterPress={onMoreInfoItemClickSS}
          />
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default Screensaver;
