import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import MovieHomePage from "../Components/MovieHomePage";
import Movie_Detail from "../Components/Movie_Detail";
import LoginScreen from "../Components/Login";
import TestComp from "../Components/TestComp";
import Error404 from "../Components/Error404";
import PrivateRoute from "./PrivateRoute";
import VideoPlayer from "../Components/VideoPlayer";

const AppNavigation = () => {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={LoginScreen} />
        <Route path="/test" component={TestComp} />

        {/* Dynamic route for details page */}
        <PrivateRoute path="/detail/:categoryId/:mediaId" component={Movie_Detail} />

        <Route path="/play" component={VideoPlayer} />

        {/* Default landing route */}
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>

        {/* Main content categories handled by MovieHomePage */}
        <Route exact path="/:category" component={MovieHomePage} />

        {/* Catch-all route for 404 */}
        <Route component={Error404} />
      </Switch>
    </Router>
  );
};

export default AppNavigation;
