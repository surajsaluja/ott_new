import { useEffect } from 'react';
import './App.css';
import MovieHomePage from './Components/MovieHomePage';
import { init} from '@noriginmedia/norigin-spatial-navigation';
import useAuth from './Hooks/useAuth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginScreen from './Components/Login';

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center'
});

function App() {
  const {fetchApiKeyAndSetSession, IsLoadingSession} = useAuth();
  useEffect(()=>{
    fetchApiKeyAndSetSession();
  },[]);

  if(IsLoadingSession)
  {
    return (<div className='App'>
      <p className='loading'>Loading ....</p>
    </div>)

  }

return (<div className='App'>
  {/* <MovieHomePage /> */}
  <LoginScreen />
  {/* <Menu /> */}
   <ToastContainer position="top-right" autoClose={3000} />
</div>)
}

export default App;
