import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/storage';
import Loader from './Loader';
import { useEffect, useState } from 'react';

const PrivateRoute = () => {
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status
    const authenticated = isAuthenticated();
    setLoggedIn(authenticated);
    setCheckingStatus(false);
  }, []);

  if (checkingStatus) {
    return <Loader />;
  }

  return loggedIn ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateRoute;

