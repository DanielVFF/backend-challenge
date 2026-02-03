import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiLoginResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Login com seu usuário' }),
    ApiResponse({
      status: 200,
      description: 'Login realizado com sucesso ou código enviado',
    }),
    ApiResponse({ status: 401, description: 'Credenciais inválidas' }),
  );
}

export function ApiVerifyResponse() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verifica o código de confirmação usando hash e retorna tokens',
    }),
    ApiResponse({
      status: 200,
      description: 'Código verificado com sucesso, tokens retornados',
    }),
    ApiResponse({
      status: 400,
      description: 'Hash ou código expirado ou inválido',
    }),
    ApiResponse({
      status: 401,
      description: 'Código inválido ou usuário não encontrado',
    }),
  );
}

export function ApiRefreshTokenResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Atualiza o token de acesso' }),
    ApiResponse({ status: 200, description: 'Token de acesso atualizado' }),
    ApiResponse({ status: 401, description: 'Token de refresh inválido' }),
  );
}

export function ApiForgotPasswordResponse() {
  return applyDecorators(
    ApiOperation({
      summary: 'Solicita redefinição de senha enviando código por email',
    }),
    ApiResponse({
      status: 200,
      description:
        'Código de confirmação enviado para o email (se o email estiver cadastrado)',
    }),
  );
}

export function ApiResetPasswordResponse() {
  return applyDecorators(
    ApiOperation({
      summary: 'Redefine a senha usando o código de verificação',
    }),
    ApiResponse({
      status: 200,
      description: 'Senha redefinida com sucesso',
    }),
    ApiResponse({
      status: 400,
      description: 'Hash ou código expirado ou inválido',
    }),
    ApiResponse({
      status: 401,
      description: 'Código inválido',
    }),
    ApiResponse({
      status: 404,
      description: 'Usuário não encontrado',
    }),
  );
}
