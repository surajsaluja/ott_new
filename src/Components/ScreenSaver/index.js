
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import './index.css'; // Make sure all styles are moved here
import useScreenSaver from './Hooks/useScreenSaver';

const Screensaver = () => {

  const {
      ref,
        currentFocusKey,
        currentIndex,
        screensaverResources
  } = useScreenSaver();
 

  return (
    <FocusContext.Provider value={currentFocusKey}>
      <div className="screensaver" ref={ref}>
        {screensaverResources && screensaverResources.length > 0  && 
          <div
            className={`screen-item active `}
            key={screensaverResources[currentIndex].title}
          >
            <img src={screensaverResources[currentIndex].fullPageBanner} alt={screensaverResources[currentIndex].title} />
            <div className="info">
              <h1 className="montserrat-extrabold">{screensaverResources[currentIndex].title}</h1>
              <ul className="genres">
                {screensaverResources[currentIndex].genre?.split(',').map((gr, i) => (
                  <li key={i} className={i > 0 ? 'with-dot' : ''}>{gr}</li>
                ))}
              </ul>
              <h2>{screensaverResources[currentIndex].caption}</h2>
            </div>
          </div>
}


        {/* <img className="logoss" src="images/logo-ss.png" alt="Logo" /> */}

        {/* <div className="buttons">
          <span
            className="ssblured ssbtn"
            ref={watchRef}
            data-focusable
            data-focusable-depth="1"
            data-focusable-initial-focus="true"
          >
            ▶&nbsp; Watch
          </span>
          <span
            className="ssblured ssbtn"
            ref={moreInfoRef}
            data-focusable
            data-focusable-depth="1"
            style={{ marginLeft: 30 }}
          >
            More Details
          </span>
        </div> */}
      </div>
    </FocusContext.Provider>
  );
};

export default Screensaver;
