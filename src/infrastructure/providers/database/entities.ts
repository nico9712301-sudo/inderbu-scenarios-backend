import { FieldSurfaceTypeEntity } from '../../persistence/field-surface-type.entity';
import { SubScenarioPriceEntity } from '../../persistence/sub-scenario-price.entity';
import { ReservationStateEntity } from '../../persistence/reservation-state.entity';
import { ActivityAreaEntity } from '../../persistence/activity-area.entity';
import { NeighborhoodEntity } from '../../persistence/neighborhood.entity';
import { SubScenarioEntity } from '../../persistence/sub-scenario.entity';
import { ReservationEntity } from '../../persistence/reservation.entity';
import { ReservationTimeslotEntity } from '../../persistence/reservation-timeslot.entity';
import { ReservationInstanceEntity } from '../../persistence/reservation-instance.entity';
import { PermissionEntity } from '../../persistence/permission.entity';
import { MenuItemEntity } from '../../persistence/menu-item.entity';
import { TimeSlotEntity } from '../../persistence/time-slot.entity';
import { ScenarioEntity } from '../../persistence/scenario.entity';
import { CommuneEntity } from '../../persistence/commune.entity';
import { ModuleEntity } from '../../persistence/module.entity';
import { CityEntity } from '../../persistence/city.entity';
import { RoleEntity } from '../../persistence/role.entity';
import { UserEntity } from '../../persistence/user.entity';
import { SubScenarioImageEntity } from '../../persistence/image.entity';
import { HomeSlideEntity as PersistenceHomeSlideEntity } from '../../persistence/home-slide.entity';
import { EntityEntity } from '../../persistence/entity.entity';

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
