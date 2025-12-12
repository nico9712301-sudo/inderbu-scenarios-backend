import { NotificationDomainEntity, NotificationTypeDomain } from '../../../core/domain/entities/notification.domain-entity';
import { NotificationEntity, NotificationType } from '../../persistence/notification.entity';

export class NotificationEntityMapper {
  /**
   * Convierte de la entidad de persistencia a la entidad de dominio usando el builder
   */
  static toDomain(entity: NotificationEntity): NotificationDomainEntity {
    return NotificationDomainEntity.builder()
      .withId(entity.id)
      .withType(entity.type as unknown as NotificationTypeDomain)
      .withTitle(entity.title)
      .withMessage(entity.message)
      .withFkReservationId(entity.fkReservationId)
      .withFkPaymentProofId(entity.fkPaymentProofId)
      .withFkReceiptId(entity.fkReceiptId)
      .withIsRead(entity.isRead)
      .withReadAt(entity.readAt)
      .withCreatedAt(entity.createdAt)
      .withUpdatedAt(entity.updatedAt)
      .build();
  }

  /**
   * Convierte de la entidad de dominio a la entidad de persistencia
   */
  static toEntity(domain: NotificationDomainEntity): NotificationEntity {
    const entity = new NotificationEntity();
    if (domain.id !== null) {
      entity.id = domain.id;
    }
    entity.type = domain.type as unknown as NotificationType;
    entity.title = domain.title;
    entity.message = domain.message;
    entity.fkReservationId = domain.fkReservationId;
    entity.fkPaymentProofId = domain.fkPaymentProofId;
    entity.fkReceiptId = domain.fkReceiptId;
    entity.isRead = domain.isRead;
    entity.readAt = domain.readAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * Convierte un array de entidades de persistencia a entidades de dominio
   */
  static toDomainArray(entities: NotificationEntity[]): NotificationDomainEntity[] {
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * Convierte un array de entidades de dominio a entidades de persistencia
   */
  static toEntityArray(domains: NotificationDomainEntity[]): NotificationEntity[] {
    return domains.map(domain => this.toEntity(domain));
  }
}