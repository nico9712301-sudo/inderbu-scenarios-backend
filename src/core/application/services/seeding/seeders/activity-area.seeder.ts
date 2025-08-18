import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ActivityAreaEntity } from 'src/infrastructure/persistence/activity-area.entity';
import { IActivityAreaSeed } from '../interfaces/activity-area-seed.interface';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { DATA_LOADER } from 'src/infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class ActivityAreaSeeder
  extends AbstractSeeder<ActivityAreaEntity, IActivityAreaSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.ACTIVITY_AREA)
    repository: Repository<ActivityAreaEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected async getSeeds(): Promise<IActivityAreaSeed[]> {
    return this.jsonLoader.load<IActivityAreaSeed>('activity-area-seeds.json');
  }

  protected async transform(
    seeds: IActivityAreaSeed[],
  ): Promise<ActivityAreaEntity[]> {
    return seeds.map((seed) => this.repository.create({ name: seed.name }));
  }
}
