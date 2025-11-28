import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PageOptionsDto } from '../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import {
  PageDto,
  PageMetaDto,
} from '../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { ActivityAreaResponseDto } from '../../../infrastructure/adapters/inbound/http/dtos/activity-area/activity-area-response.dto';
import { CreateActivityAreaDto } from '../../../infrastructure/adapters/inbound/http/dtos/activity-area/create-activity-area.dto';
import { UpdateActivityAreaDto } from '../../../infrastructure/adapters/inbound/http/dtos/activity-area/update-activity-area.dto';
import { ActivityAreaResponseMapper } from '../../../infrastructure/mappers/activity-area/activity-area-response.mapper';

import { IActivityAreaRepositoryPort } from '../../domain/ports/outbound/activity-area-repository.port';
import { ActivityAreaDomainEntity } from '../../domain/entities/activity-area.domain-entity';
import { IActivityAreaApplicationPort } from '../ports/inbound/activity-area-application.port';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class ActivityAreaApplicationService
  implements IActivityAreaApplicationPort
{
  constructor(
    @Inject(REPOSITORY_PORTS.ACTIVITY_AREA)
    private readonly repo: IActivityAreaRepositoryPort,
  ) {}

  listAll(): Promise<ActivityAreaDomainEntity[]> {
    return this.repo.findAll();
  }

  async listPaged(
    opts: PageOptionsDto,
  ): Promise<PageDto<ActivityAreaResponseDto>> {
    const { data, total } = await this.repo.findPaged(opts);
    const dto = data.map((item) => ActivityAreaResponseMapper.toDto(item));

    return new PageDto(
      dto,
      new PageMetaDto({
        page: opts.page,
        limit: opts.limit,
        totalItems: total,
      }),
    );
  }

  // NUEVOS MÉTODOS CRUD
  async getById(id: number): Promise<ActivityAreaDomainEntity | null> {
    return this.repo.findById(id);
  }

  async create(dto: CreateActivityAreaDto): Promise<ActivityAreaResponseDto> {
    // Crear la entidad de dominio
    const activityAreaDomain = ActivityAreaDomainEntity.builder()
      .withName(dto.name)
      .build();

    // Guardar en el repositorio
    const savedActivityArea = await this.repo.save(activityAreaDomain);

    // Retornar DTO de respuesta
    return ActivityAreaResponseMapper.toDto(savedActivityArea);
  }

  async update(
    id: number,
    dto: UpdateActivityAreaDto,
  ): Promise<ActivityAreaResponseDto> {
    // Verificar que el área de actividad existe
    const existingActivityArea = await this.repo.findById(id);
    if (!existingActivityArea) {
      throw new NotFoundException(
        `Área de actividad con ID ${id} no encontrada`,
      );
    }

    // Crear entidad actualizada
    const updatedActivityArea = ActivityAreaDomainEntity.builder()
      .withId(id)
      .withName(dto.name ?? existingActivityArea.name)
      .build();

    // Guardar cambios
    const savedActivityArea = await this.repo.save(updatedActivityArea);

    // Retornar DTO de respuesta
    return ActivityAreaResponseMapper.toDto(savedActivityArea);
  }

  async delete(id: number): Promise<boolean> {
    // Verificar que el área de actividad existe
    const existingActivityArea = await this.repo.findById(id);
    if (!existingActivityArea) {
      throw new NotFoundException(
        `Área de actividad con ID ${id} no encontrada`,
      );
    }

    try {
      // Intentar eliminar el área de actividad
      return await this.repo.delete(id);
    } catch {
      // Si hay sub-escenarios asociados, manejar el error
      throw new BadRequestException(
        'No se puede eliminar el área de actividad porque tiene sub-escenarios asociados. Elimine primero los sub-escenarios.',
      );
    }
  }
}
