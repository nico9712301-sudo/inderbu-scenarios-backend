import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
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
} from '@nestjs/common';
import {
  CreateReservationResponseDto,
  ReservationWithDetailsResponseDto,
} from '../dtos/reservation/reservation.dto';
import { IReservationApplicationPort } from 'src/core/application/ports/inbound/reservation-application.port';
import { CreateReservationRequestDto } from '../dtos/reservation/create-reservation-request.dto';
import { AvailabilityQueryDto } from '../dtos/reservation/availability-query.dto';
import { ReservationPageOptionsDto } from '../dtos/reservation/reservation-page-options.dto';
import { UpdateReservationStateDto } from '../dtos/reservation/update-reservation-state.dto';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';
import { PageDto } from '../dtos/common/page.dto';
import { AuthGuard } from '@nestjs/passport';
import { SimplifiedAvailabilityResponseDto } from '../dtos/reservation/simplified-availability-response.dto';
import { ReservationStateDto } from '../dtos/reservation/base-reservation.dto';
import { IReservationStateRepositoryPort } from 'src/core/domain/ports/outbound/reservation-state-repository.port';
import { ReservationStateResponseMapper } from 'src/infrastructure/mappers/reservation-state/reservation-state-response.mapper';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(
    @Inject(APPLICATION_PORTS.RESERVATION)
    private readonly reservationApplicationService: IReservationApplicationPort,

    @Inject(REPOSITORY_PORTS.RESERVATION_STATE)
    private readonly reservationStateRepository: IReservationStateRepositoryPort,
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
  @UseGuards(AuthGuard('jwt'))
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
  @ApiResponse({
    status: 200,
    type: PageDto,
    description: 'Lista paginada de reservas',
  })
  async listReservations(
    @Query() pageOptionsDto: ReservationPageOptionsDto,
  ): Promise<PageDto<ReservationWithDetailsResponseDto>> {
    return await this.reservationApplicationService.listReservations(
      pageOptionsDto,
    );
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
    summary: 'Actualizar estado de una reserva',
    description:
      'Permite cambiar el estado de una reserva (PENDIENTE → CONFIRMADA → CANCELADA)',
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
    description: 'Estado actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva no encontrada',
  })
  @ApiBody({
    description: 'Nuevo estado de la reserva',
    type: UpdateReservationStateDto,
  })
  async updateReservationState(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateReservationStateDto,
  ): Promise<ReservationWithDetailsResponseDto> {
    try {
      return await this.reservationApplicationService.updateReservationState(
        id,
        { stateId: updateStateDto.reservationStateId },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
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
}
