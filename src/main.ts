import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import 'reflect-metadata';

import { AppModule } from './infrastructure/modules/config/app.module';
import { ResponseInterceptor } from './infrastructure/common/incerceptors/response.intecerptor';
import { HttpExceptionFilter } from './infrastructure/common/filters/http-exception.filter';

function loadEnv() {
  dotenv.config();
}
async function createApp() {
  loadEnv();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar límites de tamaño de payload globalmente
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Configurar archivos estáticos para servir imágenes
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads/', // Los archivos serán accesibles en /uploads/images/*
  // });

  // Configurar archivos estáticos para servir imágenes temporales
  app.useStaticAssets(join(__dirname, '..', 'temp'), {
    prefix: '/temp/', // Los archivos serán accesibles en /temp/images/*
  });

  // Registro de interceptores globales
  app.useGlobalInterceptors(new ResponseInterceptor());
  // Registro de filters globales
  app.useGlobalFilters(new HttpExceptionFilter());
  // Registro de pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transforma los payloads según los DTOs
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si se envían propiedades adicionales
      forbidUnknownValues: true, // Opcional, para asegurarse de que sólo se validen los valores conocidos
    }),
  );
  // Configuración de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // Registro de swagger - solo en desarrollo o si se especifica explícitamente
  const nodeEnv = process.env.NODE_ENV || 'development';
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true' || nodeEnv === 'development';

  if (enableSwagger) {
    const swaggerConfigDocument = new DocumentBuilder()
      .setTitle('inderbu API')
      .setDescription('API para inderbu')
      .setVersion('1.0.0')
      .addTag('inderbu')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'jwt-auth', // nombre arbitrario de la seguridad
      )
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfigDocument);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  return app;
}

async function bootstrap() {
  const app = await createApp();
  await app.listen(process.env.PORT ?? 3001);
}

// For Vercel serverless deployment
export default async function handler(req: any, res: any) {
  const app = await createApp();
  await app.init();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}

// For traditional deployment
if (require.main === module) {
  void bootstrap();
}
