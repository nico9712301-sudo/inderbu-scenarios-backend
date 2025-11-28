import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { CityEntity } from '../../../../../infrastructure/persistence/city.entity';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
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

  protected getSeeds(): Promise<ICitySeed[]> {
    return Promise.resolve(this.jsonLoader.load<ICitySeed>('city-seeds.json'));
  }

  protected transform(seeds: ICitySeed[]): Promise<CityEntity[]> {
    return Promise.resolve(seeds.map((seed) => this.repository.create(seed)));
  }
}
