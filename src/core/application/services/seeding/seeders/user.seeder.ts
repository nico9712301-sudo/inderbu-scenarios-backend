import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { NeighborhoodEntity } from '../../../../../infrastructure/persistence/neighborhood.entity';
import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { UserEntity } from '../../../../../infrastructure/persistence/user.entity';
import { RoleEntity } from '../../../../../infrastructure/persistence/role.entity';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { IUserSeed } from '../interfaces/user-seed.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class UserSeeder
  extends AbstractSeeder<UserEntity, IUserSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.USER)
    repository: Repository<UserEntity>,
    @Inject(MYSQL_REPOSITORY.ROLE)
    private readonly roleRepository: Repository<RoleEntity>,
    @Inject(MYSQL_REPOSITORY.NEIGHBORHOOD)
    private readonly neighborhoodRepository: Repository<NeighborhoodEntity>,
    @Inject(DATA_LOADER.JSON)
    protected readonly jsonLoader: IDataLoader,
    private readonly configService: ConfigService,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected getSeeds(): Promise<IUserSeed[]> {
    return Promise.resolve(this.jsonLoader.load<IUserSeed>('user-seeds.json'));
  }

  protected async transform(seeds: IUserSeed[]): Promise<UserEntity[]> {
    const password = await this.getHashedPassword();

    return Promise.all(
      seeds.map(async (seed) => {
        const role = await this.resolveRole(seed.role.name);
        const neighborhood = await this.resolveNeighborhood(
          seed.neighborhood.name,
        );

        return this.repository.create({
          dni: seed.dni,
          first_name: seed.first_name,
          last_name: seed.last_name,
          email: seed.email,
          phone: seed.phone,
          password,
          role,
          address: seed.address,
          neighborhood,
          active: Boolean(seed.active),
        });
      }),
    );
  }

  private async getHashedPassword(): Promise<string> {
    const plainPassword =
      this.configService.get<string>('SEED_USER_PASSWORD') ?? 'defaultPass123!';
    return bcrypt.hash(plainPassword, 10);
  }

  private async resolveRole(name: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOneBy({ name });
    if (!role) throw new Error(`Role not found: ${name}`);
    return role;
  }

  private async resolveNeighborhood(name: string): Promise<NeighborhoodEntity> {
    const neighborhood = await this.neighborhoodRepository.findOneBy({ name });
    if (!neighborhood) throw new Error(`Neighborhood not found: ${name}`);
    return neighborhood;
  }
}
