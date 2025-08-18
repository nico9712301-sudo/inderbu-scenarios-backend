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
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

import { CommuneResponseDto } from '../dtos/commune/commune-response.dto';
import { CreateCommuneDto } from '../dtos/commune/create-commune.dto';
import { UpdateCommuneDto } from '../dtos/commune/update-commune.dto';
import { PageOptionsDto } from '../dtos/common/page-options.dto';
import { PageDto } from '../dtos/common/page.dto';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { ICommuneApplicationPort } from 'src/core/application/ports/inbound/commune-application.port';

@ApiTags('Communes')
@Controller('communes')
export class CommuneController {
  constructor(
    @Inject(APPLICATION_PORTS.COMMUNE)
    private readonly service: ICommuneApplicationPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista de comunas' })
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
    type: [CommuneResponseDto],
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
  ): Promise<CommuneResponseDto[] | PageDto<CommuneResponseDto>> {
    // Si no se especifica página o límite, retornar lista completa sin paginar
    if (!opts.page && !opts.limit && !opts.search) {
      return this.service.listAll();
    }

    // Si hay parámetros de paginación o búsqueda, usar listPaged
    return this.service.listPaged(opts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener comuna por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la comuna' })
  @ApiResponse({
    status: 200,
    type: CommuneResponseDto,
    description: 'Comuna encontrada',
  })
  @ApiResponse({ status: 404, description: 'Comuna no encontrada' })
  async findById(@Param('id') id: number): Promise<CommuneResponseDto> {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva comuna' })
  @ApiResponse({
    status: 201,
    type: CommuneResponseDto,
    description: 'Comuna creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCommuneDto: CreateCommuneDto,
  ): Promise<CommuneResponseDto> {
    return this.service.create(createCommuneDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar comuna' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la comuna' })
  @ApiResponse({
    status: 200,
    type: CommuneResponseDto,
    description: 'Comuna actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Comuna no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async update(
    @Param('id') id: number,
    @Body() updateCommuneDto: UpdateCommuneDto,
  ): Promise<CommuneResponseDto> {
    return this.service.update(id, updateCommuneDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar comuna' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la comuna' })
  @ApiResponse({ status: 204, description: 'Comuna eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Comuna no encontrada' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: number): Promise<void> {
    return this.service.delete(id);
  }
}
