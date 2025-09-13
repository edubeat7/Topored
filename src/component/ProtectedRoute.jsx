import React from 'react';
import { Redirect, Route } from 'react-router-dom';

function ProtectedRoute({ children, ...rest }) {
  const userString = localStorage.getItem('user');
  let isLoggedIn = false;

  if (userString) {
    try {
      isLoggedIn = JSON.parse(userString).isLoggedIn;
    } catch (e) {
      isLoggedIn = false;
    }
  }

  return (
    <Route
      {...rest}
      render={() => {
        return isLoggedIn ? (
          children
        ) : (
          <Redirect to="/login" />
        );
      }}
    />
  );
}

export default ProtectedRoute;