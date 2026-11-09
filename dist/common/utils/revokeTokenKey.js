"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRevokeTokenKeyFormat = exports.userBaseRevokeTokenKeyFormat = void 0;
const userBaseRevokeTokenKeyFormat = ({ userId, }) => {
    return `User::${userId.toString()}::revoke_token`;
};
exports.userBaseRevokeTokenKeyFormat = userBaseRevokeTokenKeyFormat;
const userRevokeTokenKeyFormat = ({ userId, jti, }) => {
    return `${(0, exports.userBaseRevokeTokenKeyFormat)({ userId })}::${jti}`;
};
exports.userRevokeTokenKeyFormat = userRevokeTokenKeyFormat;
