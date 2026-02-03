import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentConfigService } from './environment-config.service';
import { ConfigService } from '@nestjs/config';

describe('EnvironmentConfigService', () => {
  let service: EnvironmentConfigService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          DATABASE_HOST: 'localhost',
          DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
          REDIS_HOST: 'redis',
          REDIS_PORT: '6379',
          REDIS_PASSWORD: 'redis-password',
          PORT: '3000',
          NESTJS_PORT: '3000',
          SECRET_KEY: 'my-secret-key',
          RABBITMQ_URL: 'amqp://localhost',
          RABBITMQ_QUEUE: 'my-queue',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvironmentConfigService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EnvironmentConfigService>(EnvironmentConfigService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('Database configuration', () => {
    describe('getDatabaseHost', () => {
      it('deve retornar o host do banco de dados', () => {
        const result = service.getDatabaseHost();
        expect(result).toBe('localhost');
      });
    });

    describe('getDatabaseUrl', () => {
      it('deve retornar a URL do banco de dados', () => {
        const result = service.getDatabaseUrl();
        expect(result).toBe('postgresql://user:password@localhost:5432/db');
      });
    });
  });

  describe('Redis configuration', () => {
    describe('getRedisHost', () => {
      it('deve retornar o host do Redis', () => {
        const result = service.getRedisHost();
        expect(result).toBe('redis');
      });
    });

    describe('getRedisPort', () => {
      it('deve retornar a porta do Redis', () => {
        const result = service.getRedisPort();
        expect(result).toBe(6379);
      });
    });

    describe('getRedisPassword', () => {
      it('deve retornar a senha do Redis', () => {
        const result = service.getRedisPassword();
        expect(result).toBe('redis-password');
      });
    });
  });

  describe('Application configuration', () => {
    describe('getPort', () => {
      it('deve retornar a porta da aplicação', () => {
        const result = service.getPort();
        expect(result).toBe(3000);
      });
    });
  });

  describe('Security configuration', () => {
    describe('getSecretKey', () => {
      it('deve retornar a chave secreta', () => {
        const result = service.getSecretKey();
        expect(result).toBe('my-secret-key');
      });
    });
  });

  describe('RabbitMQ configuration', () => {
    describe('getRabbitMqUrl', () => {
      it('deve retornar a URL do RabbitMQ', () => {
        const result = service.getRabbitMqUrl();
        expect(result).toBe('amqp://localhost');
      });
    });

    describe('getRabbitMqQueue', () => {
      it('deve retornar a fila do RabbitMQ', () => {
        const result = service.getRabbitMqQueue();
        expect(result).toBe('my-queue');
      });
    });
  });

  describe('Elasticsearch configuration', () => {
    describe('getElasticsearchUrl', () => {
      it('deve retornar a URL do Elasticsearch', () => {
        const result = service.getElasticsearchUrl();
        expect(result).toBe('http://localhost:9200');
      });
    });
  });
});
