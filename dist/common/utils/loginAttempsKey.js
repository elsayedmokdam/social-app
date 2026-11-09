"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxLoginAttempsKeyFormat = void 0;
const maxLoginAttempsKeyFormat = ({ email, }) => `User::${email}::MaxLoginAttemps`;
exports.maxLoginAttempsKeyFormat = maxLoginAttempsKeyFormat;
