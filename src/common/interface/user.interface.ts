import { GenderEnum, ProviderEnum, RoleEnum } from "../enum";

export interface IUser {
  firstName: string;
  lastName: string;
  username?: string;

  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;

  DOB?: Date;
  phone?: string;
  image?: string;
  imageCover?: string[];

  gender?: GenderEnum;
  role?: RoleEnum;
  provider?: ProviderEnum;
  createdAt?: Date;
  updatedAt?: Date;

  changeCredentialsTime: Date;
}
