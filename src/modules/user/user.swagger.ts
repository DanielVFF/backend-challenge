import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function ApiUserControllerDefaults() {
  return applyDecorators(
    ApiTags('User'),
    ApiBearerAuth(),
    ApiResponse({ status: 401, description: 'Credenciais inválidas' }),
  );
}

export function ApiGetUserResponse() {
  return applyDecorators();
}

export function ApiCreateUserResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Registrar usuario' }),
    ApiResponse({ status: 201, description: 'Usuário criado com sucesso' }),
    ApiResponse({ status: 422, description: 'Dados inválidos.' }),
  );
}

export function ApiListUsersResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar todos usuários' }),
    ApiResponse({ status: 200, description: 'Lista de Usuários' }),
  );
}

export function ApiUpdateUserResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Atualiza um usuário pelo ID' }),
    ApiResponse({
      status: 200,
      description: 'Usuário atualizado com sucesso.',
    }),
    ApiResponse({ status: 404, description: 'Usuário não encontrado' }),
    ApiResponse({ status: 422, description: 'Dados inválidos.' }),
  );
}

export function ApiDeleteUserResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Deleta um usuário pelo ID' }),
    ApiResponse({ status: 200, description: 'Usuário deletado com sucesso.' }),
  );
}
