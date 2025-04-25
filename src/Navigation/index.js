import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MovieHomePage from '../Components/MovieHomePage';
import Movie_Detail from '../Components/Movie_Detail';
import LoginScreen from '../Components/Login';
import PrivateRoute from './PrivateRoute';
import Error404 from '../Components/Error404';

function AppNavigation() {

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={MovieHomePage} />
        <PrivateRoute path="/detail/:mediaId" component={Movie_Detail}/>
        <Route path="/login" component={LoginScreen} />
        <Route path="*" component={Error404} />
      </Switch>
    </Router>
  );
}

export default AppNavigation;
