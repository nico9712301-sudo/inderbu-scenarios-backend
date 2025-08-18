import { FieldSurfaceTypeEntity } from 'src/infrastructure/persistence/field-surface-type.entity';
import { SubScenarioPriceEntity } from 'src/infrastructure/persistence/sub-scenario-price.entity';
import { ReservationStateEntity } from 'src/infrastructure/persistence/reservation-state.entity';
import { ActivityAreaEntity } from 'src/infrastructure/persistence/activity-area.entity';
import { NeighborhoodEntity } from 'src/infrastructure/persistence/neighborhood.entity';
import { SubScenarioEntity } from 'src/infrastructure/persistence/sub-scenario.entity';
import { ReservationEntity } from 'src/infrastructure/persistence/reservation.entity';
import { ReservationTimeslotEntity } from 'src/infrastructure/persistence/reservation-timeslot.entity';
import { ReservationInstanceEntity } from 'src/infrastructure/persistence/reservation-instance.entity';
import { PermissionEntity } from 'src/infrastructure/persistence/permission.entity';
import { MenuItemEntity } from 'src/infrastructure/persistence/menu-item.entity';
import { TimeSlotEntity } from 'src/infrastructure/persistence/time-slot.entity';
import { ScenarioEntity } from 'src/infrastructure/persistence/scenario.entity';
import { CommuneEntity } from 'src/infrastructure/persistence/commune.entity';
import { ModuleEntity } from 'src/infrastructure/persistence/module.entity';
import { CityEntity } from 'src/infrastructure/persistence/city.entity';
import { RoleEntity } from 'src/infrastructure/persistence/role.entity';
import { UserEntity } from 'src/infrastructure/persistence/user.entity';
import { SubScenarioImageEntity } from 'src/infrastructure/persistence/image.entity';
import { HomeSlideEntity as PersistenceHomeSlideEntity } from 'src/infrastructure/persistence/home-slide.entity';
import { EntityEntity } from 'src/infrastructure/persistence/entity.entity';

export const persistenceEntities = [
  UserEntity,
  RoleEntity,
  PermissionEntity,
  ModuleEntity,
  MenuItemEntity,
  NeighborhoodEntity,
  CommuneEntity,
  CityEntity,
  ActivityAreaEntity,
  FieldSurfaceTypeEntity,
  ScenarioEntity,
  SubScenarioEntity,
  SubScenarioPriceEntity,
  TimeSlotEntity,
  ReservationStateEntity,
  ReservationEntity,
  ReservationTimeslotEntity,
  ReservationInstanceEntity,
  SubScenarioImageEntity,
  PersistenceHomeSlideEntity,
  EntityEntity,
];
