import { HydratedDocument, UpdateWriteOpResult } from "mongoose";
import { ConflictException, IUser } from "../../common";
import { UserRepository } from "../../common/repository";
import {
  cloudService,
  CloudService,
  tokenService,
  TokenService,
} from "../../common/service";
import { IFile, JwtPayloadType } from "../../common/types";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config";
import { HUser } from "../../DB/models";
import { IRotateTokenResponse } from "./user.response";

export class UserService {
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;
  private readonly cloudService: CloudService;
  constructor() {
    this.tokenService = tokenService;
    this.userRepository = new UserRepository();
    this.cloudService = cloudService;
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

  // --------- Upload Profile Image ----------
  async uploadProfileImage({
    user,
    file,
  }: {
    user: HUser;
    file: IFile;
  }): Promise<HydratedDocument<IUser> | null> {
    return await this.userRepository.findByIdAndUpdate({
      id: user._id,
      update: { image: file.key },
      options: { projection: { password: 0, confirmPassword: 0 } },
    });
  }

  // --------- Upload Cover Images ----------
  async uploadCoverImages({
    user,
    files,
  }: {
    user: HUser;
    files: IFile[];
  }): Promise<HydratedDocument<IUser> | null> {
    return await this.userRepository.findByIdAndUpdate({
      id: user._id,
      update: { imageCover: files.map((file) => file.key) },
      options: { projection: { password: 0, confirmPassword: 0 } },
    });
  }
}

export default new UserService();
