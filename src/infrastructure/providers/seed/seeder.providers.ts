import { FieldSurfaceTypeSeeder } from 'src/core/application/services/seeding/seeders/field-surface-type.seeder';
import { SubScenarioPriceSeeder } from 'src/core/application/services/seeding/seeders/sub-scenario-price.seeder';
import { ActivityAreaSeeder } from 'src/core/application/services/seeding/seeders/activity-area.seeder';
import { NeighborhoodSeeder } from 'src/core/application/services/seeding/seeders/neighborhood.seeder';
import { SubScenarioSeeder } from 'src/core/application/services/seeding/seeders/sub-scenario.seeder';
import { TimeSlotSeeder } from 'src/core/application/services/seeding/seeders/time-slot.seeder';
import { ScenarioSeeder } from 'src/core/application/services/seeding/seeders/scenario.seeder';
import { CommuneSeeder } from 'src/core/application/services/seeding/seeders/commune.seeder';
import { CitySeeder } from 'src/core/application/services/seeding/seeders/city.seeder';
import { RoleSeeder } from 'src/core/application/services/seeding/seeders/role.seeder';
import { UserSeeder } from 'src/core/application/services/seeding/seeders/user.seeder';
import { ReservationStateSeeder } from 'src/core/application/services/seeding/seeders/reservation-state.seeder';
import { SubScenarioImageSeeder } from 'src/core/application/services/seeding/seeders/sub-scenario-image.seeder';
import { HomeSlideSeeder } from 'src/core/application/services/seeding/seeders/home-slide.seeder';
import { ModuleSeeder } from 'src/core/application/services/seeding/seeders/module.seeder';
import { MenuItemSeeder } from 'src/core/application/services/seeding/seeders/menu-item.seeder';
import { EntitySeeder } from 'src/core/application/services/seeding/seeders/entity.seeder';

/**
 * Important: Import seeders in the order of dependencies. Cardinality is important.
 * For example, if a NeighborhoodSeeder depends on a CommuneSeeder, the CommuneSeeder
 * must be imported before the NeighborhoodSeeder.
 */
export const seederProviders = [
  ModuleSeeder,
  MenuItemSeeder,
  EntitySeeder,
  CitySeeder,
  CommuneSeeder,
  NeighborhoodSeeder,
  RoleSeeder,
  UserSeeder,
  FieldSurfaceTypeSeeder,
  ActivityAreaSeeder,
  ScenarioSeeder,
  SubScenarioSeeder,
  SubScenarioPriceSeeder,
  SubScenarioImageSeeder,
  TimeSlotSeeder,
  ReservationStateSeeder,
  HomeSlideSeeder,
];
