import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { RoleEntity } from 'src/infrastructure/persistence/role.entity';
import { DATA_LOADER } from 'src/infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { IRoleSeed } from '../interfaces/role-seed.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class RoleSeeder
  extends AbstractSeeder<RoleEntity, IRoleSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.ROLE)
    repository: Repository<RoleEntity>,
    @Inject(DATA_LOADER.JSON)
    protected readonly jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected async getSeeds(): Promise<IRoleSeed[]> {
    return this.jsonLoader.load<IRoleSeed>('role-seeds.json');
  }

  protected async transform(seeds: IRoleSeed[]): Promise<RoleEntity[]> {
    return seeds.map((seed) => this.repository.create(seed));
  }
}
