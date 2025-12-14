import { ReceiptDomainEntity } from '../../../core/domain/entities/receipt.domain-entity';
import { ReceiptEntity } from '../../persistence/receipt.entity';

export class ReceiptEntityMapper {
  /**
   * Convierte de la entidad de persistencia a la entidad de dominio usando el builder
   */
  static toDomain(entity: ReceiptEntity): ReceiptDomainEntity {
    return ReceiptDomainEntity.builder()
      .withId(entity.id)
      .withFkReservationId(entity.fkReservationId)
      .withFkTemplateId(entity.fkTemplateId)
      .withVariablesValues(entity.variablesValues)
      .withGeneratedAt(entity.generatedAt)
      .withSentAt(entity.sentAt)
      .withSentToEmail(entity.sentToEmail)
      .withCreatedAt(entity.createdAt)
      .withUpdatedAt(entity.updatedAt)
      .build();
  }

  /**
   * Convierte de la entidad de dominio a la entidad de persistencia
   */
  static toEntity(domain: ReceiptDomainEntity): ReceiptEntity {
    const entity = new ReceiptEntity();
    if (domain.id !== null) {
      entity.id = domain.id;
    }
    entity.fkReservationId = domain.fkReservationId;
    entity.fkTemplateId = domain.fkTemplateId;
    entity.variablesValues = domain.variablesValues;
    entity.generatedAt = domain.generatedAt;
    entity.sentAt = domain.sentAt;
    entity.sentToEmail = domain.sentToEmail;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * Convierte un array de entidades de persistencia a entidades de dominio
   */
  static toDomainArray(entities: ReceiptEntity[]): ReceiptDomainEntity[] {
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * Convierte un array de entidades de dominio a entidades de persistencia
   */
  static toEntityArray(domains: ReceiptDomainEntity[]): ReceiptEntity[] {
    return domains.map(domain => this.toEntity(domain));
  }
}