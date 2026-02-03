import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

export function ApiCacheControllerDefaults() {
  return applyDecorators(ApiTags('Cache'));
}

export function ApiGetCacheInfoResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Obter informações do cache' }),
  );
}

export function ApiSwitchToRedisResponse() {
  return applyDecorators(ApiOperation({ summary: 'Mudar para o cache Redis' }));
}

export function ApiSwitchToMachineResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Mudar para o cache em memória' }),
  );
}

export function ApiClearCacheResponse() {
  return applyDecorators(ApiOperation({ summary: 'Limpar o cache' }));
}
