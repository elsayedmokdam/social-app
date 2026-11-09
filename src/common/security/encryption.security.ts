import crypto from "node:crypto";
import { ENC_KEY, IV_LENGTH } from "../../config.js";

export const encryption = async (plainText: string): Promise<string> => {
  // Generate a random initialization vector (different iv for each encryption)
  const iv = crypto.randomBytes(IV_LENGTH);
  // Use Algorithm (Advanced Encryption Standard [Symmetric Encryption Algorithm]) with size of 256 bits(32 bytes) to create cipher using iv and key
  const cipher = await crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv);
  // Convert plain text to hex
  let encryptedData = cipher.update(plainText, "utf8", "hex");
  encryptedData += cipher.final("hex");
  return `${iv.toString("hex")}::${encryptedData}`;
};

export const decryption = async (cipherText: string): Promise<string> => {
  // Destruc the iv and encrypted data
  const [iv, encryptedData] = cipherText?.split("::") as [string, string];
  // Convert iv to buffer
  const convertedIv = Buffer.from(iv, "hex");
  // Use the same algorithm that was used for encryption to decrypt
  const decipher = await crypto.createDecipheriv(
    "aes-256-cbc",
    ENC_KEY,
    convertedIv,
  );
  // Convert encrypted data to utf8
  let decryptedData = decipher.update(encryptedData, "hex", "utf8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
};
