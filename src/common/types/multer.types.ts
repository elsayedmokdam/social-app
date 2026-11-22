export type IFile = Express.Multer.File & {
  key?: string;
};
