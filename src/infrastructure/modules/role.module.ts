import { Module } from '@nestjs/common';
import { RoleApplicationService } from 'src/core/application/services/role-application.service';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';
import { DatabaseModule } from './database/database.module';
import { RoleController } from '../adapters/inbound/http/controllers/role.controller';
import { RoleRepositoryAdapter } from '../adapters/outbound/repositories/role.repository.adapter';
import { MYSQL_REPOSITORY } from '../tokens/repositories';
import { DataSource } from 'typeorm';
import { RoleEntity } from '../persistence/role.entity';
import { DATA_SOURCE } from '../tokens/data_sources';

@Module({
  imports: [DatabaseModule],
  controllers: [RoleController],
  providers: [
    {
      provide: REPOSITORY_PORTS.ROLE,
      useClass: RoleRepositoryAdapter,
    },
    {
      provide: APPLICATION_PORTS.ROLE,
      useClass: RoleApplicationService,
    },
    {
      provide: MYSQL_REPOSITORY.ROLE,
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(RoleEntity),
      inject: [DATA_SOURCE.MYSQL],
    },
  ],
})
export class RoleModule {}
