import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../types';
import { isAuthenticated } from '../utils/storage';

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check both Redux state and localStorage
    const hasToken = isAuthenticated();
    const hasUser = !!user;
    
    setLoggedIn(hasToken || hasUser);
    setCheckingStatus(false);
  }, [user]);

  return { loggedIn, checkingStatus };
};

