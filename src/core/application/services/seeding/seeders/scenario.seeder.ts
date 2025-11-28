import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { NeighborhoodEntity } from '../../../../../infrastructure/persistence/neighborhood.entity';
import { ScenarioEntity } from '../../../../../infrastructure/persistence/scenario.entity';
import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { IScenarioSeed } from '../interfaces/scenario-seeds.interface';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class ScenarioSeeder
  extends AbstractSeeder<ScenarioEntity, IScenarioSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.SCENARIO)
    repository: Repository<ScenarioEntity>,
    @Inject(MYSQL_REPOSITORY.NEIGHBORHOOD)
    private neighborhoodRepository: Repository<NeighborhoodEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected getSeeds(): Promise<IScenarioSeed[]> {
    return Promise.resolve(
      this.jsonLoader.load<IScenarioSeed>('scenario-seeds.json'),
    );
  }

  protected async transform(seeds: IScenarioSeed[]): Promise<ScenarioEntity[]> {
    const entities: ScenarioEntity[] = [];
    for (const seed of seeds) {
      const neighborhood = await this.neighborhoodRepository.findOneBy({
        name: seed.neighborhoodName,
      });
      if (!neighborhood) {
        this.logger.warn(`Barrio ${seed.neighborhoodName} no encontrado.`);
        continue;
      }
      entities.push(
        this.repository.create({
          name: seed.name,
          address: seed.address,
          neighborhood,
          active: seed.active,
        }),
      );
    }
    return entities;
  }
}
