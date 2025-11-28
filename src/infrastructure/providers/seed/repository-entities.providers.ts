import { DataSource } from 'typeorm';

import { FieldSurfaceTypeEntity } from '../../persistence/field-surface-type.entity';
import { SubScenarioPriceEntity } from '../../persistence/sub-scenario-price.entity';
import { ReservationStateEntity } from '../../persistence/reservation-state.entity';
import { ActivityAreaEntity } from '../../persistence/activity-area.entity';
import { NeighborhoodEntity } from '../../persistence/neighborhood.entity';
import { SubScenarioEntity } from '../../persistence/sub-scenario.entity';
import { TimeSlotEntity } from '../../persistence/time-slot.entity';
import { ScenarioEntity } from '../../persistence/scenario.entity';
import { CommuneEntity } from '../../persistence/commune.entity';
import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { CityEntity } from '../../persistence/city.entity';
import { RoleEntity } from '../../persistence/role.entity';
import { UserEntity } from '../../persistence/user.entity';
import { DATA_SOURCE } from '../../tokens/data_sources';
import { SubScenarioImageEntity } from '../../persistence/image.entity';
import { HomeSlideEntity as PersistenceHomeSlideEntity } from '../../persistence/home-slide.entity';
import { EntityEntity } from '../../persistence/entity.entity';
import { ModuleEntity } from '../../persistence/module.entity';
import { MenuItemEntity } from '../../persistence/menu-item.entity';

export const repositoryEntitiesProviders = [
  {
    provide: MYSQL_REPOSITORY.CITY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CityEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.ROLE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RoleEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.COMMUNE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CommuneEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.NEIGHBORHOOD,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(NeighborhoodEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.USER,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.FIELD_SURFACE_TYPE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(FieldSurfaceTypeEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.ACTIVITY_AREA,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ActivityAreaEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.SCENARIO,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ScenarioEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.SUB_SCENARIO,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SubScenarioEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.SUB_SCENARIO_PRICE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SubScenarioPriceEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.SUB_SCENARIO_IMAGE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SubScenarioImageEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.TIME_SLOT,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(TimeSlotEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.RESERVATION_STATE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ReservationStateEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.HOME_SLIDE,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PersistenceHomeSlideEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
  {
    provide: MYSQL_REPOSITORY.ENTITY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EntityEntity),
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
];
