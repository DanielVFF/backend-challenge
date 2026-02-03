import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGoogleLoginResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Redireciona para o login do Google' }),
    ApiResponse({
      status: 302,
      description: 'Redirecionado para o login do Google',
    }),
  );
}

export function ApiGoogleCallbackResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Callback do Google' }),
    ApiResponse({
      status: 302,
      description: 'Redirecionado para o frontend com tokens',
    }),
  );
}
