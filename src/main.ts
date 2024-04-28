import * as dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.development.env' : '.env',
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('aurora-front-api');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Aurora-front-api')
    .setDescription('Description aurora api')
    .setVersion('1.0')
    .addTag('aurora')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('aurora-front-api', app, document);

  app.enableCors({ origin: ['http://localhost:3000'] });

  await app.listen(3001);
}
bootstrap();
