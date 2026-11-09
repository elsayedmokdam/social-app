"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOTP = void 0;
const createOTP = () => Math.floor(100000 + Math.random() * 900000);
exports.createOTP = createOTP;
