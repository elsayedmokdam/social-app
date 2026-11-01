export class ApplicationException extends Error {
  constructor(
    override message: string,
    public status: number,
    override cause: {
      issues?: any;
    } = {},
  ) {
    // After Writting override Word in the Constructor, We Can Call super() Method to call the parent class constructor.
    // super();
    super(message, { cause });
    // To Detect Error Type on the Response
    this.name = this.constructor.name;
    // To Detect Error File Path on the Response
    Error.captureStackTrace(this, this.constructor);
  }
}
  