import { Inject, Injectable } from '@nestjs/common';
import { Repository, Like, FindOptionsWhere, Not, In } from 'typeorm';

import { PageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { UserPageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/user/user-page-options.dto';
import { IUserRepositoryPort } from 'src/core/domain/ports/outbound/user-repository.port';
import { UserEntityMapper } from 'src/infrastructure/mappers/user/user-entity.mapper';
import { UserDomainEntity } from 'src/core/domain/entities/user.domain-entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';
import { UserEntity } from '../../../persistence/user.entity';

const DEFAULT_RELATIONS = [
  'role',
  'neighborhood',
  'neighborhood.commune',
  'neighborhood.commune.city',
] as const;

@Injectable()
export class UserRepositoryAdapter
  extends BaseRepositoryAdapter<UserEntity, UserDomainEntity>
  implements IUserRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.USER)
    repository: Repository<UserEntity>,
  ) {
    super(repository, [...DEFAULT_RELATIONS]);
  }

  protected toEntity(domain: UserDomainEntity): UserEntity {
    return UserEntityMapper.toEntity(domain);
  }

  protected toDomain(entity: UserEntity): UserDomainEntity {
    return UserEntityMapper.toDomain(entity);
  }

  async findByEmail(email: string): Promise<UserDomainEntity | null> {
    const userEntity = await this.repository.findOne({
      where: { email },
      relations: [...DEFAULT_RELATIONS],
    });
    return userEntity ? this.toDomain(userEntity) : null;
  }

  async findByConfirmationToken(
    token: string,
  ): Promise<UserDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { confirmationToken: token },
      relations: [...DEFAULT_RELATIONS],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAllPaged(pageOptionsDto: UserPageOptionsDto) {
    const { page, limit, search, roleId, neighborhoodId, isActive } =
      pageOptionsDto;
    const skip = (page - 1) * limit;

    let whereCondition: FindOptionsWhere<UserEntity>[] = [];

    // Base condition: exclude users with role 'super-admin'
    const baseCondition: FindOptionsWhere<UserEntity> = {
      role: {
        name: Not('super-admin'),
      },
    };

    // Add roleId filter if provided
    if (roleId && roleId.length > 0) {
      baseCondition.role = {
        name: Not('super-admin'),
        id: In(roleId),
      };
    }

    // Add neighborhoodId filter if provided
    if (neighborhoodId) {
      baseCondition.neighborhood = {
        id: neighborhoodId,
      };
    }

    // Add isActive filter if provided
    if (isActive !== undefined) {
      baseCondition.active = isActive;
    }

    if (search) {
      const like = Like(`%${search}%`);
      whereCondition = [
        { first_name: like, ...baseCondition },
        { last_name: like, ...baseCondition },
        { email: like, ...baseCondition },
      ];

      // If search is numeric, also search by DNI
      if (!isNaN(Number(search))) {
        whereCondition.push({ dni: Number(search), ...baseCondition } as any);
      }
    } else {
      // If no search term, just use the base condition with filters
      whereCondition = [baseCondition];
    }

    const [users, totalItems] = await this.repository.findAndCount({
      where: whereCondition,
      relations: [...DEFAULT_RELATIONS],
      skip,
      take: limit,
      order: { id: 'ASC' },
    });

    return {
      users: users.map((e) => this.toDomain(e)),
      totalItems,
    };
  }

  async findByIdWithRelations(id: number): Promise<UserDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { id, role: { name: Not('super-admin') } },
      relations: [...DEFAULT_RELATIONS],
    });

    return entity ? this.toDomain(entity) : null;
  }
}
