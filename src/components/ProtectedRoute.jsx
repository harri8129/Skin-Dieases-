import React, { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, triggerLoginModal }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const [shouldRender, setShouldRender] = useState(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      if (typeof triggerLoginModal === 'function') {
        triggerLoginModal();
      }
      setShouldRender(false);
    } else {
      setShouldRender(true);
    }
  }, [isAuthenticated, triggerLoginModal]);

  return shouldRender ? children : null;
};

export default ProtectedRoute;
