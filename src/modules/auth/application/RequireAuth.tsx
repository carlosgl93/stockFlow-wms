import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "shared/Router";
import { useAuthStore } from "./authStore";

export interface IRequireAuthProps {
  children: ReactNode;
  to?: string;
}

const RequireAuth = ({ children, to }: IRequireAuthProps) => {
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);
  const setRedirectPath = useAuthStore((store) => store.setRedirectPath);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setRedirectPath(location.pathname);
    }
  }, [isAuthenticated, location.pathname, setRedirectPath]);

  return isAuthenticated ? <>{children}</> : <Navigate to={to ?? "/sign-in"} />;
};

export { RequireAuth };
