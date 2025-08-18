import { DataSource } from 'typeorm';

import { NeighborhoodEntity } from 'src/infrastructure/persistence/neighborhood.entity';
import { PermissionEntity } from 'src/infrastructure/persistence/permission.entity';
import { MenuItemEntity } from 'src/infrastructure/persistence/menu-item.entity';
import { ModuleEntity } from 'src/infrastructure/persistence/module.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { UserEntity } from 'src/infrastructure/persistence/user.entity';
import { RoleEntity } from 'src/infrastructure/persistence/role.entity';
import { DATA_SOURCE } from 'src/infrastructure/tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.USER,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.ROLE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RoleEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.PERMISSION,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PermissionEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.MODULE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ModuleEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.MENU_ITEM,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(MenuItemEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.NEIGHBORHOOD,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(NeighborhoodEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
