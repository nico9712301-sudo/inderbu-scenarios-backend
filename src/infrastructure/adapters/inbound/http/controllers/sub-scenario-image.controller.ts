import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  Inject,
  BadRequestException,
  ParseIntPipe,
  UploadedFiles,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Sube una o múltiples imágenes para un sub-escenario',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'subScenarioId',
    type: Number,
    description: 'ID del sub-escenario',
  })
  @ApiBody({ type: CreateImageDto })
  @ApiResponse({ status: 201, type: [SubScenarioImageResponseDto] })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file1', maxCount: 1 },
      { name: 'file2', maxCount: 1 },
      { name: 'file3', maxCount: 1 },
    ]),
  )
  async uploadImages(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
    @Body() body: any,
  ): Promise<SubScenarioImageResponseDto[]> {
    console.log(
      'Uploading images for sub-scenario ID:',
      subScenarioId,
      ' images are:',
      files,
    );

    // Verificamos que haya al menos un archivo
    if (!files || Object.keys(files).length === 0) {
      throw new BadRequestException('No se han proporcionado archivos válidos');
    }

    const results: SubScenarioImageResponseDto[] = [];
    const allFiles: Express.Multer.File[] = [];

    console.log('Received files:', files);

    try {
      // Procesar file1
      if (files.file1 && files.file1.length > 0) {
        const file = files.file1[0];
        const buffer = fs.readFileSync(file.path);
        const multerFileWithBuffer = { ...file, buffer };

        const isFeature1 =
          body.isFeature1 === 'true' || body.isFeature1 === true;
        const displayOrder1 = body.displayOrder1
          ? parseInt(body.displayOrder1, 10)
          : 0;

        const result = await this.imageApplicationService.uploadImage(
          subScenarioId,
          multerFileWithBuffer,
          isFeature1,
          displayOrder1,
        );

        results.push(result);
        allFiles.push(file);
      }

      // Procesar file2
      if (files.file2 && files.file2.length > 0) {
        const file = files.file2[0];
        const buffer = fs.readFileSync(file.path);
        const multerFileWithBuffer = { ...file, buffer };

        const isFeature2 =
          body.isFeature2 === 'true' || body.isFeature2 === true;
        const displayOrder2 = body.displayOrder2
          ? parseInt(body.displayOrder2, 10)
          : 1;

        const result = await this.imageApplicationService.uploadImage(
          subScenarioId,
          multerFileWithBuffer,
          isFeature2,
          displayOrder2,
        );

        results.push(result);
        allFiles.push(file);
      }

      // Procesar file3
      if (files.file3 && files.file3.length > 0) {
        const file = files.file3[0];
        const buffer = fs.readFileSync(file.path);
        const multerFileWithBuffer = { ...file, buffer };

        const isFeature3 =
          body.isFeature3 === 'true' || body.isFeature3 === true;
        const displayOrder3 = body.displayOrder3
          ? parseInt(body.displayOrder3, 10)
          : 2;

        const result = await this.imageApplicationService.uploadImage(
          subScenarioId,
          multerFileWithBuffer,
          isFeature3,
          displayOrder3,
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
  @ApiOperation({
    summary:
      'Obtiene las imágenes de un sub-escenario (por defecto solo las actuales)',
  })
  @ApiParam({
    name: 'subScenarioId',
    type: Number,
    description: 'ID del sub-escenario',
  })
  @ApiResponse({ status: 200, type: [SubScenarioImageResponseDto] })
  async getImages(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
    @Query('includeHistorical', new ParseBoolPipe({ optional: true }))
    includeHistorical?: boolean,
  ): Promise<SubScenarioImageResponseDto[]> {
    return this.imageApplicationService.getImagesBySubScenarioId(
      subScenarioId,
      includeHistorical || false,
    );
  }

  @Get(':subScenarioId/images/history')
  @ApiOperation({
    summary:
      'Obtiene el historial completo de imágenes de un sub-escenario (incluyendo versiones históricas)',
  })
  @ApiParam({
    name: 'subScenarioId',
    type: Number,
    description: 'ID del sub-escenario',
  })
  @ApiResponse({ status: 200, type: [SubScenarioImageResponseDto] })
  async getImagesHistory(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
  ): Promise<SubScenarioImageResponseDto[]> {
    return this.imageApplicationService.getImagesBySubScenarioId(
      subScenarioId,
      true,
    );
  }

  @Patch(':subScenarioId/images/:imageId')
  @ApiOperation({ summary: 'Actualiza una imagen específica' })
  @ApiParam({
    name: 'subScenarioId',
    type: Number,
    description: 'ID del sub-escenario',
  })
  @ApiParam({ name: 'imageId', type: Number, description: 'ID de la imagen' })
  @ApiResponse({ status: 200, type: SubScenarioImageResponseDto })
  async updateImage(
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() updateDto: UpdateImageDto,
  ): Promise<SubScenarioImageResponseDto> {
    return this.imageApplicationService.updateImage(imageId, updateDto);
  }

  @Delete(':subScenarioId/images/:imageId')
  @ApiOperation({
    summary: 'Elimina una imagen específica marcándola como histórica',
  })
  @ApiParam({
    name: 'subScenarioId',
    type: Number,
    description: 'ID del sub-escenario',
  })
  @ApiParam({ name: 'imageId', type: Number, description: 'ID de la imagen' })
  @ApiResponse({
    status: 200,
    description: 'Imagen marcada como histórica exitosamente',
  })
  async deleteImage(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.imageApplicationService.deleteImage(imageId);
    return {
      success: true,
      message: 'Imagen marcada como histórica exitosamente',
    };
  }

  @Post(':subScenarioId/manage-images')
  @ApiOperation({
    summary:
      'Gestiona imágenes de un sub-escenario - permite actualizar o eliminar imágenes específicas por posición',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'subScenarioId',
    type: Number,
    description: 'ID del sub-escenario',
  })
  @ApiResponse({ status: 201, type: [SubScenarioImageResponseDto] })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'featured', maxCount: 1 },
      { name: 'additional1', maxCount: 1 },
      { name: 'additional2', maxCount: 1 },
    ]),
  )
  async manageImages(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
    @UploadedFiles()
    files: {
      featured?: Express.Multer.File[];
      additional1?: Express.Multer.File[];
      additional2?: Express.Multer.File[];
    },
  ): Promise<SubScenarioImageResponseDto[]> {
    console.log(
      'Managing images for sub-scenario ID:',
      subScenarioId,
      'files:',
      files,
    );

    const allFiles: Express.Multer.File[] = [];

    try {
      // Preparar los archivos para el servicio de aplicación
      const imageUpdates: {
        featured?: Express.Multer.File;
        additional1?: Express.Multer.File;
        additional2?: Express.Multer.File;
      } = {};

      // Procesar imagen featured
      if (files.featured && files.featured.length > 0) {
        const file = files.featured[0];
        const buffer = fs.readFileSync(file.path);
        imageUpdates.featured = { ...file, buffer };
        allFiles.push(file);
      }

      // Procesar imagen additional1
      if (files.additional1 && files.additional1.length > 0) {
        const file = files.additional1[0];
        const buffer = fs.readFileSync(file.path);
        imageUpdates.additional1 = { ...file, buffer };
        allFiles.push(file);
      }

      // Procesar imagen additional2
      if (files.additional2 && files.additional2.length > 0) {
        const file = files.additional2[0];
        const buffer = fs.readFileSync(file.path);
        imageUpdates.additional2 = { ...file, buffer };
        allFiles.push(file);
      }

      // Llamar al servicio de aplicación
      const results = await this.imageApplicationService.manageImages(
        subScenarioId,
        imageUpdates,
      );

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
      console.error('Error gestionando imágenes:', error);
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
}
