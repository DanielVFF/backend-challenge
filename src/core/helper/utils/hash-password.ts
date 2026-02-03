import * as bcrypt from 'bcryptjs';

/**
 * Gera um hash para a senha fornecida, usando o número especificado de salt rounds.
 */
export async function hashPassword(
  password: string,
  saltRounds = 10,
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}
