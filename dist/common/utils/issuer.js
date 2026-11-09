"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issuer = void 0;
const issuer = (req) => `${req.protocol}://${req.host}`;
exports.issuer = issuer;
