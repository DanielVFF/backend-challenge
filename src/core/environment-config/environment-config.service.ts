import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfigInterface } from './interfaces/environment-config.interface';

@Injectable()
export class EnvironmentConfigService implements EnvironmentConfigInterface {
  private readonly logger = new Logger(EnvironmentConfigService.name);
  constructor(private configService: ConfigService) {}

  getNodeEnv(): string {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (!nodeEnv) {
      this.logger.warn(
        'NODE_ENV não está definido no .env, usando o padrão "development"',
      );
      return 'development';
    }
    return nodeEnv;
  }

  getDatabaseHost(): string {
    const dbHost = this.configService.get<string>('DATABASE_HOST');
    if (!dbHost) {
      this.logger.warn(
        'DATABASE_HOST não está definido no .env, usando o padrão "localhost"',
      );
      return 'localhost';
    }
    return dbHost;
  }

  getDatabaseUrl(): string {
    const dbUrl = this.configService.get<string>('DATABASE_URL');
    if (!dbUrl) {
      this.logger.warn(
        'DATABASE_URL não está definido no .env, usando o padrão "postgresql://user:password@localhost:5432/db"',
      );
      return 'postgresql://user:password@localhost:5432/db';
    }
    return dbUrl;
  }

  getRedisHost(): string {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    if (!redisHost) {
      this.logger.warn(
        'REDIS_HOST não está definido no .env, usando o padrão "localhost"',
      );
      return 'localhost';
    }
    return redisHost;
  }

  getRedisPort(): number {
    const redisPort = this.configService.get<string>('REDIS_PORT');
    if (!redisPort) {
      this.logger.warn(
        'REDIS_PORT não está definido no .env, usando o padrão "6379"',
      );
      return 6379;
    }
    return parseInt(redisPort);
  }

  getRedisPassword(): string | undefined {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  getPort(): number {
    const port = this.configService.get<string>('PORT');
    if (!port) {
      this.logger.warn(
        'PORT não está definido no .env, usando o padrão "3000"',
      );
      return 3000;
    }
    return parseInt(port);
  }

  getSecretKey(): string {
    const secretKey = this.configService.get<string>('SECRET_KEY');
    if (!secretKey) {
      this.logger.warn(
        'SECRET_KEY não está definido no .env, usando o padrão "my-secret-key"',
      );
      return 'my-secret-key';
    }
    return secretKey;
  }

  getRabbitMqUrl(): string {
    const rabbitMqUrl = this.configService.get<string>('RABBITMQ_URL');
    if (!rabbitMqUrl) {
      this.logger.warn(
        'RABBITMQ_URL não está definido no .env, usando o padrão "amqp://localhost"',
      );
      return 'amqp://localhost';
    }
    return rabbitMqUrl;
  }

  getRabbitMqQueue(): string {
    const rabbitMqQueue = this.configService.get<string>('RABBITMQ_QUEUE');
    if (!rabbitMqQueue) {
      this.logger.warn(
        'RABBITMQ_QUEUE não está definido no .env, usando o padrão "my-queue"',
      );
      return 'my-queue';
    }
    return rabbitMqQueue;
  }

  isRedisEnabled(): boolean {
    const redisEnabled = this.configService.get<string>('REDIS_ENABLED');
    return redisEnabled === 'true' || redisEnabled === '1';
  }

  getRedisConnectionTimeout(): number {
    const timeout = this.configService.get<string>('REDIS_CONNECTION_TIMEOUT');
    if (!timeout) {
      this.logger.warn(
        'REDIS_CONNECTION_TIMEOUT não está definido no .env, usando o padrão "5000"',
      );
      return 5000;
    }
    return parseInt(timeout);
  }

  getCorsOrigins(): string | string[] | boolean {
    const corsOrigins = this.configService.get<string>('CORS_ORIGINS');

    if (!corsOrigins) {
      this.logger.warn(
        'CORS_ORIGINS não está definido no .env, permitindo todas as origens',
      );
      return true;
    }

    if (!corsOrigins.includes(',')) {
      return corsOrigins.trim();
    }

    return corsOrigins.split(',').map((origin) => origin.trim());
  }

  getSupabaseUrl(): string {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL não está definido no .env');
    }
    return supabaseUrl;
  }

  getSupabaseAnonKey(): string {
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    if (!supabaseAnonKey) {
      throw new Error('SUPABASE_ANON_KEY não está definido no .env');
    }
    return supabaseAnonKey;
  }

  getSupabaseServiceRoleKey(): string {
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY não está definido no .env');
    }
    return supabaseServiceRoleKey;
  }

  getSupabaseBucketName(): string {
    const supabaseBucketName = this.configService.get<string>(
      'SUPABASE_BUCKET_NAME',
    );
    if (!supabaseBucketName) {
      this.logger.warn(
        'SUPABASE_BUCKET_NAME não está definido no .env, usando o padrão "uploads"',
      );
      return 'uploads';
    }
    return supabaseBucketName;
  }

  getGoogleClientId(): string {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!googleClientId) {
      throw new Error('GOOGLE_CLIENT_ID não está definido no .env');
    }
    return googleClientId;
  }

  getGoogleClientSecret(): string {
    const googleClientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );
    if (!googleClientSecret) {
      throw new Error('GOOGLE_CLIENT_SECRET não está definido no .env');
    }
    return googleClientSecret;
  }

  getGoogleRedirectUri(): string {
    const googleRedirectUri = this.configService.get<string>(
      'GOOGLE_REDIRECT_URI',
    );
    if (!googleRedirectUri) {
      throw new Error('GOOGLE_REDIRECT_URI não está definido no .env');
    }
    return googleRedirectUri;
  }

  getEmailHost(): string {
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    if (!emailHost) {
      this.logger.warn(
        'EMAIL_HOST não está definido no .env, usando o padrão "smtp.gmail.com"',
      );
      return 'smtp.gmail.com';
    }
    return emailHost;
  }

  getEmailPort(): number {
    const emailPort = this.configService.get<string>('EMAIL_PORT');
    if (!emailPort) {
      this.logger.warn(
        'EMAIL_PORT não está definido no .env, usando o padrão "587"',
      );
      return 587;
    }
    return parseInt(emailPort);
  }

  getEmailUser(): string {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    if (!emailUser) {
      this.logger.warn(
        'EMAIL_USER não está definido no .env, usando o padrão "noreply@cinema.com"',
      );
      return 'noreply@cinema.com';
    }
    return emailUser;
  }

  getEmailPassword(): string {
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    if (!emailPassword) {
      this.logger.warn(
        'EMAIL_PASSWORD não está definido no .env, usando o padrão "password"',
      );
      return 'password';
    }
    return emailPassword;
  }

  getEmailFrom(): string {
    const emailFrom = this.configService.get<string>('EMAIL_FROM');
    if (!emailFrom) {
      const emailUser = this.getEmailUser();
      this.logger.warn(
        `EMAIL_FROM não está definido no .env, usando "${emailUser}"`,
      );
      return emailUser;
    }
    return emailFrom;
  }

  getEmailFromName(): string {
    const emailFromName = this.configService.get<string>('EMAIL_FROM_NAME');
    if (!emailFromName) {
      this.logger.warn(
        'EMAIL_FROM_NAME não está definido no .env, usando o padrão "Cinema API"',
      );
      return 'Cinema API';
    }
    return emailFromName;
  }

  getElasticsearchUrl(): string {
    const elasticsearchUrl =
      this.configService.get<string>('ELASTICSEARCH_URL');
    if (!elasticsearchUrl) {
      throw new Error('ELASTICSEARCH_URL não está definido no .env');
    }
    return elasticsearchUrl;
  }

  getFrontendUrl(): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      this.logger.warn(
        'FRONTEND_URL não está definido no .env, usando o padrão "http://localhost:9000"',
      );
      return 'http://localhost:9000';
    }
    return frontendUrl;
  }
}
