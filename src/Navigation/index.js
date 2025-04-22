import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MovieHomePage from '../Components/MovieHomePage';
import Movie_Detail from '../Components/Movie_Detail';
import LoginScreen from '../Components/Login';
import PrivateRoute from './PrivateRoute';

function AppNavigation() {

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={MovieHomePage} />
        <PrivateRoute path="/detail" component={Movie_Detail}/>
        <Route path="/login" component={LoginScreen} />
        <Route path="*" component={MovieHomePage} />
      </Switch>
    </Router>
  );
}

export default AppNavigation;
