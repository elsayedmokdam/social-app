"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryption = exports.encryption = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_js_1 = require("../../config.js");
const encryption = async (plainText) => {
    const iv = node_crypto_1.default.randomBytes(config_js_1.IV_LENGTH);
    const cipher = await node_crypto_1.default.createCipheriv("aes-256-cbc", config_js_1.ENC_KEY, iv);
    let encryptedData = cipher.update(plainText, "utf8", "hex");
    encryptedData += cipher.final("hex");
    return `${iv.toString("hex")}::${encryptedData}`;
};
exports.encryption = encryption;
const decryption = async (cipherText) => {
    const [iv, encryptedData] = cipherText?.split("::");
    const convertedIv = Buffer.from(iv, "hex");
    const decipher = await node_crypto_1.default.createDecipheriv("aes-256-cbc", config_js_1.ENC_KEY, convertedIv);
    let decryptedData = decipher.update(encryptedData, "hex", "utf8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
};
exports.decryption = decryption;
