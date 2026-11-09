export const maxLoginAttempsKeyFormat = ({
  email,
}: {
  email: string;
}): string => `User::${email}::MaxLoginAttemps`;
