import { EmailSubjectEnum } from "../../enum";

export const userCacheOTPKeyFormat = ({
  email,
  enumType = EmailSubjectEnum.CONFIRM_EMAIL,
}: {
  email: string;
  enumType: EmailSubjectEnum;
}) => `User::${email}::${enumType}::OTP`;

export const userCacheOTPTrialsKeyFormat = ({
  email,
  enumType = EmailSubjectEnum.CONFIRM_EMAIL,
}: {
  email: string;
  enumType: EmailSubjectEnum;
}) => `${userCacheOTPKeyFormat({ email, enumType })}::Trials`;
