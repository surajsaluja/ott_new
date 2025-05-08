import { useEffect } from 'react';
import './App.css';
import MovieHomePage from './Components/MovieHomePage';
import { init} from '@noriginmedia/norigin-spatial-navigation';
import useAuth from './Hooks/useAuth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppNavigation from './Navigation';
import { useBackHandler } from './Context/BackHandlerContext';

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center'
});

function App() {
  const {fetchApiKeyAndSetSession, IsLoadingSession} = useAuth();
  const {handleBackPress} = useBackHandler();
  useEffect(()=>{
    fetchApiKeyAndSetSession();
  },[]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (
        e.key === 'Backspace' || // desktop keyboard
        e.key === 'Escape'     // optional: escape key
      ) {
        e.preventDefault();
        handleBackPress();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleBackPress]);


  if(IsLoadingSession)
  {
    return (<div className='App'>
      <p className='loading'>Loading ....</p>
    </div>)

  }

return (<div className='App'>
  <AppNavigation />
   <ToastContainer position="top-right" autoClose={3000} />
</div>)
}

export default App;
