import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Habilitar CORS para el API Gateway
  app.enableCors({
    origin: process.env.API_GATEWAY_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`🚀 Microservicio de Incidentes corriendo en puerto ${port}`);
  logger.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();