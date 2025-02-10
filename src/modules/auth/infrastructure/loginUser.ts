import { httpService } from "utils";

export interface ICredentials {
  email: string;
  password: string;
}

export const loginUser = (body: ICredentials) => {
  return httpService.post<string>("auth/login", body);
};
