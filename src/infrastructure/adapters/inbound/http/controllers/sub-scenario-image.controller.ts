import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Inject,
  BadRequestException,
  ParseIntPipe,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiParam, ApiResponse, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';

import { ISubScenarioImageApplicationPort } from 'src/core/application/ports/inbound/sub-scenario-image-application.port';
import { SubScenarioImageResponseDto } from '../dtos/images/image-response.dto';
import { UpdateImagesOrderDto } from '../dtos/images/update-images-order.dto';
import { CreateImageDto } from '../dtos/images/create-image.dto';
import { UpdateImageDto } from '../dtos/images/update-image.dto';

@ApiTags('Sub-escenarios Images')
@Controller('sub-scenarios')
export class SubScenarioImageController {
  constructor(
    @Inject('ISubScenarioImageApplicationPort')
    private readonly imageApplicationService: ISubScenarioImageApplicationPort,
  ) {}

  @Post(':subScenarioId/images')
  @ApiOperation({ summary: 'Sube una o múltiples imágenes para un sub-escenario' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'subScenarioId', type: Number, description: 'ID del sub-escenario' })
  @ApiBody({ type: CreateImageDto })
  @ApiResponse({ status: 201, type: [SubScenarioImageResponseDto] })
  @UseInterceptors(FilesInterceptor('files', 3)) // Permitir hasta 3 archivos
  async uploadImages(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ): Promise<SubScenarioImageResponseDto[]> {
    // Verificamos que haya archivos
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos válidos');
    }
    
    const results: SubScenarioImageResponseDto[] = [];
    
    try {
      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Determinar si es imagen destacada (el primero por defecto o el marcado explícitamente)
        const isFeature = body.isFeature ? 
          (Array.isArray(body.isFeature) ? body.isFeature[i] === 'true' : body.isFeature === 'true') : 
          (i === 0); // Por defecto, la primera imagen es destacada
        
        // Leer el archivo del sistema de archivos
        const buffer = fs.readFileSync(file.path);
        
        // Convertir a un objeto compatible con Multer pero asegurando que tenga buffer
        const multerFileWithBuffer = {
          ...file,
          buffer: buffer
        };
        
        // Procesar el archivo
        const result = await this.imageApplicationService.uploadImage(
          subScenarioId,
          multerFileWithBuffer,
          isFeature,
          i // Usar el índice como orden de visualización
        );
        
        results.push(result);
        
        // Limpiar archivo temporal
        try {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.error('Error al eliminar archivo temporal:', err);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error procesando imágenes:', error);
      // Limpiar archivos temporales en caso de error
      for (const file of files) {
        try {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.error('Error al eliminar archivo temporal:', err);
        }
      }
      throw error;
    }
  }

  @Get(':subScenarioId/images')
  @ApiOperation({ summary: 'Obtiene todas las imágenes de un sub-escenario' })
  @ApiParam({ name: 'subScenarioId', type: Number, description: 'ID del sub-escenario' })
  @ApiResponse({ status: 200, type: [SubScenarioImageResponseDto] })
  async getImages(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
  ): Promise<SubScenarioImageResponseDto[]> {
    return this.imageApplicationService.getImagesBySubScenarioId(subScenarioId);
  }

  @Patch(':subScenarioId/images/:imageId')
  @ApiOperation({ summary: 'Actualiza una imagen específica' })
  @ApiParam({ name: 'subScenarioId', type: Number, description: 'ID del sub-escenario' })
  @ApiParam({ name: 'imageId', type: Number, description: 'ID de la imagen' })
  @ApiResponse({ status: 200, type: SubScenarioImageResponseDto })
  async updateImage(
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() updateDto: UpdateImageDto,
  ): Promise<SubScenarioImageResponseDto> {
    return this.imageApplicationService.updateImage(imageId, updateDto);
  }

}
