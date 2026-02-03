import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { CustomLogger } from './core/logger/custom.logger';
import { EnvironmentConfigService } from './core/environment-config/environment-config.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { NestExpressApplication } from '@nestjs/platform-express';
import { QueueController } from './core/queue/queue.controller';
import path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new CustomLogger(),
  });
  const configService = app.get(EnvironmentConfigService);
  app.useLogger(new CustomLogger());

  app.enableCors({
    origin: configService.getCorsOrigins(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Accept-Language',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const config = new DocumentBuilder()
    .setTitle('API Cinema')
    .setDescription('API Cinema')
    .addBearerAuth()
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();
  SwaggerModule.setup('/', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
    },
    jsonDocumentUrl: '/api-json',
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DRACULA),
  });

  try {
    const queueController = app.get(QueueController);
    if (queueController && queueController.getRouter) {
      app.use('/admin/queues', queueController.getRouter());
      logger.debug(
        `Bull Board available at: http://localhost:${port}/admin/queues`,
      );
    }
  } catch (error) {
    logger.warn('Bull Board not available:', error.message);
  }

  await app.listen(port);

  console.log(path.join(process.cwd(), 'src', '/i18n/'))
  logger.verbose('===========================================');
  logger.verbose('        Cinema API Server Started       ');
  logger.verbose('===========================================');
  logger.verbose(`Server is running and listening on port: ${port}`);
  logger.debug(`Swagger UI available at: http://localhost:${port}/`);
  logger.debug('Press Ctrl+C to stop the server.');
}
bootstrap();
