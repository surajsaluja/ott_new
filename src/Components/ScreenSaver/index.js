import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import './index.css';
import useScreenSaver from './Hooks/useScreenSaver';
import FocusableButton from '../Common/FocusableButton';

const Screensaver = () => {
  const {
    ref,
    currentFocusKey,
    currentIndex,
    screensaverResources
  } = useScreenSaver();

  const current = screensaverResources[currentIndex];

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className="screensaver" ref={ref}>
          {current && <div className="screen-saver-screen-item active" key={current.title}>
            <img src={current.fullPageBanner} alt={current.title} />
            <div className="screen-saver-info">
              <h1 className="montserrat-extrabold">{current.title}</h1>
              <ul className="screen-saver-genres">
                {current.genre?.split(',').map((gr, i) => (
                  <li key={i} className={i > 0 ? 'with-dot' : ''}>{gr}</li>
                ))}
              </ul>
              <h2>{current.caption}</h2>

              {/* 👇 Make button container a focusable parent */}
              <div className='screen-saver-buttons-container'>
                <FocusableButton
                  className='screen-saver-button'
                  focusClass='screen-saver-button-focused'
                  text='Watch Now'
                  focusKey='SCREEN_SAVER_WATCH_BUTTON'
                />
                <FocusableButton
                  className='screen-saver-button'
                  focusClass='screen-saver-button-focused'
                  text='More Info'
                  focusKey='SCREEN_SAVER_DETAIL_BUTTON'
                />
              </div>
            </div>
          </div>}
      </div>
    </FocusContext.Provider>
  );
};

export default Screensaver;
