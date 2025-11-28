import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { IFieldSurfaceTypeApplicationPort } from '../ports/inbound/field-surface-type-application.port';
import { IFieldSurfaceTypeRepositoryPort } from '../../domain/ports/outbound/field-surface-type-repository.port';
import { FieldSurfaceTypeDomainEntity } from '../../domain/entities/field-surface-type.domain-entity';
import { FieldSurfaceTypeResponseDto } from '../../../infrastructure/adapters/inbound/http/dtos/field-surface-types/field-surface-type-response.dto';
import { FieldSurfaceTypeResponseMapper } from '../../../infrastructure/mappers/field-surface-type/field-surface-type-response.mapper';
import {
  PageDto,
  PageMetaDto,
} from '../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { PageOptionsDto } from '../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { CreateFieldSurfaceTypeDto } from '../../../infrastructure/adapters/inbound/http/dtos/field-surface-types/create-field-surface-type.dto';
import { UpdateFieldSurfaceTypeDto } from '../../../infrastructure/adapters/inbound/http/dtos/field-surface-types/update-field-surface-type.dto';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class FieldSurfaceTypeApplicationService
  implements IFieldSurfaceTypeApplicationPort
{
  constructor(
    @Inject(REPOSITORY_PORTS.FIELD_SURFACE)
    private readonly fieldSurfaceTypeRepository: IFieldSurfaceTypeRepositoryPort,
  ) {}

  async getAll(): Promise<FieldSurfaceTypeResponseDto[]> {
    const fieldSurfaceTypes = await this.fieldSurfaceTypeRepository.findAll();
    return fieldSurfaceTypes.map((item) =>
      FieldSurfaceTypeResponseMapper.toDto(item),
    );
  }

  async getPaged(
    options: PageOptionsDto,
  ): Promise<PageDto<FieldSurfaceTypeResponseDto>> {
    const { data, total } =
      await this.fieldSurfaceTypeRepository.findPaged(options);

    const dtoItems = data.map((item) =>
      FieldSurfaceTypeResponseMapper.toDto(item),
    );

    return new PageDto(
      dtoItems,
      new PageMetaDto({
        page: options.page,
        limit: options.limit,
        totalItems: total,
      }),
    );
  }

  async getById(id: number): Promise<FieldSurfaceTypeResponseDto> {
    const fieldSurfaceType = await this.fieldSurfaceTypeRepository.findById(id);

    if (!fieldSurfaceType) {
      throw new NotFoundException(
        `Tipo de superficie con ID ${id} no encontrado`,
      );
    }

    return FieldSurfaceTypeResponseMapper.toDto(fieldSurfaceType);
  }

  async create(
    createDto: CreateFieldSurfaceTypeDto,
  ): Promise<FieldSurfaceTypeResponseDto> {
    // Verificar si ya existe un tipo con el mismo nombre
    const existingType = await this.fieldSurfaceTypeRepository.findByName(
      createDto.name,
    );

    if (existingType) {
      throw new ConflictException(
        `Ya existe un tipo de superficie con el nombre "${createDto.name}"`,
      );
    }

    // Crear la entidad de dominio
    const fieldSurfaceType = FieldSurfaceTypeDomainEntity.builder()
      .withName(createDto.name)
      .build();

    // Guardar y devolver
    const savedFieldSurfaceType =
      await this.fieldSurfaceTypeRepository.save(fieldSurfaceType);
    return FieldSurfaceTypeResponseMapper.toDto(savedFieldSurfaceType);
  }

  async update(
    id: number,
    updateDto: UpdateFieldSurfaceTypeDto,
  ): Promise<FieldSurfaceTypeResponseDto> {
    // Verificar si existe el tipo de superficie
    const existingType = await this.fieldSurfaceTypeRepository.findById(id);

    if (!existingType) {
      throw new NotFoundException(
        `Tipo de superficie con ID ${id} no encontrado`,
      );
    }

    // Verificar si el nuevo nombre no está en uso (si se proporciona uno)
    if (updateDto.name && updateDto.name !== existingType.name) {
      const duplicateName = await this.fieldSurfaceTypeRepository.findByName(
        updateDto.name,
      );

      if (duplicateName) {
        throw new ConflictException(
          `Ya existe un tipo de superficie con el nombre "${updateDto.name}"`,
        );
      }
    }

    // Crear la entidad de dominio actualizada
    const updatedFieldSurfaceType = FieldSurfaceTypeDomainEntity.builder()
      .withId(id)
      .withName(updateDto.name || existingType.name)
      .build();

    // Guardar y devolver
    const savedFieldSurfaceType = await this.fieldSurfaceTypeRepository.save(
      updatedFieldSurfaceType,
    );
    return FieldSurfaceTypeResponseMapper.toDto(savedFieldSurfaceType);
  }

  async delete(id: number): Promise<boolean> {
    // Verificar si existe el tipo de superficie
    const existingType = await this.fieldSurfaceTypeRepository.findById(id);

    if (!existingType) {
      throw new NotFoundException(
        `Tipo de superficie con ID ${id} no encontrado`,
      );
    }

    // Eliminar y devolver resultado
    return this.fieldSurfaceTypeRepository.delete(id);
  }
}
