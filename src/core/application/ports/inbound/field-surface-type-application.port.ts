import { FieldSurfaceTypeResponseDto } from '../../../../infrastructure/adapters/inbound/http/dtos/field-surface-types/field-surface-type-response.dto';
import { PageDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { PageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { CreateFieldSurfaceTypeDto } from '../../../../infrastructure/adapters/inbound/http/dtos/field-surface-types/create-field-surface-type.dto';
import { UpdateFieldSurfaceTypeDto } from '../../../../infrastructure/adapters/inbound/http/dtos/field-surface-types/update-field-surface-type.dto';

export interface IFieldSurfaceTypeApplicationPort {
  getAll(): Promise<FieldSurfaceTypeResponseDto[]>;
  getPaged(
    options: PageOptionsDto,
  ): Promise<PageDto<FieldSurfaceTypeResponseDto>>;
  getById(id: number): Promise<FieldSurfaceTypeResponseDto>;
  create(
    createDto: CreateFieldSurfaceTypeDto,
  ): Promise<FieldSurfaceTypeResponseDto>;
  update(
    id: number,
    updateDto: UpdateFieldSurfaceTypeDto,
  ): Promise<FieldSurfaceTypeResponseDto>;
  delete(id: number): Promise<boolean>;
}
