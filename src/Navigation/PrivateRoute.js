import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useUserContext } from '../Context/userContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn } = useUserContext();

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLoggedIn ? (
          <Component />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
