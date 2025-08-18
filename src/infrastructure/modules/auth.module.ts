import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '../adapters/inbound/http/controllers/auth.controller';
import { AuthApplicationService } from 'src/core/application/services/auth.service';
import { authEntitiesProviders } from '../providers/auth/auth.providers';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: { expiresIn: '10h' },
      }),
    }),
    DatabaseModule,
  ],
  providers: [...authEntitiesProviders],
  exports: [AuthApplicationService],
  controllers: [AuthController],
})
export class AuthModule {}
