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
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReceiptManagementApplicationPort } from '../../../../../core/application/ports/inbound/receipt-management-application.port';
import {
  GenerateReceiptDto,
  SendReceiptDto,
  ReceiptResponseDto,
} from '../dtos/receipts';
import { APPLICATION_PORTS } from '../../../../providers/billing/application-ports';
import { ITemplateRepositoryPort } from '../../../../../core/domain/ports/outbound/template-repository.port';
import { REPOSITORY_PORTS } from '../../../../tokens/ports';
// Guards not available yet
// import { JwtAuthGuard } from '../../../../../shared/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../../../shared/guards/roles.guard';
// import { Roles } from '../../../../../shared/decorators/roles.decorator';

@ApiTags('Receipts')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/receipts')
export class ReceiptController {
  constructor(
    @Inject(APPLICATION_PORTS.RECEIPT_MANAGEMENT)
    private readonly receiptService: ReceiptManagementApplicationPort,
    @Inject(REPOSITORY_PORTS.TEMPLATE)
    private readonly templateRepository: ITemplateRepositoryPort,
  ) {}

  @Post('generate')
  // @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar un nuevo recibo para una reservación' })
  @ApiResponse({
    status: 201,
    description: 'Recibo generado exitosamente',
    type: ReceiptResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Error en la generación del recibo' })
  async generateReceipt(
    @Body() generateDto: GenerateReceiptDto,
  ): Promise<ReceiptResponseDto> {
    try {
      const result = await this.receiptService.generateReceipt({
        reservationId: generateDto.reservationId,
        templateId: generateDto.templateId,
        customerEmail: generateDto.customerEmail,
        hourlyPrice: generateDto.hourlyPrice,
        totalCost: generateDto.totalCost,
      });

      return await this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('send')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Enviar un recibo por email' })
  @ApiResponse({
    status: 200,
    description: 'Recibo enviado exitosamente',
    type: ReceiptResponseDto,
  })
  async sendReceipt(
    @Body() sendDto: SendReceiptDto,
  ): Promise<ReceiptResponseDto> {
    try {
      const result = await this.receiptService.sendReceipt({
        receiptId: sendDto.receiptId,
        email: sendDto.email,
      });

      return await this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un recibo por ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Recibo encontrado',
    type: ReceiptResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Recibo no encontrado' })
  async getReceiptById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReceiptResponseDto> {
    const result = await this.receiptService.getReceiptById(id);

    if (!result) {
      throw new NotFoundException('Recibo no encontrado');
    }

    return await this.mapToResponseDto(result);
  }


  @Get('reservation/:reservationId')
  @ApiOperation({ summary: 'Obtener todos los recibos de una reservación' })
  @ApiParam({ name: 'reservationId', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Recibos de la reservación',
    type: [ReceiptResponseDto],
  })
  async getReceiptsByReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ): Promise<ReceiptResponseDto[]> {
    const results = await this.receiptService.getReceiptsByReservation(reservationId);
    return Promise.all(results.map(receipt => this.mapToResponseDto(receipt)));
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los recibos con paginación' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de recibos' })
  async getAllReceipts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: ReceiptResponseDto[]; total: number; page: number; limit: number }> {
    const result = await this.receiptService.getAllReceipts(page, limit);

    return {
      data: await Promise.all(result.data.map(receipt => this.mapToResponseDto(receipt))),
      total: result.total,
      page,
      limit,
    };
  }

  @Get('status/unsent')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obtener recibos no enviados' })
  @ApiResponse({
    status: 200,
    description: 'Recibos no enviados',
    type: [ReceiptResponseDto],
  })
  async getUnsentReceipts(): Promise<ReceiptResponseDto[]> {
    const results = await this.receiptService.getUnsentReceipts();
    return Promise.all(results.map(receipt => this.mapToResponseDto(receipt)));
  }

  @Get('status/pending')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obtener recibos pendientes de envío' })
  @ApiResponse({
    status: 200,
    description: 'Recibos pendientes de envío',
    type: [ReceiptResponseDto],
  })
  async getReceiptsPendingForSending(): Promise<ReceiptResponseDto[]> {
    const results = await this.receiptService.getReceiptsPendingForSending();
    return Promise.all(results.map(receipt => this.mapToResponseDto(receipt)));
  }

  @Delete(':id')
  // @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un recibo' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 204, description: 'Recibo eliminado exitosamente' })
  async deleteReceipt(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const success = await this.receiptService.deleteReceipt(id);

    if (!success) {
      throw new NotFoundException('No se pudo eliminar el recibo');
    }
  }

  @Get('statistics/overview')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obtener estadísticas de recibos' })
  @ApiResponse({ status: 200, description: 'Estadísticas de recibos' })
  async getReceiptStatistics() {
    return await this.receiptService.getReceiptStatistics();
  }

  private async mapToResponseDto(entity: any): Promise<ReceiptResponseDto> {
    // Get template name and content if templateId exists
    const templateId = entity.fkTemplateId || entity.templateId;
    let templateName: string | undefined;
    let templateContent: string | undefined;
    if (templateId) {
      try {
        const template = await this.templateRepository.findById(templateId);
        templateName = template?.name;
        templateContent = template?.content;
      } catch (error) {
        // If template not found, templateName will remain undefined
        templateName = undefined;
        templateContent = undefined;
      }
    }

    return {
      id: entity.id,
      reservationId: entity.fkReservationId || entity.reservationId,
      templateId: templateId,
      templateName,
      templateContent,
      variablesValues: entity.variablesValues,
      generatedAt: entity.generatedAt,
      sentAt: entity.sentAt,
      sentToEmail: entity.sentToEmail,
      isGenerated: entity.isGenerated !== undefined ? entity.isGenerated : true,
      isSent: entity.sentAt !== null,
    };
  }
}