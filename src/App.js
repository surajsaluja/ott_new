import { useEffect } from 'react';
import './App.css';
import MovieHomePage from './Components/MovieHomePage';
import { init} from '@noriginmedia/norigin-spatial-navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center'
});

function App() {

return (<div className='App'>
   <MovieHomePage />
   <ToastContainer position="top-right" autoClose={3000} />
</div>)
}

export default App;
