import { useEffect, useState } from 'react';
import { getAccessToken, isTokenExpired, refreshAccessToken, clearTokens } from '../utils/api';

const ProtectedRoute = ({ children, triggerLoginModal, authChanged }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const accessToken = getAccessToken();
        
        // No token - user is not authenticated
        if (!accessToken) {
          if (typeof triggerLoginModal === "function") {
            triggerLoginModal();
          }
          setShouldRender(false);
          setIsLoading(false);
          return;
        }

        // Check if token is expired and try to refresh if needed
        if (isTokenExpired(accessToken)) {
          try {
            await refreshAccessToken();
            setShouldRender(true);
          } catch (error) {
            // Refresh failed - clear tokens and show login
            clearTokens();
            if (typeof triggerLoginModal === "function") {
              triggerLoginModal();
            }
            setShouldRender(false);
          }
        } else {
          // Token is valid
          setShouldRender(true);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        clearTokens();
        if (typeof triggerLoginModal === "function") {
          triggerLoginModal();
        }
        setShouldRender(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [authChanged, triggerLoginModal]);

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  return shouldRender ? children : null;
};

export default ProtectedRoute;
