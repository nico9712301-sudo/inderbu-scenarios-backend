import { Inject, Injectable } from '@nestjs/common';
import { Repository, Like, FindOptionsWhere, Not } from 'typeorm';

import { PageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
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

  async findAllPaged(pageOptionsDto: PageOptionsDto) {
    const { page, limit, search } = pageOptionsDto;
    const skip = (page - 1) * limit;

    let whereCondition: FindOptionsWhere<UserEntity>[] = [];

    // Base condition: exclude users with role 'super-admin'
    const baseCondition = {
      role: {
        name: Not('super-admin')
      }
    };

    if (search) {
      const like = Like(`%${search}%`);
      whereCondition = [
        { first_name: like, ...baseCondition },
        { last_name: like, ...baseCondition },
        { email: like, ...baseCondition },
      ];

      if (!isNaN(Number(search))) {
        whereCondition.push({ dni: Number(search), ...baseCondition } as any);
      }
    } else {
      // If no search term, just use the base condition
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

  async findByRole(
    roleId: number,
    pageOptionsDto: PageOptionsDto,
  ): Promise<{ users: UserDomainEntity[]; totalItems: number }> {
    const { page, limit, search } = pageOptionsDto;
    const skip = (page - 1) * limit;

    // Primero obtenemos el rol para verificar que no es super-admin
    const role = await this.repository.manager.find({
      where: { id: roleId, name: Not('super-admin') },
    } as any);

    // Si el rol solicitado es super-admin, retornamos lista vacía
    if (!role) {
      return { users: [], totalItems: 0 };
    }

    let whereCondition: FindOptionsWhere<UserEntity>[] = [
      { role: { id: roleId } },
    ];

    if (search) {
      const like = Like(`%${search}%`);
      whereCondition = [
        { first_name: like, role: { id: roleId } },
        { last_name: like, role: { id: roleId } },
        { email: like, role: { id: roleId } },
      ];

      if (!isNaN(Number(search))) {
        whereCondition.push({ dni: Number(search), role: { id: roleId } });
      }
    }

    const [users, totalItems] = await this.repository.findAndCount({
      where: whereCondition,
      relations: [...DEFAULT_RELATIONS],
      skip,
      take: limit,
      order: { id: 'ASC' },
    });

    return {
      users: users.map((entity) => this.toDomain(entity)),
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
