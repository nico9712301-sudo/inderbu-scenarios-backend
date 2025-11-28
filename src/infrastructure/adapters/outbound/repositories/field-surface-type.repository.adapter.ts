import { Inject, Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';

import { FieldSurfaceTypeEntityMapper } from '../../../mappers/field-surface-type/field-surface-type-entity.mapper';
import { IFieldSurfaceTypeRepositoryPort } from '../../../../core/domain/ports/outbound/field-surface-type-repository.port';
import { FieldSurfaceTypeDomainEntity } from '../../../../core/domain/entities/field-surface-type.domain-entity';
import { FieldSurfaceTypeEntity } from '../../../persistence/field-surface-type.entity';
import { PageOptionsDto } from '../../inbound/http/dtos/common/page-options.dto';
import { MYSQL_REPOSITORY } from '../../../tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';

@Injectable()
export class FieldSurfaceTypeRepositoryAdapter
  extends BaseRepositoryAdapter<
    FieldSurfaceTypeEntity,
    FieldSurfaceTypeDomainEntity
  >
  implements IFieldSurfaceTypeRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.FIELD_SURFACE_TYPE)
    readonly repository: Repository<FieldSurfaceTypeEntity>,
  ) {
    super(repository);
  }

  protected toEntity(
    domain: FieldSurfaceTypeDomainEntity,
  ): FieldSurfaceTypeEntity {
    return FieldSurfaceTypeEntityMapper.toEntity(domain);
  }

  protected toDomain(
    entity: FieldSurfaceTypeEntity,
  ): FieldSurfaceTypeDomainEntity {
    return FieldSurfaceTypeEntityMapper.toDomain(entity);
  }

  async findAll(): Promise<FieldSurfaceTypeDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) =>
      FieldSurfaceTypeEntityMapper.toDomain(entity),
    );
  }

  async findByName(name: string): Promise<FieldSurfaceTypeDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? FieldSurfaceTypeEntityMapper.toDomain(entity) : null;
  }

  async findPaged(
    options: PageOptionsDto,
  ): Promise<{ data: FieldSurfaceTypeDomainEntity[]; total: number }> {
    const [entities, total] = await this.repository.findAndCount({
      take: options.limit,
    });
    return {
      data: entities.map((entity) =>
        FieldSurfaceTypeEntityMapper.toDomain(entity),
      ),
      total,
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }

  async findById(id: number) {
    const e = await this.repository.findOne({ where: { id } });
    return e ? FieldSurfaceTypeEntityMapper.toDomain(e) : null;
  }

  async findByIds(ids: number[]) {
    if (!ids.length) return [];
    const list = await this.repository.findBy({ id: In(ids) });
    return list.map((item) => FieldSurfaceTypeEntityMapper.toDomain(item));
  }

  async save(d: FieldSurfaceTypeDomainEntity) {
    const entity = await this.repository.save(
      FieldSurfaceTypeEntityMapper.toEntity(d),
    );
    return entity;
  }
}
