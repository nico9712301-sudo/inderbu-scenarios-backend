import { Inject, Injectable } from '@nestjs/common';
import { Repository, ILike, In } from 'typeorm';

import { IFieldSurfaceTypeRepositoryPort } from '../../../../core/domain/ports/outbound/field-surface-type-repository.port';
import { FieldSurfaceTypeDomainEntity } from '../../../../core/domain/entities/field-surface-type.domain-entity';
import { FieldSurfaceTypeEntity } from '../../../persistence/field-surface-type.entity';
import { FieldSurfaceTypeEntityMapper } from '../../../mappers/field-surface-type/field-surface-type-entity.mapper';
import { PageOptionsDto } from '../../inbound/http/dtos/common/page-options.dto';

@Injectable()
export class FieldSurfaceTypeRepositoryAdapter
  implements IFieldSurfaceTypeRepositoryPort
{
  constructor(
    @Inject(FieldSurfaceTypeEntity)
    private readonly repository: Repository<FieldSurfaceTypeEntity>,
  ) {}

  async save(
    fieldSurfaceType: FieldSurfaceTypeDomainEntity,
  ): Promise<FieldSurfaceTypeDomainEntity> {
    try {
      const entityToSave =
        FieldSurfaceTypeEntityMapper.toEntity(fieldSurfaceType);
      const savedEntity = await this.repository.save(entityToSave);
      return FieldSurfaceTypeEntityMapper.toDomain(savedEntity);
    } catch (error) {
      console.error('Error saving field surface type:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<FieldSurfaceTypeDomainEntity | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id },
      });
      return entity ? FieldSurfaceTypeEntityMapper.toDomain(entity) : null;
    } catch (error) {
      console.error(`Error finding field surface type with id ${id}:`, error);
      return null;
    }
  }

  async findAll(): Promise<FieldSurfaceTypeDomainEntity[]> {
    try {
      const entities = await this.repository.find({
        order: { name: 'ASC' },
      });
      return entities.map((entity) =>
        FieldSurfaceTypeEntityMapper.toDomain(entity),
      );
    } catch (error) {
      console.error('Error finding all field surface types:', error);
      return [];
    }
  }

  async findByIds(ids: number[]): Promise<FieldSurfaceTypeDomainEntity[]> {
    try {
      if (ids.length === 0) {
        return [];
      }

      const entities = await this.repository.find({
        where: { id: In(ids) },
        order: { name: 'ASC' },
      });

      return entities.map((entity) =>
        FieldSurfaceTypeEntityMapper.toDomain(entity),
      );
    } catch (error) {
      console.error(
        `Error finding field surface types with ids [${ids.join(', ')}]:`,
        error,
      );
      return [];
    }
  }

  async findByName(name: string): Promise<FieldSurfaceTypeDomainEntity | null> {
    try {
      const entity = await this.repository.findOne({
        where: { name },
      });

      return entity ? FieldSurfaceTypeEntityMapper.toDomain(entity) : null;
    } catch (error) {
      console.error(
        `Error finding field surface type with name "${name}":`,
        error,
      );
      return null;
    }
  }

  async findPaged(
    options: PageOptionsDto,
  ): Promise<{ data: FieldSurfaceTypeDomainEntity[]; total: number }> {
    try {
      const searchFilter = options.search
        ? { name: ILike(`%${options.search}%`) }
        : {};

      const [entities, total] = await this.repository.findAndCount({
        where: searchFilter,
        order: { name: 'ASC' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      });

      return {
        data: entities.map((entity) =>
          FieldSurfaceTypeEntityMapper.toDomain(entity),
        ),
        total,
      };
    } catch (error) {
      console.error(
        'Error in paginated search for field surface types:',
        error,
      );
      return { data: [], total: 0 };
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected != null && result.affected > 0;
    } catch (error) {
      console.error(`Error deleting field surface type with id ${id}:`, error);
      return false;
    }
  }
}
