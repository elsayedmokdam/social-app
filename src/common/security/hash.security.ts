import bcrypt from "bcrypt";

export const hash = async (
  plainText: string,
  rounds: number = 12,
  minor: "a" | "b" = "b",
): Promise<string> => {
  const salt = await bcrypt.genSalt(rounds, minor);
  return await bcrypt.hash(plainText, salt);
};

export const compare = async (
  plainText: string,
  cipherText: string,
): Promise<boolean> => bcrypt.compare(plainText, cipherText);
