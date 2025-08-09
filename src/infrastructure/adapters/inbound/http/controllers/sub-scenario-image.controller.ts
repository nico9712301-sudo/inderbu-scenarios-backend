import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseInterceptors,
  Inject,
  BadRequestException,
  ParseIntPipe,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiParam, ApiResponse, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';

import { ISubScenarioImageApplicationPort } from 'src/core/application/ports/inbound/sub-scenario-image-application.port';
import { SubScenarioImageResponseDto } from '../dtos/images/image-response.dto';
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
  @ApiBody({ type: CreateImageDto})
  @ApiResponse({ status: 201, type: [SubScenarioImageResponseDto] })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file1', maxCount: 1 },
      { name: 'file2', maxCount: 1 },
      { name: 'file3', maxCount: 1 },
    ])
  )
  async uploadImages(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
    @Body() body: any,
  ): Promise<SubScenarioImageResponseDto[]> {
    // Verificamos que haya al menos un archivo
    if (!files || Object.keys(files).length === 0) {
      throw new BadRequestException('No se han proporcionado archivos válidos');
    }
    
    const results: SubScenarioImageResponseDto[] = [];
    const allFiles: Express.Multer.File[] = [];
    
    try {
      // Procesar file1
      if (files.file1 && files.file1.length > 0) {
        const file = files.file1[0];
        const buffer = fs.readFileSync(file.path);
        const multerFileWithBuffer = { ...file, buffer };
        
        const isFeature1 = body.isFeature1 === 'true' || body.isFeature1 === true;
        const displayOrder1 = body.displayOrder1 ? parseInt(body.displayOrder1, 10) : 0;
        
        const result = await this.imageApplicationService.uploadImage(
          subScenarioId,
          multerFileWithBuffer,
          isFeature1,
          displayOrder1
        );
        
        results.push(result);
        allFiles.push(file);
      }
      
      // Procesar file2
      if (files.file2 && files.file2.length > 0) {
        const file = files.file2[0];
        const buffer = fs.readFileSync(file.path);
        const multerFileWithBuffer = { ...file, buffer };
        
        const isFeature2 = body.isFeature2 === 'true' || body.isFeature2 === true;
        const displayOrder2 = body.displayOrder2 ? parseInt(body.displayOrder2, 10) : 1;
        
        const result = await this.imageApplicationService.uploadImage(
          subScenarioId,
          multerFileWithBuffer,
          isFeature2,
          displayOrder2
        );
        
        results.push(result);
        allFiles.push(file);
      }
      
      // Procesar file3
      if (files.file3 && files.file3.length > 0) {
        const file = files.file3[0];
        const buffer = fs.readFileSync(file.path);
        const multerFileWithBuffer = { ...file, buffer };
        
        const isFeature3 = body.isFeature3 === 'true' || body.isFeature3 === true;
        const displayOrder3 = body.displayOrder3 ? parseInt(body.displayOrder3, 10) : 2;
        
        const result = await this.imageApplicationService.uploadImage(
          subScenarioId,
          multerFileWithBuffer,
          isFeature3,
          displayOrder3
        );
        
        results.push(result);
        allFiles.push(file);
      }
      
      // Limpiar archivos temporales
      for (const file of allFiles) {
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
      for (const file of allFiles) {
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
