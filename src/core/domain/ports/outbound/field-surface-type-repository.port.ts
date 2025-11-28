import { FieldSurfaceTypeDomainEntity } from '../../entities/field-surface-type.domain-entity';
import { PageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';

export interface IFieldSurfaceTypeRepositoryPort {
  // Operaciones básicas CRUD
  save(
    fieldSurfaceType: FieldSurfaceTypeDomainEntity,
  ): Promise<FieldSurfaceTypeDomainEntity>;
  findById(id: number): Promise<FieldSurfaceTypeDomainEntity | null>;
  findAll(): Promise<FieldSurfaceTypeDomainEntity[]>;
  findByIds(ids: number[]): Promise<FieldSurfaceTypeDomainEntity[]>;
  findByName(name: string): Promise<FieldSurfaceTypeDomainEntity | null>;
  findPaged(
    options: PageOptionsDto,
  ): Promise<{ data: FieldSurfaceTypeDomainEntity[]; total: number }>;
  delete(id: number): Promise<boolean>;
}
