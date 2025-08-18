import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { CityEntity } from 'src/infrastructure/persistence/city.entity';
import { DATA_LOADER } from 'src/infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ICitySeed } from '../interfaces/city-seed.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class CitySeeder
  extends AbstractSeeder<CityEntity, ICitySeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.CITY)
    repository: Repository<CityEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected async getSeeds(): Promise<ICitySeed[]> {
    return this.jsonLoader.load<ICitySeed>('city-seeds.json');
  }

  protected async transform(seeds: ICitySeed[]): Promise<CityEntity[]> {
    return seeds.map((seed) => this.repository.create(seed));
  }
}
