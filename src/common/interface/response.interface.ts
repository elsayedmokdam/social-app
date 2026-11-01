export interface IResponse<T = any, Z = any> {
  data?: T;
  message?: string;
  extra?: Z;
  status?: number;
}
