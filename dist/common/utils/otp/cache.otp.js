"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCacheOTPTrialsKeyFormat = exports.userCacheOTPKeyFormat = void 0;
const enum_1 = require("../../enum");
const userCacheOTPKeyFormat = ({ email, enumType = enum_1.EmailSubjectEnum.CONFIRM_EMAIL, }) => `User::${email}::${enumType}::OTP`;
exports.userCacheOTPKeyFormat = userCacheOTPKeyFormat;
const userCacheOTPTrialsKeyFormat = ({ email, enumType = enum_1.EmailSubjectEnum.CONFIRM_EMAIL, }) => `${(0, exports.userCacheOTPKeyFormat)({ email, enumType })}::Trials`;
exports.userCacheOTPTrialsKeyFormat = userCacheOTPTrialsKeyFormat;
