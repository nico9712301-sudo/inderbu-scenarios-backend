import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { EntityEntity } from 'src/infrastructure/persistence/entity.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { IEntitySeed } from '../interfaces/entity-seed.interface';
import { DATA_LOADER } from 'src/infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class EntitySeeder
  extends AbstractSeeder<EntityEntity, IEntitySeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.ENTITY)
    repository: Repository<EntityEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected async getSeeds(): Promise<IEntitySeed[]> {
    return this.jsonLoader.load<IEntitySeed>('entity-seeds.json');
  }

  protected async transform(seeds: IEntitySeed[]): Promise<EntityEntity[]> {
    return seeds.map(seed => this.repository.create({
      name: seed.name,
      description: seed.description,
    }));
  }
}