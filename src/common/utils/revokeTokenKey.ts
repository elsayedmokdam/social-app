import { MongoDBId } from "../types";

export const userBaseRevokeTokenKeyFormat = ({
  userId,
}: {
  userId: MongoDBId;
}) => {
  return `User::${userId.toString()}::revoke_token`;
};

export const userRevokeTokenKeyFormat = ({
  userId,
  jti,
}: {
  userId: MongoDBId;
  jti: string;
}) => {
  return `${userBaseRevokeTokenKeyFormat({ userId })}::${jti}`;
};
