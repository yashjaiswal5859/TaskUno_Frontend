import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AnimatedRoutes from './components/AnimatedRoutes';
import Footer from './components/Footer';
import Header from './components/Header';

const App = () => {
  useEffect(() => {
    // Listen for storage changes (cross-tab synchronization)
    // When auth data changes in another tab, reload to sync state
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_data' || e.key === 'access_token') {
        // Reload the page to sync state across tabs
        // This ensures Redux state matches localStorage
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Header />
      <AnimatedRoutes />
      <Footer />
    </Router>
  );
};

export default App;

