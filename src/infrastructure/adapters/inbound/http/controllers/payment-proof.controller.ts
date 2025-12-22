import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Inject,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { PaymentProofApplicationPort } from '../../../../../core/application/ports/inbound/payment-proof-application.port';
import { UploadPaymentProofDto } from '../dtos/payment-proofs/upload-payment-proof.dto';
import { APPLICATION_PORTS } from '../../../../providers/billing/application-ports';
// Guards not available yet
// import { JwtAuthGuard } from '../../../../../shared/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../../../shared/guards/roles.guard';
// import { Roles } from '../../../../../shared/decorators/roles.decorator';

@ApiTags('Payment Proofs')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/payment-proofs')
export class PaymentProofController {
  constructor(
    @Inject(APPLICATION_PORTS.PAYMENT_PROOF)
    private readonly paymentProofService: PaymentProofApplicationPort,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subir comprobante de pago para una reservación' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo del comprobante de pago (PDF, JPG, JPEG, PNG)',
        },
        reservationId: {
          type: 'number',
          description: 'ID de la reservación',
        },
        uploadedByUserId: {
          type: 'number',
          description: 'ID del usuario que sube el comprobante',
        },
      },
      required: ['file', 'reservationId', 'uploadedByUserId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Comprobante subido exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error al subir el comprobante' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPaymentProof(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { reservationId: string; uploadedByUserId: string },
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No se proporcionó un archivo');
      }

      // Validate file type
      const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Tipo de archivo no permitido. Solo se permiten PDF, JPG, JPEG y PNG',
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          'El archivo es demasiado grande. Tamaño máximo: 10MB',
        );
      }

      // Read file buffer if not already present
      let fileBuffer: Buffer;
      if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.path) {
        fileBuffer = fs.readFileSync(file.path);
      } else {
        throw new BadRequestException('No se pudo leer el archivo');
      }

      // Create file object with buffer
      const fileWithBuffer: Express.Multer.File = {
        ...file,
        buffer: fileBuffer,
      };

      const reservationId = parseInt(body.reservationId, 10);
      const uploadedByUserId = parseInt(body.uploadedByUserId, 10);

      if (isNaN(reservationId) || isNaN(uploadedByUserId)) {
        throw new BadRequestException(
          'reservationId y uploadedByUserId deben ser números válidos',
        );
      }

      const result = await this.paymentProofService.uploadPaymentProofWithFile({
        reservationId,
        uploadedByUserId,
        file: fileWithBuffer,
      });

      return this.mapToResponseDto(result);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error al subir el comprobante',
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener comprobante de pago por ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Comprobante encontrado' })
  @ApiResponse({ status: 404, description: 'Comprobante no encontrado' })
  async getPaymentProofById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.paymentProofService.getPaymentProofById(id);

    if (!result) {
      throw new NotFoundException('Comprobante de pago no encontrado');
    }

    return this.mapToResponseDto(result);
  }

  @Get('reservation/:reservationId')
  @ApiOperation({ summary: 'Obtener todos los comprobantes de una reservación' })
  @ApiParam({ name: 'reservationId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Comprobantes de la reservación' })
  async getPaymentProofsByReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ) {
    const results = await this.paymentProofService.getPaymentProofsByReservation(reservationId);
    return results.map(proof => this.mapToResponseDtoWithUser(proof));
  }

  @Get()
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obtener todos los comprobantes con paginación' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de comprobantes' })
  async getAllPaymentProofs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.paymentProofService.getAllPaymentProofs(page, limit);

    return {
      data: result.data.map(proof => this.mapToResponseDto(proof)),
      total: result.total,
      page,
      limit,
    };
  }

  @Get('recent/:hours')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obtener comprobantes subidos recientemente' })
  @ApiParam({ name: 'hours', type: 'number', example: 24 })
  @ApiResponse({ status: 200, description: 'Comprobantes recientes' })
  async getRecentPaymentProofUploads(
    @Param('hours', ParseIntPipe) hours: number,
  ) {
    const results = await this.paymentProofService.getRecentPaymentProofUploads(hours);
    return results.map(proof => this.mapToResponseDto(proof));
  }

  @Delete(':id')
  // @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un comprobante de pago' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 204, description: 'Comprobante eliminado exitosamente' })
  async deletePaymentProof(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const success = await this.paymentProofService.deletePaymentProof(id);

    if (!success) {
      throw new NotFoundException('No se pudo eliminar el comprobante');
    }
  }

  private mapToResponseDto(entity: any) {
    return {
      id: entity.id,
      reservationId: entity.reservationId,
      fileUrl: entity.fileUrl,
      originalFileName: entity.originalFileName,
      mimeType: entity.mimeType,
      fileSize: entity.fileSize,
      uploadedBy: entity.uploadedBy,
      createdAt: entity.createdAt,
    };
  }

  private mapToResponseDtoWithUser(domain: any) {
    const baseDto = {
      id: domain.id,
      reservationId: domain.fkReservationId,
      fileUrl: domain.fileUrl,
      originalFileName: domain.originalFilename,
      mimeType: domain.mimeType,
      fileSize: domain.fileSize,
      uploadedBy: domain.uploadedByUserId,
      createdAt: domain.createdAt,
    };

    // Include user information if available
    if ((domain as any).uploadedByUser) {
      const user = (domain as any).uploadedByUser;
      return {
        ...baseDto,
        uploadedByUser: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role ? {
            id: user.role.id,
            name: user.role.name,
          } : null,
        },
      };
    }

    return baseDto;
  }
}