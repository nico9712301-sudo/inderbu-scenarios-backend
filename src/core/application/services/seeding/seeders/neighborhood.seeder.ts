import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { NeighborhoodEntity } from '../../../../../infrastructure/persistence/neighborhood.entity';
import { CommuneEntity } from '../../../../../infrastructure/persistence/commune.entity';
import { INeighborhoodSeed } from '../interfaces/neighborhood-seed.interface';
import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class NeighborhoodSeeder
  extends AbstractSeeder<NeighborhoodEntity, INeighborhoodSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.NEIGHBORHOOD)
    repository: Repository<NeighborhoodEntity>,
    @Inject(MYSQL_REPOSITORY.COMMUNE)
    private communeRepository: Repository<CommuneEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected getSeeds(): Promise<INeighborhoodSeed[]> {
    return Promise.resolve(
      this.jsonLoader.load<INeighborhoodSeed>('neighborhood-seeds.json'),
    );
  }

  protected async transform(
    seeds: INeighborhoodSeed[],
  ): Promise<NeighborhoodEntity[]> {
    const entities: NeighborhoodEntity[] = [];
    for (const seed of seeds) {
      const commune = await this.communeRepository.findOneBy({
        name: seed.communeName,
      });
      if (!commune) {
        this.logger.warn(`Comuna ${seed.communeName} no encontrada.`);
        continue;
      }
      entities.push(this.repository.create({ name: seed.name, commune }));
    }
    return entities;
  }
}
