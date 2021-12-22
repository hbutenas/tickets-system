import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Welcome from './Welcome';

const useAuth = () => {
  const user = {
    loggedIn: false,
  };
  return user && user.loggedIn;
};

const PrivateRoute = () => {
  const isAuth = useAuth();
  return isAuth ? <Outlet /> : <Welcome />;
};

export default PrivateRoute;
