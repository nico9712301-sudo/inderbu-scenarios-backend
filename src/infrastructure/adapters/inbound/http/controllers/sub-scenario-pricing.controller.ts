import {
  Controller,
  Get,
  Post,
  Put,
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
import { SubScenarioPricingApplicationPort } from '../../../../../core/application/ports/inbound/sub-scenario-pricing-application.port';
import { PricingDomainService } from '../../../../../core/domain/services/pricing.domain-service';
import {
  CreateSubScenarioPriceDto,
  UpdateSubScenarioPriceDto,
  SubScenarioPriceResponseDto,
  CalculateCostDto,
  CalculateCostResponseDto,
} from '../dtos/sub-scenario-pricing';
// Guards not available yet
// import { JwtAuthGuard } from '../../../../../shared/guards/jwt-auth.guard';
// import { RolesGuard } from '../../../../../shared/guards/roles.guard';
// import { Roles } from '../../../../../shared/decorators/roles.decorator';

@ApiTags('Sub-Scenario Pricing')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/sub-scenario-pricing')
export class SubScenarioPricingController {
  constructor(
    private readonly subScenarioPricingService: SubScenarioPricingApplicationPort,
    private readonly pricingDomainService: PricingDomainService,
  ) {}

  @Post()
  // @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear configuración de precio para un sub-escenario' })
  @ApiResponse({
    status: 201,
    description: 'Precio creado exitosamente',
    type: SubScenarioPriceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El sub-escenario ya tiene precio configurado' })
  async createSubScenarioPrice(
    @Body() createDto: CreateSubScenarioPriceDto,
  ): Promise<SubScenarioPriceResponseDto> {
    try {
      const result = await this.subScenarioPricingService.createSubScenarioPrice({
        subScenarioId: createDto.subScenarioId,
        hourlyPrice: createDto.hourlyPrice,
      });

      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('sub-scenario/:subScenarioId')
  @ApiOperation({ summary: 'Obtener precio de un sub-escenario específico' })
  @ApiParam({ name: 'subScenarioId', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Precio encontrado',
    type: SubScenarioPriceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Precio no encontrado' })
  async getSubScenarioPrice(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
  ): Promise<SubScenarioPriceResponseDto> {
    const result = await this.subScenarioPricingService.getSubScenarioPrice(subScenarioId);

    if (!result) {
      throw new NotFoundException('No se encontró configuración de precio para este sub-escenario');
    }

    return this.mapToResponseDto(result);
  }

  @Put('sub-scenario/:subScenarioId')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Actualizar precio de un sub-escenario' })
  @ApiParam({ name: 'subScenarioId', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Precio actualizado exitosamente',
    type: SubScenarioPriceResponseDto,
  })
  async updateSubScenarioPrice(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
    @Body() updateDto: UpdateSubScenarioPriceDto,
  ): Promise<SubScenarioPriceResponseDto> {
    try {
      const result = await this.subScenarioPricingService.updateSubScenarioPrice(subScenarioId, {
        hourlyPrice: updateDto.hourlyPrice,
      });

      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('sub-scenario/:subScenarioId')
  // @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar configuración de precio de un sub-escenario' })
  @ApiParam({ name: 'subScenarioId', type: 'number' })
  @ApiResponse({ status: 204, description: 'Precio eliminado exitosamente' })
  async removeSubScenarioPrice(
    @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
  ): Promise<void> {
    const success = await this.subScenarioPricingService.removeSubScenarioPrice(subScenarioId);

    if (!success) {
      throw new NotFoundException('No se pudo eliminar la configuración de precio');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los precios configurados con paginación' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de precios' })
  async getAllSubScenarioPrices(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: SubScenarioPriceResponseDto[]; total: number; page: number; limit: number }> {
    const result = await this.subScenarioPricingService.getAllSubScenarioPrices(page, limit);

    return {
      data: result.data.map(item => this.mapToResponseDto(item)),
      total: result.total,
      page,
      limit,
    };
  }

  @Post('calculate-cost')
  @ApiOperation({ summary: 'Calcular costo total para una reservación' })
  @ApiResponse({
    status: 200,
    description: 'Costo calculado exitosamente',
    type: CalculateCostResponseDto,
  })
  async calculateReservationCost(
    @Body() calculateDto: CalculateCostDto,
  ): Promise<CalculateCostResponseDto> {
    const startDateTime = new Date(calculateDto.startDateTime);
    const endDateTime = new Date(calculateDto.endDateTime);

    if (startDateTime >= endDateTime) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const result = await this.subScenarioPricingService.calculateReservationCost(
      calculateDto.subScenarioId,
      startDateTime,
      endDateTime,
    );

    return {
      ...result,
      formattedCost: this.pricingDomainService.formatPrice(result.totalCost),
      hasPrice: result.hourlyPrice > 0,
    };
  }

  @Post('validate')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Validar configuración de precio para un sub-escenario' })
  @ApiResponse({ status: 200, description: 'Resultado de la validación' })
  async validateSubScenarioPricing(
    @Body() body: { subScenarioId: number; hourlyPrice: number },
  ): Promise<{ isValid: boolean; reason?: string }> {
    return await this.subScenarioPricingService.validateSubScenarioPricing(
      body.subScenarioId,
      body.hourlyPrice,
    );
  }

  private mapToResponseDto(entity: any): SubScenarioPriceResponseDto {
    return {
      id: entity.id,
      subScenarioId: entity.subScenarioId,
      hourlyPrice: entity.hourlyPrice,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      formattedPrice: this.pricingDomainService.formatPrice(entity.hourlyPrice),
    };
  }
}