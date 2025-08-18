import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { NeighborhoodResponseMapper } from 'src/infrastructure/mappers/neighborhood/neighborhood-response.mapper';
import { INeighborhoodApplicationPort } from 'src/core/application/ports/inbound/neighborhood-application.port';
import { NeighborhoodResponseDto } from '../dtos/neighborhood/neighborhood-response.dto';
import { CreateNeighborhoodDto } from '../dtos/neighborhood/create-neighborhood.dto';
import { UpdateNeighborhoodDto } from '../dtos/neighborhood/update-neighborhood.dto';
import { PageOptionsDto } from '../dtos/common/page-options.dto';
import { PageDto } from '../dtos/common/page.dto';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { NeighborhoodDomainEntity } from 'src/core/domain/entities/neighborhood.domain-entity';

@ApiTags('Neighborhoods')
@Controller('neighborhoods')
export class NeighborhoodController {
  constructor(
    @Inject(APPLICATION_PORTS.NEIGHBORHOOD)
    private readonly service: INeighborhoodApplicationPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista de barrios' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (1‑based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Tamaño de página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Texto libre sobre name',
  })
  @ApiResponse({
    status: 200,
    type: [NeighborhoodResponseDto],
    description:
      'Retorna lista completa sin paginación si no se especifican parámetros',
  })
  @ApiResponse({
    status: 200,
    type: PageDto,
    description: 'Retorna resultado paginado cuando se especifica page o limit',
  })
  async list(
    @Query() opts: PageOptionsDto,
  ): Promise<NeighborhoodResponseDto[] | PageDto<NeighborhoodResponseDto>> {
    // Si no se especifica página o límite, retornar lista completa sin paginar
    if (!opts.page && !opts.limit && !opts.search) {
      const list: NeighborhoodDomainEntity[] = await this.service.listAll();
      return list.map(NeighborhoodResponseMapper.toDto);
    }

    // Si hay parámetros de paginación o búsqueda, usar listPaged
    return this.service.listPaged(opts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener barrio por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del barrio' })
  @ApiResponse({
    status: 200,
    type: NeighborhoodResponseDto,
    description: 'Barrio encontrado',
  })
  @ApiResponse({ status: 404, description: 'Barrio no encontrado' })
  async findById(@Param('id') id: number): Promise<NeighborhoodResponseDto> {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo barrio' })
  @ApiResponse({
    status: 201,
    type: NeighborhoodResponseDto,
    description: 'Barrio creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createNeighborhoodDto: CreateNeighborhoodDto,
  ): Promise<NeighborhoodResponseDto> {
    return this.service.create(createNeighborhoodDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar barrio' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del barrio' })
  @ApiResponse({
    status: 200,
    type: NeighborhoodResponseDto,
    description: 'Barrio actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Barrio no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async update(
    @Param('id') id: number,
    @Body() updateNeighborhoodDto: UpdateNeighborhoodDto,
  ): Promise<NeighborhoodResponseDto> {
    return this.service.update(id, updateNeighborhoodDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar barrio' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del barrio' })
  @ApiResponse({ status: 204, description: 'Barrio eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Barrio no encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: number): Promise<void> {
    return this.service.delete(id);
  }
}
