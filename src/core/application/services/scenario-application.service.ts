import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';

import { ScenarioResponseDto } from 'src/infrastructure/adapters/inbound/http/dtos/scenario/scenario-response.dto';
import { CreateScenarioDto } from 'src/infrastructure/adapters/inbound/http/dtos/scenario/create-scenario.dto';
import { UpdateScenarioDto } from 'src/infrastructure/adapters/inbound/http/dtos/scenario/update-scenario.dto';
import { INeighborhoodRepositoryPort } from 'src/core/domain/ports/outbound/neighborhood-repository.port';
import { PageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { ScenarioResponseMapper } from 'src/infrastructure/mappers/scenario/scenario-response.mapper';
import { PageDto, PageMetaDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { IScenarioRepositoryPort } from 'src/core/domain/ports/outbound/scenario-repository.port';
import { NeighborhoodDomainEntity } from 'src/core/domain/entities/neighborhood.domain-entity';
import { ScenarioDomainEntity } from 'src/core/domain/entities/scenario.domain-entity';
import { IScenarioApplicationPort } from '../ports/inbound/scenario-application.port';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';

@Injectable()
export class ScenarioApplicationService implements IScenarioApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.SCENARIO)
    private readonly scenarioRepository: IScenarioRepositoryPort,
    @Inject(REPOSITORY_PORTS.NEIGHBORHOOD)
    private readonly neighborhoodRepository: INeighborhoodRepositoryPort,
  ) {}

  async listAll(): Promise<ScenarioDomainEntity[]> {
    return this.scenarioRepository.findAll();
  }

  async getById(id: number): Promise<ScenarioDomainEntity | null> {
    const scenario = this.scenarioRepository.findById(id);
    if (!scenario) throw new NotFoundException(`Escenario ${id} no encontrado`);
    return scenario;
  }

  async listPaged(opts: PageOptionsDto): Promise<PageDto<ScenarioResponseDto>> {
    const { data: scenarios, total } = await this.scenarioRepository.findPaged(opts);
    
    // Extraer IDs de barrios para cargar
    const neighborhoodIds = scenarios
      .map((s) => s.neighborhoodId)
      .filter((id): id is number => id != null);
    
    // Crear mapa de barrios
    const neighborhoods = new Map<number, NeighborhoodDomainEntity>();
    if (neighborhoodIds.length > 0) {
      const neighList = await this.neighborhoodRepository.findByIds(neighborhoodIds);
      for (const neigh of neighList) {
        if (neigh.id != null) {
          neighborhoods.set(neigh.id, neigh);
        }
      }
    }
    
    // Mapear a DTOs
    const dto = scenarios.map((s) => ScenarioResponseMapper.toDto(s, neighborhoods));
    
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
  async create(dto: CreateScenarioDto): Promise<ScenarioResponseDto> {
    // Verificar que el barrio existe
    const neighborhood = await this.neighborhoodRepository.findById(dto.neighborhoodId);
    if (!neighborhood) {
      throw new NotFoundException(`Barrio con ID ${dto.neighborhoodId} no encontrado`);
    }

    // Crear la entidad de dominio
    const scenarioDomain = ScenarioDomainEntity.builder()
      .withName(dto.name)
      .withAddress(dto.address)
      .withNeighborhoodId(dto.neighborhoodId)
      .build();

    // Guardar en el repositorio
    const savedScenario = await this.scenarioRepository.save(scenarioDomain);

    // Crear mapa de barrios para el mapper
    const neighborhoodMap = new Map<number, NeighborhoodDomainEntity>();
    neighborhoodMap.set(neighborhood.id!, neighborhood);

    // Retornar DTO de respuesta
    return ScenarioResponseMapper.toDto(savedScenario, neighborhoodMap);
  }

  async update(id: number, dto: UpdateScenarioDto): Promise<ScenarioResponseDto> {
    console.log('ScenarioService.update called with:', { id, dto });
    console.log('dto.neighborhoodId:', dto.neighborhoodId, typeof dto.neighborhoodId);
    
    // Verificar que el escenario existe
    const existingScenario: ScenarioDomainEntity | null = await this.scenarioRepository.findById(id);
    if (!existingScenario) throw new NotFoundException(`Escenario con ID ${id} no encontrado`);

    console.log('existingScenario.neighborhoodId:', existingScenario.neighborhoodId);

    // Si se proporciona neighborhoodId, verificar que el barrio existe
    let neighborhood: NeighborhoodDomainEntity | null = null;
    // Usar el neighborhoodId del DTO si está presente, sino usar el existente
    // Tratar 0 como valor inválido (sin barrio asignado)
    const targetNeighborhoodId = dto.neighborhoodId ?? 
      (existingScenario.neighborhoodId && existingScenario.neighborhoodId > 0 ? existingScenario.neighborhoodId : undefined);
    
    console.log('targetNeighborhoodId:', targetNeighborhoodId, typeof targetNeighborhoodId);
    
    if (targetNeighborhoodId != null && targetNeighborhoodId > 0) {
      neighborhood = await this.neighborhoodRepository.findById(targetNeighborhoodId);
      if (!neighborhood) {
        throw new NotFoundException(`Barrio con ID ${targetNeighborhoodId} no encontrado`);
      }
    }

    // Crear entidad actualizada
    const updatedScenario = ScenarioDomainEntity.builder()
      .withId(id)
      .withName(dto.name ?? existingScenario.name)
      .withAddress(dto.address ?? existingScenario.address)
      .withNeighborhoodId(targetNeighborhoodId)
      .withIsActive(dto.isActive ?? existingScenario.isActive)
      .build();

    console.log('Updated scenario before saving:', updatedScenario);

    // Guardar cambios
    const savedScenario: ScenarioDomainEntity = await this.scenarioRepository.save(updatedScenario);

    // Crear mapa de barrios para el mapper
    const neighborhoodMap = new Map<number, NeighborhoodDomainEntity>();
    if (neighborhood && neighborhood.id) {
      neighborhoodMap.set(neighborhood.id, neighborhood);
    }

    // Retornar DTO de respuesta
    return ScenarioResponseMapper.toDto(savedScenario, neighborhoodMap);
  }

  async delete(id: number): Promise<boolean> {
    // Verificar que el escenario existe
    const existingScenario = await this.scenarioRepository.findById(id);
    if (!existingScenario) {
      throw new NotFoundException(`Escenario con ID ${id} no encontrado`);
    }

    try {
      // Intentar eliminar el escenario
      return await this.scenarioRepository.delete(id);
    } catch (error) {
      // Si hay sub-escenarios asociados, manejar el error
      throw new BadRequestException(
        'No se puede eliminar el escenario porque tiene sub-escenarios asociados. Elimine primero los sub-escenarios.'
      );
    }
  }
}
