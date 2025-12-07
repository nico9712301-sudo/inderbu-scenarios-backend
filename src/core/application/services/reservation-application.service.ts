import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { IReservationApplicationPort } from '../ports/inbound/reservation-application.port';
import { CreateReservationRequestDto } from '../../../infrastructure/adapters/inbound/http/dtos/reservation/create-reservation-request.dto';
import {
  CreateReservationResponseDto,
  ReservationWithDetailsResponseDto,
} from '../../../infrastructure/adapters/inbound/http/dtos/reservation/reservation.dto';
import { AvailabilityQueryDto } from '../../../infrastructure/adapters/inbound/http/dtos/reservation/availability-query.dto';
import { SimplifiedAvailabilityResponseDto } from '../../../infrastructure/adapters/inbound/http/dtos/reservation/simplified-availability-response.dto';
import { ReservationPageOptionsDto } from '../../../infrastructure/adapters/inbound/http/dtos/reservation/reservation-page-options.dto';
import {
  PageDto,
  PageMetaDto,
} from '../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';

import {
  ReservationDomainEntity,
  ReservationType,
} from '../../domain/entities/reservation.domain-entity';
import { ReservationTimeslotDomainEntity } from '../../domain/entities/reservation-timeslot.domain-entity';
import { ReservationInstanceDomainEntity } from '../../domain/entities/reservation-instance.domain-entity';

import { IReservationRepositoryPort } from '../../domain/ports/outbound/reservation-repository.port';
import { IReservationTimeslotRepositoryPort } from '../../domain/ports/outbound/reservation-timeslot-repository.port';
import { IReservationInstanceRepositoryPort } from '../../domain/ports/outbound/reservation-instance-repository.port';

import { ReservationDateCalculatorDomainService } from '../../domain/services/reservation-date-calculator.domain-service';
import {
  ReservationConflict,
  ReservationConflictDetectorDomainService,
} from '../../domain/services/reservation-conflict-detector.domain-service';
import { ReservationInstanceData, ReservationInstanceGeneratorDomainService } from '../../domain/services/reservation-instance-generator.domain-service';
import { ReservationAvailabilityCheckerDomainService } from '../../domain/services/reservation-availability-checker.domain-service';

import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';
import { DOMAIN_SERVICES } from '../tokens/ports';
import { DATA_SOURCE } from '../../../infrastructure/tokens/data_sources';
import { ReservationResponseMapper } from '../../../infrastructure/mappers/reservation/reservation-response.mapper';

@Injectable()
export class ReservationApplicationService
  implements IReservationApplicationPort
{
  private readonly logger = new Logger(ReservationApplicationService.name);

  constructor(
    @Inject(DATA_SOURCE.MYSQL)
    private readonly dataSource: DataSource,

    @Inject(REPOSITORY_PORTS.RESERVATION)
    private readonly reservationRepo: IReservationRepositoryPort,

    @Inject(REPOSITORY_PORTS.RESERVATION_TIMESLOT)
    private readonly timeslotRepo: IReservationTimeslotRepositoryPort,

    @Inject(REPOSITORY_PORTS.RESERVATION_INSTANCE)
    private readonly instanceRepo: IReservationInstanceRepositoryPort,

    @Inject(DOMAIN_SERVICES.RESERVATION_DATE_CALCULATOR)
    private readonly dateCalculator: ReservationDateCalculatorDomainService,

    @Inject(DOMAIN_SERVICES.RESERVATION_CONFLICT_DETECTOR)
    private readonly conflictDetector: ReservationConflictDetectorDomainService,

    @Inject(DOMAIN_SERVICES.RESERVATION_INSTANCE_GENERATOR)
    private readonly instanceGenerator: ReservationInstanceGeneratorDomainService,

    @Inject(DOMAIN_SERVICES.RESERVATION_AVAILABILITY_CHECKER)
    private readonly availabilityChecker: ReservationAvailabilityCheckerDomainService,
  ) {}

  async createReservation(
    dto: CreateReservationRequestDto,
    userId: number,
  ): Promise<CreateReservationResponseDto> {
    // 🐛 DEBUG: Console log del payload completo de la nueva reserva
    console.log('🔥 NEW RESERVATION PAYLOAD:', {
      dto: JSON.stringify(dto, null, 2),
      userId,
      timestamp: new Date().toISOString(),
      raw_dto: dto,
    });

    this.logger.log(`Creating reservation for user ${userId}`, {
      subScenarioId: dto.subScenarioId,
      timeSlotIds: dto.timeSlotIds,
      hasRange: !!dto.reservationRange,
      weekdays: dto.weekdays?.length || 0,
    });

    // 🛡️ VALIDATION: Validación de entrada robusta
    this.validateCreateReservationDto(dto);

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;

      try {
        return await this.attemptCreateReservation(dto, userId, attempt);
      } catch (error) {
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed:`,
          error.message,
        );

        // 🔄 RETRY LOGIC: Solo reintentar en casos específicos
        if (this.shouldRetry(error, attempt, maxRetries)) {
          this.logger.log(`Retrying in ${attempt * 100}ms...`);
          await this.sleep(attempt * 100); // Backoff exponencial
          continue;
        }

        // Re-throw si no debe reintentar
        throw this.transformError(error, dto);
      }
    }

    throw new ConflictException(
      'No se pudo crear la reserva después de varios intentos. Por favor, intenta de nuevo.',
    );
  }

  private async attemptCreateReservation(
    dto: CreateReservationRequestDto,
    userId: number,
    attempt: number,
  ): Promise<CreateReservationResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.debug(`🔄 Attempt ${attempt}: Starting transaction`);

      // 1. Determinar tipo de reserva y calcular fechas
      const { type, initialDate, finalDate, weekDays } =
        this.parseReservationData(dto);
      const calculatedDates = this.dateCalculator.calculateDatesForReservation(
        type,
        initialDate,
        finalDate,
        weekDays,
      );

      this.logger.debug(
        `📅 Calculated ${calculatedDates.length} dates for reservation`,
      );

      // 2. 🛡️ CRITICAL: Verificar conflictos justo antes de crear
      const conflicts: ReservationConflict[] =
        await this.conflictDetector.detectConflictsForNewReservation(
          dto.subScenarioId,
          dto.timeSlotIds,
          calculatedDates,
        );

      if (conflicts.length > 0) {
        this.logger.warn(
          `❌ Conflicts detected: ${conflicts.length} conflicts found`,
        );
        const conflictDetails = conflicts.map((c) => ({
          date: c.date.toISOString().split('T')[0],
          timeslotId: c.timeslotId,
          existingReservationId: c.conflictingReservationId,
        }));

        throw new ConflictException({
          message: 'Algunos horarios ya están ocupados',
          conflicts: conflictDetails,
          totalConflicts: conflicts.length,
        });
      }

      // 3. Crear reserva principal
      const reservation = ReservationDomainEntity.builder()
        .withSubScenarioId(dto.subScenarioId)
        .withUserId(userId)
        .withType(type)
        .withInitialDate(initialDate)
        .withFinalDate(finalDate)
        .withWeekDays(weekDays)
        .withComments(dto.comments)
        .withReservationStateId(1) // PENDIENTE
        .build();

      const savedReservation = await this.reservationRepo.save(reservation);
      this.logger.debug(`Reservation created with ID: ${savedReservation.id}`);

      // 4. Crear relaciones con timeslots
      const timeslotEntities = dto.timeSlotIds.map((timeSlotId) =>
        ReservationTimeslotDomainEntity.builder()
          .withReservationId(savedReservation.id!)
          .withTimeslotId(timeSlotId)
          .build(),
      );

      await this.timeslotRepo.saveMany(timeslotEntities);
      this.logger.debug(
        `Created ${timeslotEntities.length} timeslot relations`,
      );

      // 5. Generar y guardar instancias
      const instancesData: ReservationInstanceData[] = this.instanceGenerator.generateInstances(
        savedReservation.id!,
        dto.subScenarioId,
        userId,
        1, // PENDIENTE
        dto.timeSlotIds,
        calculatedDates,
      );

      // 🛡️ PROTECTION: Validar instancias antes de guardar
      this.validateInstances(instancesData, dto.timeSlotIds, calculatedDates);

      await this.instanceRepo.saveMany(
        instancesData as ReservationInstanceDomainEntity[],
      );
      this.logger.debug(
        `Created ${instancesData.length} reservation instances`,
      );

      // 6. Commit transaction
      await queryRunner.commitTransaction();
      this.logger.log(
        `🎉 Reservation created successfully: ${savedReservation.id} (${instancesData.length} instances)`,
      );

      // 7. Preparar respuesta
      return this.buildCreateReservationResponse(
        savedReservation,
        dto,
        type,
        initialDate,
        finalDate,
        weekDays,
        instancesData.length,
      );
    } catch (error) {
      // 🔄 ROLLBACK: Deshacer cambios en caso de error
      await queryRunner.rollbackTransaction();
      this.logger.error(`❌ Transaction rolled back due to error:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validateCreateReservationDto(dto: CreateReservationRequestDto): void {
    if (!dto.subScenarioId || dto.subScenarioId <= 0) {
      throw new BadRequestException(
        'subScenarioId debe ser un número positivo',
      );
    }

    if (!dto.timeSlotIds || dto.timeSlotIds.length === 0) {
      throw new BadRequestException('Debe seleccionar al menos un timeslot');
    }

    // Validar timeslots únicos
    const uniqueSlots = new Set(dto.timeSlotIds);
    if (uniqueSlots.size !== dto.timeSlotIds.length) {
      throw new BadRequestException('Los timeslots deben ser únicos');
    }

    // Validar que no se seleccionen más de 24 timeslots
    if (dto.timeSlotIds.length > 24) {
      throw new BadRequestException(
        'No se pueden seleccionar más de 24 timeslots',
      );
    }

    // Validar rango de timeslots (1-24)
    const invalidSlots = dto.timeSlotIds.filter((id) => id < 1 || id > 24);
    if (invalidSlots.length > 0) {
      throw new BadRequestException(
        `Timeslots inválidos: ${invalidSlots.join(', ')}. Deben estar entre 1 y 24.`,
      );
    }

    // Validar fechas si es rango
    if (dto.reservationRange) {
      if (!dto.reservationRange.initialDate) {
        throw new BadRequestException('Fecha de inicio es requerida');
      }

      // 🛡️ FIXED: Solo validar finalDate si está presente (para rangos reales)
      if (dto.reservationRange.finalDate) {
        const initialDate = new Date(dto.reservationRange.initialDate);
        const finalDate = new Date(dto.reservationRange.finalDate);

        if (finalDate <= initialDate) {
          throw new BadRequestException(
            'La fecha de fin debe ser posterior a la fecha de inicio',
          );
        }

        // Validar que no sea un rango muy largo (más de 6 meses)
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

        if (finalDate > sixMonthsFromNow) {
          throw new BadRequestException(
            'No se pueden hacer reservas con más de 6 meses de anticipación',
          );
        }
      }
      // Si solo hay initialDate, es una reserva de un solo día (válido)
    }
  }

  private parseReservationData(dto: CreateReservationRequestDto) {
    let type: ReservationType;
    let initialDate: Date;
    let finalDate: Date | undefined = undefined;
    let weekDays: number[] | undefined = undefined;

    if (dto.reservationRange) {
      // 🛡️ FIXED: Manejar correctamente cuando finalDate es opcional
      if (dto.reservationRange.finalDate) {
        // Es un rango real con fecha final
        type = ReservationType.RANGE;
        initialDate = new Date(dto.reservationRange.initialDate + 'T00:00:00'); // ✅ Sin 'Z' = fecha local
        finalDate = new Date(dto.reservationRange.finalDate + 'T00:00:00'); // ✅ Sin 'Z' = fecha local
        weekDays = dto.weekdays || [];
      } else {
        // Solo initialDate, tratar como single day
        type = ReservationType.SINGLE;
        initialDate = new Date(dto.reservationRange.initialDate + 'T00:00:00'); // ✅ Sin 'Z' = fecha local
        finalDate = undefined;
        weekDays = undefined;
      }
    } else if (dto.singleDate) {
      type = ReservationType.SINGLE;
      initialDate = new Date(dto.singleDate + 'T00:00:00'); // ✅ Sin 'Z' = fecha local
    } else {
      // Default to today
      type = ReservationType.SINGLE;
      initialDate = new Date();
      initialDate.setHours(0, 0, 0, 0);
    }

    return { type, initialDate, finalDate, weekDays };
  }

  private validateInstances(
    instances: any[],
    expectedTimeslots: number[],
    expectedDates: Date[],
  ): void {
    const expectedTotal = expectedTimeslots.length * expectedDates.length;

    if (instances.length !== expectedTotal) {
      throw new Error(
        `Instance count mismatch: expected ${expectedTotal}, got ${instances.length}`,
      );
    }

    // Validar que no hay duplicados
    const instanceKeys = new Set();
    for (const instance of instances) {
      const key = `${instance.subScenarioId}-${instance.reservationDate.toISOString().split('T')[0]}-${instance.timeslotId}`;
      if (instanceKeys.has(key)) {
        throw new Error(`Duplicate instance detected: ${key}`);
      }
      instanceKeys.add(key);
    }
  }

  private shouldRetry(
    error: any,
    attempt: number,
    maxRetries: number,
  ): boolean {
    if (attempt >= maxRetries) return false;

    // Reintentar solo en casos de duplicación o deadlock
    const errorMessage = error.message?.toLowerCase() || '';
    const isDuplicateError =
      errorMessage.includes('duplicate') ||
      errorMessage.includes('er_dup_entry');
    const isDeadlock =
      errorMessage.includes('deadlock') ||
      errorMessage.includes('lock wait timeout');

    return isDuplicateError || isDeadlock;
  }

  private transformError(error: any, dto: CreateReservationRequestDto): Error {
    const errorMessage = error.message?.toLowerCase() || '';

    // Transformar errores de duplicación en conflictos de usuario
    if (
      errorMessage.includes('duplicate') ||
      errorMessage.includes('er_dup_entry')
    ) {
      this.logger.warn(
        'Duplicate entry detected, likely due to concurrent reservations',
      );
      return new ConflictException({
        message:
          'Algunos horarios fueron ocupados por otro usuario mientras procesabas tu reserva',
        suggestion: 'Por favor, refresca la disponibilidad y vuelve a intentar',
        subScenarioId: dto.subScenarioId,
        timeSlotIds: dto.timeSlotIds,
      });
    }

    // Transformar errores de conexión
    if (
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout')
    ) {
      return new Error(
        'Error temporal de conexión. Por favor, intenta de nuevo en unos segundos.',
      );
    }

    // Error genérico para otros casos
    return error;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildCreateReservationResponse(
    savedReservation: ReservationDomainEntity,
    dto: CreateReservationRequestDto,
    type: ReservationType,
    initialDate: Date,
    finalDate: Date | undefined,
    weekDays: number[] | undefined,
    instanceCount: number,
  ): CreateReservationResponseDto {
    return {
      id: savedReservation.id!,
      subScenarioId: dto.subScenarioId,
      userId: savedReservation.userId,
      type: type.toString(),
      initialDate: initialDate.toISOString().split('T')[0],
      finalDate: finalDate?.toISOString().split('T')[0] || null,
      weekDays: weekDays || null,
      comments: dto.comments || null,
      reservationStateId: 1,
      timeslots: dto.timeSlotIds.map((id) => ({
        id,
        startTime: `${String(id - 1).padStart(2, '0')}:00:00`, // Usar id-1 para el tiempo
        endTime: `${String(id - 1).padStart(2, '0')}:59:59`, // Usar id-1 para el tiempo
        isAvailable: true,
      })),
      instances: [], // Se podría llenar con datos reales si es necesario
      totalInstances: instanceCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getAvailabilityForConfiguration(
    query: AvailabilityQueryDto,
  ): Promise<SimplifiedAvailabilityResponseDto> {
    this.logger.debug(`Checking availability for configuration:`, {
      subScenarioId: query.subScenarioId,
      initialDate: query.initialDate,
      finalDate: query.finalDate,
      weekdays: query.weekdaysArray,
    });

    // Determinar el tipo de reserva
    const type: ReservationType = query.finalDate
      ? ReservationType.RANGE
      : ReservationType.SINGLE;

    // Parsear initialDate y finalDate
    const initialDate = new Date(query.initialDate + 'T00:00:00'); // ✅ Sin 'Z' = fecha local
    const finalDate = query.finalDate
      ? new Date(query.finalDate + 'T00:00:00') // ✅ Sin 'Z' = fecha local
      : undefined;

    // Usar la MISMA lógica de fechas que en createReservation
    const calculatedDates: Date[] =
      this.dateCalculator.calculateDatesForReservation(
        type,
        initialDate,
        finalDate,
        query.weekdaysArray || undefined,
      );

    this.logger.debug(
      `Calculated ${calculatedDates.length} dates:`,
      calculatedDates.map((d) => d.toISOString().split('T')[0]),
    );

    // 2. La capa de apliacación obtiene datos de infrastructura
    const startDate = new Date(
      Math.min(...calculatedDates.map((d) => d.getTime())),
    );
    const endDate = new Date(
      Math.max(...calculatedDates.map((d) => d.getTime())),
    );

    this.logger.debug(
      `Fetching timeslots from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // La capa de aplicación maneja la infrastructura
    const occupiedTimeslots: Map<string, number[]> =
      await this.instanceRepo.getOccupiedTimeslotsByDateRange(
        query.subScenarioId,
        startDate,
        endDate,
      );

    this.logger.debug(`Found ${occupiedTimeslots.size} occupied timeslots`);

    // Filtrar solo fechas calculadas (para weekdays especificos)
    const relevantOccupied: Map<string, number[]> = new Map();

    calculatedDates.forEach((date) => {
      const dateKey = date.toISOString().split('T')[0];
      if (occupiedTimeslots.has(dateKey)) {
        relevantOccupied.set(dateKey, occupiedTimeslots.get(dateKey) || []);
      }
    });

    // 4. Convertir a formato que el Domain Service puede procesar
    const occupiedInstancesByDate =
      this.convertMapToInstanceFormat(relevantOccupied);

    // 5. DELEGAR lógica pura al Domain Service (SIN dependencias externas)
    const result: SimplifiedAvailabilityResponseDto =
      this.availabilityChecker.calculateSimplifiedAvailability(
        query.subScenarioId,
        calculatedDates,
        occupiedInstancesByDate, // ← Datos YA obtenidos por Application
        query.initialDate,
        query.finalDate,
        query.weekdaysArray,
      );

    this.logger.debug(
      `Found availability: ${result.timeSlots.filter((t) => t.isAvailableInAllDates).length} timeslots available in all ${calculatedDates.length} dates`,
    );

    return result;
  }

  /**
   * Convierte Map de ocupados a formato compatible con Domain Service
   */
  private convertMapToInstanceFormat(occupiedMap: Map<string, number[]>): Map<
    string,
    Array<{
      timeslotId: number;
      reservationStateId: number;
      reservationId: number;
      userId: number;
    }>
  > {
    const result = new Map();

    occupiedMap.forEach((timeslotIds, dateStr) => {
      const instances = timeslotIds.map((timeslotId) => ({
        timeslotId,
        reservationStateId: 1, // PENDIENTE
        reservationId: 0, // No importa para cálculo de disponibilidad
        userId: 0, // No importa para cálculo de disponibilidad
      }));
      result.set(dateStr, instances);
    });

    return result;
  }

  async listReservations(
    options: ReservationPageOptionsDto,
  ): Promise<PageDto<ReservationWithDetailsResponseDto>> {
    const { data, total } = await this.reservationRepo.findPaged(options);

    console.log('data', data[0]);
    
    // Usar el mapper para convertir domain entities a DTOs
    const dtos: ReservationWithDetailsResponseDto[] = data.map((reservation) =>
      ReservationResponseMapper.toDetailsDto(reservation),
    );

    console.log('dtos', dtos);

    const meta = new PageMetaDto({
      page: options.page || 1,
      limit: options.limit || 20,
      totalItems: total,
    });

    return new PageDto(dtos, meta);
  }

  async getReservationById(
    id: number,
  ): Promise<ReservationWithDetailsResponseDto> {
    const reservation = await this.reservationRepo.findById(id);

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Usar el mapper para convertir domain entity a DTO
    return ReservationResponseMapper.toDetailsDto(reservation);
  }

  async updateReservationState(
    reservationId: number,
    dto: { stateId: number; comments?: string },
  ): Promise<ReservationWithDetailsResponseDto> {
    await this.reservationRepo.updateState(reservationId, dto.stateId);

    // También actualizar las instancias
    await this.instanceRepo.updateStateByReservationId(
      reservationId,
      dto.stateId,
    );

    return this.getReservationById(reservationId);
  }

  async cancelReservation(
    reservationId: number,
  ): Promise<ReservationWithDetailsResponseDto> {
    return this.updateReservationState(reservationId, { stateId: 3 }); // CANCELADA
  }

  async confirmReservation(
    reservationId: number,
  ): Promise<ReservationWithDetailsResponseDto> {
    return this.updateReservationState(reservationId, { stateId: 2 }); // CONFIRMADA
  }

  async getReservationStats(): Promise<{
    totalReservations: number;
    totalInstances: number;
    reservationsByState: Record<string, number>;
    reservationsByType: Record<string, number>;
  }> {
    return Promise.resolve({
      totalReservations: 0,
      totalInstances: 0,
      reservationsByState: {},
      reservationsByType: {},
    });
  }
}
