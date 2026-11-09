import { ConflictException } from "../../common";
import { TokenService } from "../../common/service";
import { JwtPayloadType } from "../../common/types";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config";
import { HUser } from "../../DB/models";
import { IRotateTokenResponse } from "./user.response";

export class UserService {
  private tokenService: TokenService;
  constructor() {
    this.tokenService = new TokenService();
  }

  // -------------- Rotate Token -------------

  async rotateToken(
    payload: JwtPayloadType,
    user: HUser,
    issuer: string,
  ): Promise<IRotateTokenResponse> {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000; // Expires in in milliseconds
    const remainingTime = accessExpiresIn - Date.now(); // Remaining time in milliseconds

    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

    // Meaning the access token is still valid
    if (remainingTime > tenMinutes) {
      throw new ConflictException("Access token is still valid");
    }

    const { access_token, refresh_token } =
      await this.tokenService.createLoginCredentials({
        payload: user as unknown as Pick<JwtPayloadType, "sub" | "role">,
        options: {
          issuer,
        },
      });

    await this.tokenService.createRevokeToken({ payload });
    return {
      access_token,
      refresh_token,
      user,
    };
  }
}

export default new UserService();