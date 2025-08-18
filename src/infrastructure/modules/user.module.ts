import { Module } from '@nestjs/common';

import { UserController } from '../adapters/inbound/http/controllers/user/user.controller';
import { DatabaseModule } from './database/database.module';
import { userProviders } from '../providers/user/user.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [...userProviders],
})
export class UserModule {}
