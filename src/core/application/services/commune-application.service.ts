import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import {
  PageDto,
  PageMetaDto,
} from 'src/infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { CommuneResponseDto } from 'src/infrastructure/adapters/inbound/http/dtos/commune/commune-response.dto';
import { CreateCommuneDto } from 'src/infrastructure/adapters/inbound/http/dtos/commune/create-commune.dto';
import { UpdateCommuneDto } from 'src/infrastructure/adapters/inbound/http/dtos/commune/update-commune.dto';
import { CommuneResponseMapper } from 'src/infrastructure/mappers/commune/commune-response.mapper';

import { ICommuneRepositoryPort } from 'src/core/domain/ports/outbound/commune-repository.port';
import { ICityRepositoryPort } from 'src/core/domain/ports/outbound/city-repository.port';
import { CommuneDomainEntity } from 'src/core/domain/entities/commune.domain-entity';
import { ICommuneApplicationPort } from '../ports/inbound/commune-application.port';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';

@Injectable()
export class CommuneApplicationService implements ICommuneApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.COMMUNE)
    private readonly communeRepository: ICommuneRepositoryPort,
    @Inject(REPOSITORY_PORTS.CITY)
    private readonly cityRepository: ICityRepositoryPort,
  ) {}

  async listAll(): Promise<CommuneResponseDto[]> {
    const communes = await this.communeRepository.findAll();
    return communes.map(CommuneResponseMapper.toDto);
  }

  async listPaged(opts: PageOptionsDto): Promise<PageDto<CommuneResponseDto>> {
    const { data, total } = await this.communeRepository.findPaged(opts);
    const dto = data.map(CommuneResponseMapper.toDto);

    return new PageDto(
      dto,
      new PageMetaDto({
        page: opts.page,
        limit: opts.limit,
        totalItems: total,
      }),
    );
  }

  async findById(id: number): Promise<CommuneResponseDto> {
    const commune = await this.communeRepository.findById(id);
    if (!commune) {
      throw new NotFoundException(`Comuna con ID ${id} no encontrada`);
    }
    return CommuneResponseMapper.toDto(commune);
  }

  async create(dto: CreateCommuneDto): Promise<CommuneResponseDto> {
    // Verificar que la ciudad existe
    const city = await this.cityRepository.findById(dto.cityId);
    if (!city) {
      throw new NotFoundException(`Ciudad con ID ${dto.cityId} no encontrada`);
    }

    // Crear entidad de dominio
    const communeEntity = CommuneDomainEntity.builder()
      .withName(dto.name)
      .withCityId(dto.cityId)
      .withCity(city)
      .build();

    // Guardar
    const savedCommune = await this.communeRepository.save(communeEntity);
    return CommuneResponseMapper.toDto(savedCommune);
  }

  async update(id: number, dto: UpdateCommuneDto): Promise<CommuneResponseDto> {
    // Verificar que la comuna existe
    const existingCommune = await this.communeRepository.findById(id);
    if (!existingCommune) {
      throw new NotFoundException(`Comuna con ID ${id} no encontrada`);
    }

    let city = existingCommune.city;
    let targetCityId = existingCommune.cityId;

    // Si se va a cambiar la ciudad, verificar que existe
    if (dto.cityId && dto.cityId !== existingCommune.cityId) {
      const foundCity = await this.cityRepository.findById(dto.cityId);
      if (!foundCity) {
        throw new NotFoundException(
          `Ciudad con ID ${dto.cityId} no encontrada`,
        );
      }
      city = foundCity;
      targetCityId = dto.cityId;
    }

    // Crear entidad actualizada
    const communeBuilder = CommuneDomainEntity.builder()
      .withId(id)
      .withName(dto.name || existingCommune.name)
      .withCityId(targetCityId);

    // Solo agregar city si existe
    if (city) {
      communeBuilder.withCity(city);
    }

    const updatedCommune = communeBuilder.build();

    // Guardar
    const savedCommune = await this.communeRepository.save(updatedCommune);
    return CommuneResponseMapper.toDto(savedCommune);
  }

  async delete(id: number): Promise<void> {
    // Verificar que la comuna existe
    const existingCommune = await this.communeRepository.findById(id);
    if (!existingCommune) {
      throw new NotFoundException(`Comuna con ID ${id} no encontrada`);
    }

    await this.communeRepository.deleteById(id);
  }
}
