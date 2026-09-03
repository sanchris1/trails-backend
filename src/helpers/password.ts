import bcrypt from "bcrypt";

export async function encodePassword(
  newPassword: string,
  salt = 12,
): Promise<string> {
  return bcrypt.hash(newPassword, salt);
}

export async function comparePassword(
  inputPassword: string,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(inputPassword, password);
}
