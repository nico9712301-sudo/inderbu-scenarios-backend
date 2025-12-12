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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentProofApplicationPort } from '../../../../../core/application/ports/inbound/payment-proof-application.port';
import { UploadPaymentProofDto } from '../dtos/payment-proofs/upload-payment-proof.dto';
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
    private readonly paymentProofService: PaymentProofApplicationPort,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subir comprobante de pago para una reservación' })
  @ApiResponse({
    status: 201,
    description: 'Comprobante subido exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error al subir el comprobante' })
  async uploadPaymentProof(
    @Body() uploadDto: UploadPaymentProofDto,
  ) {
    try {
      const result = await this.paymentProofService.uploadPaymentProof({
        reservationId: uploadDto.reservationId,
        fileUrl: uploadDto.fileUrl,
        originalFileName: uploadDto.originalFileName,
        mimeType: uploadDto.mimeType,
        fileSize: uploadDto.fileSize,
        uploadedByUserId: uploadDto.uploadedByUserId,
      });

      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
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
    return results.map(proof => this.mapToResponseDto(proof));
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
}