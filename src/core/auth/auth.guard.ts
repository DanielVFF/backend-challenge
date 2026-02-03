import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';

/**
 * Guarda de autenticação JWT para proteger rotas e verificar a validade do token JWT.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  /**
   * Injeta as dependências JwtService e EnvironmentConfigService.
   *
   * @param {JwtService} jwtService - Serviço para manipulação de tokens JWT.
   * @param {EnvironmentConfigService} configService - Serviço para acessar as variáveis de ambiente, incluindo a chave secreta JWT.
   */
  constructor(
    private jwtService: JwtService,
    private configService: EnvironmentConfigService,
  ) {}

  /**
   * Valida a presença e a integridade do token JWT em uma requisição.
   *
   * @param {ExecutionContext} context - O contexto de execução, que permite acesso aos objetos de requisição e resposta.
   * @returns {boolean | Promise<boolean> | Observable<boolean>} Retorna `true` se o token for válido; caso contrário, lança uma exceção.
   * @throws {UnauthorizedException} Lança uma exceção se o token estiver ausente, for inválido ou se houver erro na verificação.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('errors.unauthorized');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('errors.unauthorized');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.getSecretKey(),
      });
      request.user = decoded;

      return true;
    } catch (_e) {
      throw new UnauthorizedException('errors.unauthorized');
    }
  }
}
