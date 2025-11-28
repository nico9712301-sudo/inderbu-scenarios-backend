import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { FieldSurfaceTypeEntity } from '../../../../../infrastructure/persistence/field-surface-type.entity';
import { ActivityAreaEntity } from '../../../../../infrastructure/persistence/activity-area.entity';
import { SubScenarioEntity } from '../../../../../infrastructure/persistence/sub-scenario.entity';
import { ScenarioEntity } from '../../../../../infrastructure/persistence/scenario.entity';
import { ISubScenarioSeed } from '../interfaces/sub-scenario-seed.interface';
import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class SubScenarioSeeder
  extends AbstractSeeder<SubScenarioEntity, ISubScenarioSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.SUB_SCENARIO)
    repository: Repository<SubScenarioEntity>,
    @Inject(MYSQL_REPOSITORY.SCENARIO)
    private scenarioRepository: Repository<ScenarioEntity>,
    @Inject(MYSQL_REPOSITORY.ACTIVITY_AREA)
    private activityAreaRepository: Repository<ActivityAreaEntity>,
    @Inject(MYSQL_REPOSITORY.FIELD_SURFACE_TYPE)
    private fieldSurfaceTypeRepository: Repository<FieldSurfaceTypeEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected getSeeds(): Promise<ISubScenarioSeed[]> {
    return Promise.resolve(
      this.jsonLoader.load<ISubScenarioSeed>('sub-scenario-seeds.json'),
    );
  }

  protected async transform(
    seeds: ISubScenarioSeed[],
  ): Promise<SubScenarioEntity[]> {
    const entities: SubScenarioEntity[] = [];
    for (const seed of seeds) {
      // Buscar el escenario relacionado
      const scenario = await this.scenarioRepository.findOneBy({
        name: seed.scenarioName,
      });
      if (!scenario) {
        this.logger.warn(`Escenario ${seed.scenarioName} no encontrado.`);
        continue;
      }
      // Buscar (si se indica) el área de actividad
      let activityArea: ActivityAreaEntity | null = null;
      if (seed.activityAreaName) {
        activityArea = await this.activityAreaRepository.findOneBy({
          name: seed.activityAreaName,
        });
        if (!activityArea) {
          this.logger.warn(
            `Área de actividad ${seed.activityAreaName} no encontrada.`,
          );
        }
      }
      // Buscar (si se indica) el tipo de superficie
      let fieldSurfaceType: FieldSurfaceTypeEntity | null = null;
      if (seed.fieldSurfaceTypeName) {
        fieldSurfaceType = await this.fieldSurfaceTypeRepository.findOneBy({
          name: seed.fieldSurfaceTypeName,
        });
        if (!fieldSurfaceType) {
          this.logger.warn(
            `Tipo de superficie ${seed.fieldSurfaceTypeName} no encontrado.`,
          );
        }
      }

      // Create the entity properly
      const subScenario: SubScenarioEntity = new SubScenarioEntity();
      subScenario.name = seed.name;
      subScenario.hasCost = seed.hasCost;
      subScenario.numberOfPlayers = seed.numberOfPlayers || 0;
      subScenario.numberOfSpectators = seed.numberOfSpectators || 0;
      subScenario.recommendations = seed.recommendations || '';
      subScenario.scenario = scenario;
      subScenario.activityArea = activityArea!;
      subScenario.fieldSurfaceType = fieldSurfaceType!;
      subScenario.active = true;

      entities.push(subScenario);
    }
    return entities;
  }
}
