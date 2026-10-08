import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

/** Protects account and checkout routes; remembers where to return after OTP login. */
export const RequireAuth = () => {
  const token = useAuthStore((s) => s.token);
  const setReturnTo = useAuthStore((s) => s.setReturnTo);
  const location = useLocation();
  useEffect(() => {
    if (!token) setReturnTo(location.pathname + location.search);
  }, [token, location.pathname, location.search, setReturnTo]);
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
};
