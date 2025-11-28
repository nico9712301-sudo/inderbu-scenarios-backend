import { ReservationInstanceEntity } from '../../persistence/reservation-instance.entity';
import { ReservationInstanceDomainEntity } from '../../../core/domain/entities/reservation-instance.domain-entity';
import { ReservationEntity } from '../../persistence/reservation.entity';
import { TimeSlotEntity } from '../../persistence/time-slot.entity';
import { SubScenarioEntity } from '../../persistence/sub-scenario.entity';
import { UserEntity } from '../../persistence/user.entity';
import { ReservationStateEntity } from '../../persistence/reservation-state.entity';

export class ReservationInstanceEntityMapper {
  static toDomain(
    entity: ReservationInstanceEntity,
  ): ReservationInstanceDomainEntity {
    const domainEntity = ReservationInstanceDomainEntity.builder()
      .withId(entity.id)
      .withReservationId(entity.reservationId)
      .withTimeslotId(entity.timeslotId)
      .withReservationDate(entity.reservationDate)
      .withSubScenarioId(entity.subScenarioId)
      .withUserId(entity.userId)
      .withReservationStateId(entity.reservationStateId)
      .withCreatedAt(entity.createdAt)
      .build();

    // Preservamos las entidades relacionadas
    if (entity.reservation) {
      (domainEntity as any).reservation = entity.reservation;
    }
    if (entity.timeslot) {
      (domainEntity as any).timeslot = entity.timeslot;
    }
    if (entity.subScenario) {
      (domainEntity as any).subScenario = entity.subScenario;
    }
    if (entity.user) {
      (domainEntity as any).user = entity.user;
    }
    if (entity.reservationState) {
      (domainEntity as any).reservationState = entity.reservationState;
    }

    return domainEntity;
  }

  static toEntity(
    domain: ReservationInstanceDomainEntity,
  ): ReservationInstanceEntity {
    const entity = new ReservationInstanceEntity();

    if (domain.id !== null) entity.id = domain.id;
    entity.reservationId = domain.reservationId;
    entity.timeslotId = domain.timeslotId;
    entity.reservationDate = domain.reservationDate;
    entity.subScenarioId = domain.subScenarioId;
    entity.userId = domain.userId;
    entity.reservationStateId = domain.reservationStateId;

    if (domain.createdAt) entity.createdAt = domain.createdAt;

    // Crear referencias básicas para las relaciones
    if (domain.reservationId) {
      entity.reservation = { id: domain.reservationId } as ReservationEntity;
    }
    if (domain.timeslotId) {
      entity.timeslot = { id: domain.timeslotId } as TimeSlotEntity;
    }
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
