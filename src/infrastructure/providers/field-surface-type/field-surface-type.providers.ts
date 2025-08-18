import { Provider } from '@nestjs/common';
import { Connection } from 'typeorm';

import { FieldSurfaceTypeEntity } from 'src/infrastructure/persistence/field-surface-type.entity';
import { FieldSurfaceTypeRepositoryAdapter } from 'src/infrastructure/adapters/outbound/repositories/field-surface-type-repository.adapter';
import { IFieldSurfaceTypeRepositoryPort } from 'src/core/domain/ports/outbound/field-surface-type-repository.port';
import { FieldSurfaceTypeApplicationService } from 'src/core/application/services/field-surface-type-application.service';
import { IFieldSurfaceTypeApplicationPort } from 'src/core/application/ports/inbound/field-surface-type-application.port';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';
import { DATA_SOURCE } from 'src/infrastructure/tokens/data_sources';

export const fieldSurfaceTypeProviders: Provider[] = [
  // Repositorio de TypeORM para FieldSurfaceTypeEntity
  {
    provide: FieldSurfaceTypeEntity,
    useFactory: (connection: Connection) =>
      connection.getRepository(FieldSurfaceTypeEntity),
    inject: [DATA_SOURCE.MYSQL],
  },

  // Adaptador de repositorio
  {
    provide: REPOSITORY_PORTS.FIELD_SURFACE,
    useClass: FieldSurfaceTypeRepositoryAdapter,
  },

  // Servicio de aplicación
  {
    provide: 'IFieldSurfaceTypeApplicationPort',
    useClass: FieldSurfaceTypeApplicationService,
  },
];
