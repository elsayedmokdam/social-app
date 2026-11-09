"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const common_1 = require("../../common");
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
const cache_otp_1 = require("../../common/utils/otp/cache.otp");
const security_1 = require("../../common/security");
const config_1 = require("../../config");
const otp_1 = require("../../common/utils/otp");
const email_1 = require("../../common/utils/email");
class AuthenticationService {
    userRepository;
    caheService;
    constructor() {
        this.userRepository = new repository_1.UserRepository();
        this.caheService = new service_1.CacheService();
    }
    signup = async ({ username, email, password, confirmPassword, phone, gender, }) => {
        const existsUser = (await this.userRepository.findOne({
            filter: { email },
            projection: { email: 1 },
            options: { lean: true },
        }));
        if (existsUser) {
            existsUser._id;
            throw new common_1.ConflictException("Email already exists.");
        }
        const user = await this.userRepository.create({
            data: {
                username,
                email,
                password: await (0, security_1.hash)(password),
                confirmPassword: await (0, security_1.hash)(confirmPassword),
                phone: await encryption(phone),
                gender,
            },
        });
        return user.toJSON();
    };
    sendEmailOTP = async ({ email, subject, expiresIn = config_1.OTP_EXPIRES_IN, maxTrials = config_1.OTP_MAX_TRIALS, blockTime = config_1.OTP_BLOCK_TIME, }) => {
        const existOTP_TTL = await this.caheService.ttl({
            key: (0, cache_otp_1.userCacheOTPKeyFormat)({ email, enumType: subject }),
        });
        if (existOTP_TTL > 0)
            throw new common_1.ConflictException("OTP Already Sent, Please check your email as we can't resend OTP after ${existOTP_TTL} seconds");
        const oldTrials = await this.caheService.get({
            key: (0, cache_otp_1.userCacheOTPTrialsKeyFormat)({ email, enumType: subject }),
        });
        if (oldTrials >= maxTrials) {
            throw new common_1.TooManyRequsetException(`Maximum number of trials reached, Please try again after ${blockTime / 60 > 1 ? blockTime / 60 : blockTime} ${blockTime / 60 > 1 ? "minutes" : "seconds"}`);
        }
        const data = {
            email,
            code: (0, otp_1.createOTP)(),
        };
        await this.caheService.set({
            key: (0, cache_otp_1.userCacheOTPKeyFormat)({
                email,
                enumType: subject,
            }),
            value: await (0, security_1.hash)(data.code.toString()),
            ttl: expiresIn,
        });
        const currentTrials = await this.caheService.incrBy({
            key: (0, cache_otp_1.userCacheOTPTrialsKeyFormat)({ email, enumType: subject }),
        });
        if (currentTrials >= maxTrials) {
            await this.caheService.expire({
                key: (0, cache_otp_1.userCacheOTPTrialsKeyFormat)({ email, enumType: subject }),
                ttl: blockTime,
            });
        }
        email_1.emailEvent.emit("sendEmail", {
            recipients: {
                to: email,
            },
            subject,
            data,
        });
    };
    resendConfirmEmailOTP = async ({ email, }) => {
        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: common_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user)
            throw new common_1.NotFoundException("Invalid Login Credentials");
        if (user.confirmEmail)
            throw new common_1.NotFoundException("Email Already Confirmed");
        await this.sendEmailOTP({
            email: user.email,
            subject: common_1.EmailSubjectEnum.CONFIRM_EMAIL,
        });
        return "OTP Sent Successfully";
    };
    confirmEmail = async ({ email, otp, }) => {
        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: common_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user)
            throw new common_1.NotFoundException("Invalid Login Credentials");
        if (user.confirmEmail)
            throw new common_1.NotFoundException("Email Already Confirmed");
        const cacheCode = await this.caheService.get({
            key: (0, cache_otp_1.userCacheOTPKeyFormat)({
                email: user.email,
                enumType: common_1.EmailSubjectEnum.CONFIRM_EMAIL,
            }),
        });
        if (!cacheCode || !(await (0, security_1.compare)(otp, cacheCode)))
            throw new common_1.NotFoundException("Invalid OTP, Ask for Resend");
        user.confirmEmail = Date.now();
        await user.save();
        await this.caheService.del({
            key: await this.caheService.keys({
                prefix: (0, cache_otp_1.userCacheOTPKeyFormat)({
                    email: user.email,
                    enumType: common_1.EmailSubjectEnum.CONFIRM_EMAIL,
                }),
            }),
        });
        return user;
    };
}
exports.AuthenticationService = AuthenticationService;
exports.default = new AuthenticationService();
