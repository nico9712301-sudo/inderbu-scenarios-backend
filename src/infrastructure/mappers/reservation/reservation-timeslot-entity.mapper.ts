import { ReservationTimeslotEntity } from '../../persistence/reservation-timeslot.entity';
import { ReservationTimeslotDomainEntity } from '../../../core/domain/entities/reservation-timeslot.domain-entity';
import { ReservationEntity } from '../../persistence/reservation.entity';
import { TimeSlotEntity } from '../../persistence/time-slot.entity';

export class ReservationTimeslotEntityMapper {
  static toDomain(
    entity: ReservationTimeslotEntity,
  ): ReservationTimeslotDomainEntity {
    const domainEntity = ReservationTimeslotDomainEntity.builder()
      .withId(entity.id)
      .withReservationId(entity.reservationId)
      .withTimeslotId(entity.timeslotId)
      .withCreatedAt(entity.createdAt)
      .build();

    // Preservamos las entidades relacionadas
    if (entity.reservation) {
      (domainEntity as any).reservation = entity.reservation;
    }
    if (entity.timeslot) {
      (domainEntity as any).timeslot = entity.timeslot;
    }

    return domainEntity;
  }

  static toEntity(
    domain: ReservationTimeslotDomainEntity,
  ): ReservationTimeslotEntity {
    const entity = new ReservationTimeslotEntity();

    if (domain.id !== null) entity.id = domain.id;
    entity.reservationId = domain.reservationId;
    entity.timeslotId = domain.timeslotId;

    if (domain.createdAt) entity.createdAt = domain.createdAt;

    // Crear referencias básicas para las relaciones
    if (domain.reservationId) {
      entity.reservation = { id: domain.reservationId } as ReservationEntity;
    }
    if (domain.timeslotId) {
      entity.timeslot = { id: domain.timeslotId } as TimeSlotEntity;
    }

    return entity;
  }
}
