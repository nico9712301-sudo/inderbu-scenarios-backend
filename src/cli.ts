import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/modules/config/app.module';
import { CommandModule, CommandService } from 'nestjs-command';
import { INestApplicationContext } from '@nestjs/common';

async function bootstrap() {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

  try {
    await app.select(CommandModule).get(CommandService).exec();
  } catch (error) {
    console.error('Error ejecutando comando:', error);
    await app.close();
    process.exit(1);
  } finally {
    await app.close();

    setTimeout(() => process.exit(0), 500);
  }
}

bootstrap();
