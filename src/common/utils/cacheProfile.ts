import { MongoDBId } from "../types";

export const userCacheProfileKeyFormat = ({
  userId,
}: {
  userId: MongoDBId;
}): string => {
  return `User::${userId.toString()}::profile`;
};
