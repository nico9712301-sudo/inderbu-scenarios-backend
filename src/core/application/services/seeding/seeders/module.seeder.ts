import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ModuleEntity } from '../../../../../infrastructure/persistence/module.entity';
import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { IModuleSeed } from '../interfaces/module-seed.interface';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class ModuleSeeder
  extends AbstractSeeder<ModuleEntity, IModuleSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.MODULE)
    repository: Repository<ModuleEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected getSeeds(): Promise<IModuleSeed[]> {
    return Promise.resolve(
      this.jsonLoader.load<IModuleSeed>('module-seeds.json'),
    );
  }

  protected transform(seeds: IModuleSeed[]): Promise<ModuleEntity[]> {
    return Promise.resolve(
      seeds.map((seed) =>
        this.repository.create({
          name: seed.name,
        }),
      ),
    );
  }
}
