import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { CommuneEntity } from 'src/infrastructure/persistence/commune.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { CityEntity } from 'src/infrastructure/persistence/city.entity';
import { ICommuneSeed } from '../interfaces/commune-seed.interface';
import { DATA_LOADER } from 'src/infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class CommuneSeeder
  extends AbstractSeeder<CommuneEntity, ICommuneSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.COMMUNE)
    repository: Repository<CommuneEntity>,
    @Inject(MYSQL_REPOSITORY.CITY)
    private cityRepository: Repository<CityEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected async getSeeds(): Promise<ICommuneSeed[]> {
    return this.jsonLoader.load<ICommuneSeed>('commune-seeds.json');
  }

  protected async transform(seeds: ICommuneSeed[]): Promise<CommuneEntity[]> {
    const entities: CommuneEntity[] = [];
    for (const seed of seeds) {
      const city = await this.cityRepository.findOneBy({ name: seed.cityName });
      if (!city) {
        this.logger.warn(`Ciudad ${seed.cityName} no encontrada.`);
        continue;
      }
      entities.push(this.repository.create({ name: seed.name, city }));
    }
    return entities;
  }
}
