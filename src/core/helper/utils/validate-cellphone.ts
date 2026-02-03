/**
 * Valida se uma string é um número de celular válido (formato internacional).
 * Suporta formatos E.164 e variações comuns.
 */
export function validateCellphone(cellphone: string): boolean {
  if (!cellphone) return false;

  // Remove espaços e caracteres de formatação comuns, mas preserva + e dígitos
  let cleaned = cellphone.trim();

  // Remove caracteres não numéricos, exceto + no início
  if (cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.substring(1).replace(/[^\d]/g, '');
  } else {
    cleaned = cleaned.replace(/[^\d]/g, '');
  }

  // Remove o + para validação de comprimento
  const digitsOnly = cleaned.replace(/[^\d]/g, '');

  // E.164 permite até 15 dígitos (incluindo código do país)
  // Mínimo razoável: 7 dígitos (número local mínimo)
  if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;

  // Verifica se não é uma sequência de números iguais
  if (/^(\d)\1{6,}$/.test(digitsOnly)) return false;

  // Verifica se começa com 0 (não é válido em formato internacional)
  // Exceto se for um número local sem código do país
  if (cleaned.startsWith('+') && digitsOnly.startsWith('0')) return false;

  return true;
}
