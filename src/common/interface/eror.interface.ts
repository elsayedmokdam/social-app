export interface IError extends Error {
  status: number;
  cause?: {
    issues?: any;
  };
}
