import { SignUpDTO } from "./authentication.dto";

export class AuthenticationService {
  constructor() {}

  signup = async (data: SignUpDTO["body"]) => {
    console.log({ data });

    // throw new BadRequestException("Error", { issues: ["Invalid data", "Ay7aga"] });
    return "Test";
  };
}

// Apply Singleton Design Pattern.
export default new AuthenticationService();
