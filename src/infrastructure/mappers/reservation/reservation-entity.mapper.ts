import { ReservationEntity } from 'src/infrastructure/persistence/reservation.entity';
import {
  ReservationDomainEntity,
  ReservationType,
} from 'src/core/domain/entities/reservation.domain-entity';
import { SubScenarioEntity } from 'src/infrastructure/persistence/sub-scenario.entity';
import { UserEntity } from 'src/infrastructure/persistence/user.entity';
import { ReservationStateEntity } from 'src/infrastructure/persistence/reservation-state.entity';

export class ReservationEntityMapper {
  static toDomain(entity: ReservationEntity): ReservationDomainEntity {
    const domainEntity = ReservationDomainEntity.builder()
      .withId(entity.id)
      .withSubScenarioId(entity.subScenarioId)
      .withUserId(entity.userId)
      .withType(
        entity.type === 'SINGLE'
          ? ReservationType.SINGLE
          : ReservationType.RANGE,
      )
      .withInitialDate(entity.initialDate)
      .withFinalDate(entity.finalDate || undefined)
      .withWeekDays(entity.weekDays || undefined)
      .withComments(entity.comments || undefined)
      .withReservationStateId(entity.reservationStateId)
      .withCreatedAt(entity.createdAt)
      .withUpdatedAt(entity.updatedAt)
      .build();

    // Preservamos las entidades relacionadas para evitar queries adicionales
    if (entity.subScenario) {
      (domainEntity as any).subScenario = entity.subScenario;
    }
    if (entity.user) {
      (domainEntity as any).user = entity.user;
    }
    if (entity.reservationState) {
      (domainEntity as any).reservationState = entity.reservationState;
    }
    if (entity.timeslots) {
      (domainEntity as any).timeslots = entity.timeslots;
    }
    if (entity.instances) {
      (domainEntity as any).instances = entity.instances;
    }

    return domainEntity;
  }

  static toEntity(domain: ReservationDomainEntity): ReservationEntity {
    const entity = new ReservationEntity();

    if (domain.id !== null) entity.id = domain.id;
    entity.subScenarioId = domain.subScenarioId;
    entity.userId = domain.userId;
    entity.type = domain.type.toString() as 'SINGLE' | 'RANGE';
    entity.initialDate = domain.initialDate;
    entity.finalDate = domain.finalDate || null;
    entity.weekDays = domain.weekDays || null;
    entity.comments = domain.comments || null;
    entity.reservationStateId = domain.reservationStateId;

    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;

    // Crear referencias básicas para las relaciones si están disponibles
    if (domain.subScenarioId) {
      entity.subScenario = { id: domain.subScenarioId } as SubScenarioEntity;
    }
    if (domain.userId) {
      entity.user = { id: domain.userId } as UserEntity;
    }
    if (domain.reservationStateId) {
      entity.reservationState = {
        id: domain.reservationStateId,
      } as ReservationStateEntity;
    }

    return entity;
  }
}
