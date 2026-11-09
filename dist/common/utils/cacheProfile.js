"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCacheProfileKeyFormat = void 0;
const userCacheProfileKeyFormat = ({ userId, }) => {
    return `User::${userId.toString()}::profile`;
};
exports.userCacheProfileKeyFormat = userCacheProfileKeyFormat;
