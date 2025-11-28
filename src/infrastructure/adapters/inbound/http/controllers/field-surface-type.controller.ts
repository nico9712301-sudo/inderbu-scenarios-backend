import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Inject,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { IFieldSurfaceTypeApplicationPort } from '../../../../../core/application/ports/inbound/field-surface-type-application.port';
import { FieldSurfaceTypeResponseDto } from '../dtos/field-surface-types/field-surface-type-response.dto';
import { CreateFieldSurfaceTypeDto } from '../dtos/field-surface-types/create-field-surface-type.dto';
import { UpdateFieldSurfaceTypeDto } from '../dtos/field-surface-types/update-field-surface-type.dto';
import { PageDto } from '../dtos/common/page.dto';
import { PageOptionsDto } from '../dtos/common/page-options.dto';

@ApiTags('Field surface types')
@Controller('field-surface-types')
export class FieldSurfaceTypeController {
  constructor(
    @Inject('IFieldSurfaceTypeApplicationPort')
    private readonly fieldSurfaceTypeService: IFieldSurfaceTypeApplicationPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los tipos de superficie' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (1-based)',
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
    description: 'Texto de búsqueda por nombre',
  })
  @ApiResponse({ status: 200, type: PageDto })
  async getAll(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<
    PageDto<FieldSurfaceTypeResponseDto> | FieldSurfaceTypeResponseDto[]
  > {
    // Si se proporcionan opciones de paginación, devuelve resultados paginados
    if (pageOptions.page || pageOptions.limit || pageOptions.search) {
      return this.fieldSurfaceTypeService.getPaged(pageOptions);
    }

    // Si no, devuelve todos los tipos sin paginar
    return this.fieldSurfaceTypeService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un tipo de superficie por su ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del tipo de superficie',
  })
  @ApiResponse({ status: 200, type: FieldSurfaceTypeResponseDto })
  @ApiResponse({ status: 404, description: 'Tipo de superficie no encontrado' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FieldSurfaceTypeResponseDto> {
    return this.fieldSurfaceTypeService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo tipo de superficie' })
  @ApiResponse({ status: 201, type: FieldSurfaceTypeResponseDto })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo de superficie con el mismo nombre',
  })
  async create(
    @Body() createDto: CreateFieldSurfaceTypeDto,
  ): Promise<FieldSurfaceTypeResponseDto> {
    return this.fieldSurfaceTypeService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza un tipo de superficie existente' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del tipo de superficie',
  })
  @ApiResponse({ status: 200, type: FieldSurfaceTypeResponseDto })
  @ApiResponse({ status: 404, description: 'Tipo de superficie no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo de superficie con el mismo nombre',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFieldSurfaceTypeDto,
  ): Promise<FieldSurfaceTypeResponseDto> {
    return this.fieldSurfaceTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un tipo de superficie' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del tipo de superficie',
  })
  @ApiResponse({
    status: 204,
    description: 'Tipo de superficie eliminado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de superficie no encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.fieldSurfaceTypeService.delete(id);
  }
}
