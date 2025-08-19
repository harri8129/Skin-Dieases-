import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, triggerLoginModal, authChanged }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (!isAuthenticated) {
      if (typeof triggerLoginModal === 'function') {
        triggerLoginModal();
      }
      setShouldRender(false);
    } else {
      setShouldRender(true);
    }
  }, [authChanged, triggerLoginModal]); // listen for authChanged updates

  return shouldRender ? children : null;
};

export default ProtectedRoute;
