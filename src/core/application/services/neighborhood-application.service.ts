import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PageOptionsDto } from '../../../infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import {
  PageDto,
  PageMetaDto,
} from '../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { NeighborhoodResponseDto } from '../../../infrastructure/adapters/inbound/http/dtos/neighborhood/neighborhood-response.dto';
import { CreateNeighborhoodDto } from '../../../infrastructure/adapters/inbound/http/dtos/neighborhood/create-neighborhood.dto';
import { UpdateNeighborhoodDto } from '../../../infrastructure/adapters/inbound/http/dtos/neighborhood/update-neighborhood.dto';
import { NeighborhoodResponseMapper } from '../../../infrastructure/mappers/neighborhood/neighborhood-response.mapper';

import { INeighborhoodRepositoryPort } from '../../domain/ports/outbound/neighborhood-repository.port';
import { ICommuneRepositoryPort } from '../../domain/ports/outbound/commune-repository.port';
import { NeighborhoodDomainEntity } from '../../domain/entities/neighborhood.domain-entity';
import { INeighborhoodApplicationPort } from '../ports/inbound/neighborhood-application.port';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class NeighborhoodApplicationService
  implements INeighborhoodApplicationPort
{
  constructor(
    @Inject(REPOSITORY_PORTS.NEIGHBORHOOD)
    private readonly neighborhoodRepository: INeighborhoodRepositoryPort,
    @Inject(REPOSITORY_PORTS.COMMUNE)
    private readonly communeRepository: ICommuneRepositoryPort,
  ) {}

  listAll(): Promise<NeighborhoodDomainEntity[]> {
    return this.neighborhoodRepository.findAll();
  }

  async listPaged(
    opts: PageOptionsDto,
  ): Promise<PageDto<NeighborhoodResponseDto>> {
    const { data, total } = await this.neighborhoodRepository.findPaged(opts);
    const dto = data.map((item) => NeighborhoodResponseMapper.toDto(item));

    return new PageDto(
      dto,
      new PageMetaDto({
        page: opts.page,
        limit: opts.limit,
        totalItems: total,
      }),
    );
  }

  async findById(id: number): Promise<NeighborhoodResponseDto> {
    const neighborhood = await this.neighborhoodRepository.findById(id);
    if (!neighborhood) {
      throw new NotFoundException(`Barrio con ID ${id} no encontrado`);
    }
    return NeighborhoodResponseMapper.toDto(neighborhood);
  }

  async create(dto: CreateNeighborhoodDto): Promise<NeighborhoodResponseDto> {
    // Verificar que la comuna existe
    const commune = await this.communeRepository.findById(dto.communeId);
    if (!commune) {
      throw new NotFoundException(
        `Comuna con ID ${dto.communeId} no encontrada`,
      );
    }

    // Crear entidad de dominio
    const neighborhoodEntity = NeighborhoodDomainEntity.builder()
      .withName(dto.name)
      .withCommuneId(dto.communeId)
      .withCommune(commune)
      .build();

    // Guardar
    const savedNeighborhood =
      await this.neighborhoodRepository.save(neighborhoodEntity);
    return NeighborhoodResponseMapper.toDto(savedNeighborhood);
  }

  async update(
    id: number,
    dto: UpdateNeighborhoodDto,
  ): Promise<NeighborhoodResponseDto> {
    // Verificar que el barrio existe
    const existingNeighborhood = await this.neighborhoodRepository.findById(id);
    if (!existingNeighborhood) {
      throw new NotFoundException(`Barrio con ID ${id} no encontrado`);
    }

    let commune = existingNeighborhood.commune;
    let targetCommuneId = existingNeighborhood.communeId;

    // Si se va a cambiar la comuna, verificar que existe
    if (dto.communeId && dto.communeId !== existingNeighborhood.communeId) {
      const foundCommune = await this.communeRepository.findById(dto.communeId);
      if (!foundCommune) {
        throw new NotFoundException(
          `Comuna con ID ${dto.communeId} no encontrada`,
        );
      }
      commune = foundCommune;
      targetCommuneId = dto.communeId;
    }

    // Crear entidad actualizada
    const neighborhoodBuilder = NeighborhoodDomainEntity.builder()
      .withId(id)
      .withName(dto.name || existingNeighborhood.name)
      .withCommuneId(targetCommuneId);

    // Solo agregar commune si existe
    if (commune) {
      neighborhoodBuilder.withCommune(commune);
    }

    const updatedNeighborhood = neighborhoodBuilder.build();

    // Guardar
    const savedNeighborhood =
      await this.neighborhoodRepository.save(updatedNeighborhood);
    return NeighborhoodResponseMapper.toDto(savedNeighborhood);
  }

  async delete(id: number): Promise<void> {
    // Verificar que el barrio existe
    const existingNeighborhood = await this.neighborhoodRepository.findById(id);
    if (!existingNeighborhood) {
      throw new NotFoundException(`Barrio con ID ${id} no encontrado`);
    }

    await this.neighborhoodRepository.deleteById(id);
  }
}
