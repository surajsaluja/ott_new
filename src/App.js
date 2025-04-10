import { useEffect } from 'react';
import './App.css';
import MovieHomePage from './MovieHomePage';
import { init} from '@noriginmedia/norigin-spatial-navigation';

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center'
});

function App() {

return (<div className='App'>
   <MovieHomePage />
</div>)
}

export default App;
