import { useNavigate } from "shared/Router";

export const useRedirect = <T>() => {
  const navigate = useNavigate();

  return (to: string, stateParams?: T) => {
    navigate(to, {
      state: stateParams,
    });
  };
};
