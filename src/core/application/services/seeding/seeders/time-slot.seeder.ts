import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';
import { TimeSlotEntity } from '../../../../../infrastructure/persistence/time-slot.entity';
import { ITimeSlotSeed } from '../interfaces/time-slot-seed.interface';

@Injectable()
export class TimeSlotSeeder
  extends AbstractSeeder<TimeSlotEntity, ITimeSlotSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.TIME_SLOT)
    repository: Repository<TimeSlotEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    // Only seed if table is empty
    return (await this.repository.count()) > 0;
  }

  protected getSeeds(): Promise<ITimeSlotSeed[]> {
    // Load your JSON file (place it under src/infrastructure/seeds/time-slot-seeds.json)
    return Promise.resolve(
      this.jsonLoader.load<ITimeSlotSeed>('time-slot-seeds.json'),
    );
  }

  protected transform(seeds: ITimeSlotSeed[]): Promise<TimeSlotEntity[]> {
    // Create TypeORM entities from each seed
    return Promise.resolve(
      seeds.map((seed) =>
        this.repository.create({
          startTime: seed.startTime,
          endTime: seed.endTime,
        }),
      ),
    );
  }
}
