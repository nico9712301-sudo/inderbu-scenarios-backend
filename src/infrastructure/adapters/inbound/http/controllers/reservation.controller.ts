import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateReservationResponseDto,
  ReservationWithDetailsResponseDto,
} from '../dtos/reservation/reservation.dto';
import { IReservationApplicationPort } from '../../../../../core/application/ports/inbound/reservation-application.port';
import { CreateReservationRequestDto } from '../dtos/reservation/create-reservation-request.dto';
import { AvailabilityQueryDto } from '../dtos/reservation/availability-query.dto';
import { ReservationPageOptionsDto } from '../dtos/reservation/reservation-page-options.dto';
import { UpdateReservationStateDto } from '../dtos/reservation/update-reservation-state.dto';
import { BulkUpdateReservationStateResponseDto } from '../dtos/reservation/bulk-update-reservation-state-response.dto';
import { APPLICATION_PORTS } from '../../../../../core/application/tokens/ports';
import { REPOSITORY_PORTS } from '../../../../tokens/ports';
import { PageDto } from '../dtos/common/page.dto';
import { AuthGuard } from '@nestjs/passport';
import { SimplifiedAvailabilityResponseDto } from '../dtos/reservation/simplified-availability-response.dto';
import { ReservationStateDto } from '../dtos/reservation/base-reservation.dto';
import { IReservationStateRepositoryPort } from '../../../../../core/domain/ports/outbound/reservation-state-repository.port';
import { ReservationStateResponseMapper } from '../../../../mappers/reservation-state/reservation-state-response.mapper';
import { ConfirmReservationDto } from '../dtos/reservation/confirm-reservation.dto';
import { ConfirmationStatusDto } from '../dtos/reservation/confirmation-status.dto';
import { APPLICATION_PORTS as BILLING_APPLICATION_PORTS } from '../../../../providers/billing/application-ports';
import { PaymentProofApplicationPort } from '../../../../../core/application/ports/inbound/payment-proof-application.port';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(
    @Inject(APPLICATION_PORTS.RESERVATION)
    private readonly reservationApplicationService: IReservationApplicationPort,

    @Inject(REPOSITORY_PORTS.RESERVATION_STATE)
    private readonly reservationStateRepository: IReservationStateRepositoryPort,

    @Inject(BILLING_APPLICATION_PORTS.PAYMENT_PROOF)
    private readonly paymentProofService: PaymentProofApplicationPort,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Crear nueva reserva (simple o con rango de fechas)',
    description:
      'Permite crear reservas de un solo día o rangos de fechas con días específicos de la semana',
  })
  @ApiResponse({
    status: 201,
    description: 'Reserva creada exitosamente',
    type: CreateReservationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o conflictos de horario',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiBody({
    description: 'Datos de la reserva a crear',
    type: CreateReservationRequestDto,
  })
  async createReservation(
    @Body() createReservationDto: CreateReservationRequestDto,
    @Request() req: any,
  ): Promise<CreateReservationResponseDto> {
    const userId = req.user?.userId; // FIXED: usar userId en lugar de id
    if (!userId)
      throw new NotFoundException('Usuario no encontrado en la sesión');

    return await this.reservationApplicationService.createReservation(
      createReservationDto,
      userId,
    );
  }

  @Get('availability')
  @ApiOperation({
    summary: 'Consultar disponibilidad para configuración de reserva completa',
    description:
      'Devuelve disponibilidad agregada para una configuración específica de reserva. ' +
      'Soporta desde consultas de un día hasta rangos complejos con días de semana específicos. ' +
      'Utiliza la misma lógica de cálculo de fechas que la creación de reservas para garantizar consistencia.',
  })
  @ApiQuery({
    name: 'subScenarioId',
    type: Number,
    description: 'ID del sub-escenario',
    example: 16,
    required: true,
  })
  @ApiQuery({
    name: 'initialDate',
    type: String,
    description: 'Fecha inicial para consultar (YYYY-MM-DD)',
    example: '2025-06-10',
    required: true,
  })
  @ApiQuery({
    name: 'finalDate',
    type: String,
    description:
      'Fecha final para consultar (YYYY-MM-DD). Si no se especifica, consulta solo initialDate',
    example: '2025-06-20',
    required: false,
  })
  @ApiQuery({
    name: 'weekdays',
    type: String,
    description:
      'Días de semana específicos separados por comas (0=Domingo, 1=Lunes, ..., 6=Sábado). Solo aplica si se especifica finalDate',
    example: '1,3,5',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad simplificada calculada exitosamente',
    type: SimplifiedAvailabilityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: 'finalDate must be after initialDate',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sub-escenario no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'SubScenario with id 16 not found',
        error: 'Not Found',
      },
    },
  })
  async getAvailability(
    @Query() query: AvailabilityQueryDto,
  ): Promise<SimplifiedAvailabilityResponseDto> {
    return await this.reservationApplicationService.getAvailabilityForConfiguration(
      query,
    );
  }

  @Get()
  //@UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Lista paginada de reservas con filtros opcionales',
    description:
      'Permite filtrar por sub-escenario, usuario, estados, tipo, y rango de fechas',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Tamaño de página',
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Búsqueda por comentarios o ID',
  })
  @ApiQuery({
    name: 'subScenarioId',
    required: false,
    type: Number,
    description: 'Filtrar por sub-escenario',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'Filtrar por usuario',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['SINGLE', 'RANGE'],
    description: 'Filtrar por tipo de reserva',
  })
  @ApiQuery({
    name: 'cityId',
    required: false,
    type: Number,
    description: 'Filtrar por ciudad',
    example: 5,
  })
  @ApiQuery({
    name: 'reservationStateIds',
    required: false,
    type: [Number],
    description: 'Filtrar por estados de reserva (1=PENDIENTE, 2=CONFIRMADA, 3=CANCELADA). Soporta múltiples valores',
    examples: {
      'Múltiples estados (array)': {
        value: [1, 2],
        summary: 'reservationStateIds=1&reservationStateIds=2'
      },
      'Múltiples estados (coma)': {
        value: '1,2',
        summary: 'reservationStateIds=1,2'
      }
    },
  })
  @ApiResponse({
    status: 200,
    type: PageDto,
    description: 'Lista paginada de reservas',
  })
  async listReservations(
    @Query() pageOptionsDto: ReservationPageOptionsDto,
  ): Promise<PageDto<ReservationWithDetailsResponseDto>> {
    const resp =
      await this.reservationApplicationService.listReservations(pageOptionsDto);
    console.log('resp', resp);
    return resp;
  }

  @Get('states')
  @ApiOperation({
    summary: 'Obtener todos los estados de reserva disponibles',
    description:
      'Devuelve la lista de todos los estados posibles para las reservas (PENDIENTE, CONFIRMADA, CANCELADA, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estados de reserva obtenidos exitosamente',
    type: [ReservationStateDto],
  })
  async getAllReservationStates(): Promise<ReservationStateDto[] | null> {
    const states = await this.reservationStateRepository.findAll();
    return states.map((state) => ReservationStateResponseMapper.toDto(state));
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Obtener detalles de una reserva específica',
    description: 'Devuelve una reserva con todos sus time slots e instancias',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la reserva',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    type: ReservationWithDetailsResponseDto,
    description: 'Detalles de la reserva obtenidos exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva no encontrada',
  })
  async getReservationById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReservationWithDetailsResponseDto> {
    try {
      return await this.reservationApplicationService.getReservationById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }
  }

  @Patch(':id/state')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Actualizar estado de una o múltiples reservas',
    description:
      'Permite cambiar el estado de una reserva individual o múltiples reservas en lote. ' +
      'Para operaciones múltiples, usar additionalReservationIds junto con el ID del path. ' +
      'Soporta transiciones: PENDIENTE → CONFIRMADA → CANCELADA',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la reserva principal',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    type: ReservationWithDetailsResponseDto,
    description: 'Estado actualizado exitosamente (operación individual)',
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/ReservationWithDetailsResponseDto' },
        { $ref: '#/components/schemas/BulkUpdateReservationStateResponseDto' },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva(s) no encontrada(s)',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o transición de estado no permitida',
  })
  @ApiBody({
    description:
      'Nuevo estado y opcionales IDs adicionales para operación múltiple',
    type: UpdateReservationStateDto,
  })
  async updateReservationState(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateReservationStateDto,
  ): Promise<
    ReservationWithDetailsResponseDto | BulkUpdateReservationStateResponseDto
  > {
    try {
      // Detectar si es operación múltiple
      const additionalIds = updateStateDto.additionalReservationIds || [];
      const allReservationIds = [id, ...additionalIds];

      // Validar que no se incluya el ID principal en los adicionales
      if (additionalIds.includes(id)) {
        throw new BadRequestException(
          `El ID principal ${id} no puede incluirse en additionalReservationIds`,
        );
      }

      if (allReservationIds.length === 1) {
        // Operación individual (comportamiento actual)
        return await this.reservationApplicationService.updateReservationState(
          id,
          {
            stateId: updateStateDto.reservationStateId,
            comments: updateStateDto.comments,
          },
        );
      } else {
        // Operación múltiple (nueva funcionalidad)
        return await this.reservationApplicationService.updateMultipleReservationStates(
          {
            reservationIds: allReservationIds,
            stateId: updateStateDto.reservationStateId,
            comments: updateStateDto.comments,
          },
        );
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new NotFoundException(
        `Error actualizando reserva(s): ${error.message}`,
      );
    }
  }

  @Get('user/:userId')
  // @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Obtener reservas de un usuario específico',
    description: 'Lista todas las reservas de un usuario con paginación',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'ID del usuario',
    example: 123,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Tamaño de página',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    type: PageDto,
    description: 'Reservas del usuario obtenidas exitosamente',
  })
  async getReservationsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() pageOptionsDto: ReservationPageOptionsDto,
  ): Promise<PageDto<ReservationWithDetailsResponseDto>> {
    const options = { ...pageOptionsDto, userId };
    return await this.reservationApplicationService.listReservations(options);
  }

  @Get(':id/confirmation-status')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Obtener estado de confirmación de una reserva',
    description:
      'Devuelve información sobre si la reserva puede ser confirmada, si requiere justificación, y si tiene comprobantes de pago',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la reserva',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    type: ConfirmationStatusDto,
    description: 'Estado de confirmación obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva no encontrada',
  })
  async getConfirmationStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConfirmationStatusDto> {
    try {
      return await this.reservationApplicationService.getConfirmationStatus(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }
  }

  @Post(':id/confirm')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('paymentProofFile'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Confirmar una reserva',
    description:
      'Confirma una reserva. Para reservas pagadas sin comprobante, se requiere justificación o se puede subir un comprobante manualmente. ' +
      'Si la reserva tiene comprobantes de pago, se confirma automáticamente sin justificación.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la reserva',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    type: ReservationWithDetailsResponseDto,
    description: 'Reserva confirmada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description:
      'La reserva requiere un comprobante de pago o una justificación para ser confirmada',
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva no encontrada',
  })
  @ApiBody({
    description: 'Justificación opcional y/o comprobante de pago para confirmar reserva pagada sin comprobante',
    schema: {
      type: 'object',
      properties: {
        justification: {
          type: 'string',
          description: 'Justificación requerida si la reserva es pagada y no tiene comprobante de pago. Máximo 500 caracteres.',
          maxLength: 500,
        },
        paymentProofFile: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de comprobante de pago (PDF, JPG, JPEG, PNG) - Opcional. Si se proporciona, se subirá antes de confirmar.',
        },
      },
    },
  })
  async confirmReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body() confirmDto: ConfirmReservationDto,
    @UploadedFile() paymentProofFile?: Express.Multer.File,
    @Request() req?: any,
  ): Promise<ReservationWithDetailsResponseDto> {
    try {
      // Si se subió un archivo, procesarlo primero
      if (paymentProofFile) {
        // Validar tipo de archivo
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
        ];
        if (!allowedMimeTypes.includes(paymentProofFile.mimetype)) {
          throw new BadRequestException(
            'Tipo de archivo no permitido. Solo se permiten PDF, JPG, JPEG y PNG',
          );
        }

        // Validar tamaño (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (paymentProofFile.size > maxSize) {
          throw new BadRequestException(
            'El archivo es demasiado grande. Tamaño máximo: 10MB',
          );
        }

        // Obtener userId del request (asumiendo que viene del JWT guard)
        const userId = req?.user?.userId;
        if (!userId) {
          throw new BadRequestException(
            'Usuario no encontrado en la sesión. Se requiere autenticación para subir comprobantes.',
          );
        }

        // Subir el comprobante
        await this.paymentProofService.uploadPaymentProofWithFile({
          reservationId: id,
          file: paymentProofFile,
          uploadedByUserId: userId,
        });
      }

      // Confirmar la reserva (con justificación si es necesaria)
      return await this.reservationApplicationService.confirmReservation(
        id,
        confirmDto.justification,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error al confirmar la reserva',
      );
    }
  }
}
