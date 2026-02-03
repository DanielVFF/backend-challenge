import * as bcrypt from 'bcryptjs';

/**
 * Compara uma senha em texto simples com um hash para verificar se coincidem.
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
