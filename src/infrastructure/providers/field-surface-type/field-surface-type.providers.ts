import { Provider } from '@nestjs/common';
import { Connection } from 'typeorm';

import { FieldSurfaceTypeEntity } from '../../persistence/field-surface-type.entity';
import { FieldSurfaceTypeRepositoryAdapter } from '../../adapters/outbound/repositories/field-surface-type-repository.adapter';
import { FieldSurfaceTypeApplicationService } from '../../../core/application/services/field-surface-type-application.service';
import { REPOSITORY_PORTS } from '../../tokens/ports';
import { DATA_SOURCE } from '../../tokens/data_sources';

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
