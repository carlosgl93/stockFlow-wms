import { useNavigate } from "shared/Router";

export const useRedirect = () => {
  const navigate = useNavigate();

  return (to: string) => {
    navigate(to);
  };
};
