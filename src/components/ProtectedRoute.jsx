import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, triggerLoginModal, authChanged }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/userdetails/check-auth/", {
          credentials: "include" // send cookie
        });
        if (res.ok) {
          setShouldRender(true);
        } else {
          if (typeof triggerLoginModal === "function") {
            triggerLoginModal();
          }
          setShouldRender(false);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setShouldRender(false);
      }
    };

    checkAuth();
  }, [authChanged, triggerLoginModal]);

  return shouldRender ? children : null;
};

export default ProtectedRoute;
