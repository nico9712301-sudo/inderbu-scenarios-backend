import { PaymentProofDomainEntity } from '../../../core/domain/entities/payment-proof.domain-entity';
import { PaymentProofEntity } from '../../persistence/payment-proof.entity';

export class PaymentProofEntityMapper {
  /**
   * Convierte de la entidad de persistencia a la entidad de dominio usando el builder
   */
  static toDomain(entity: PaymentProofEntity): PaymentProofDomainEntity {
    const domain = PaymentProofDomainEntity.builder()
      .withId(entity.id)
      .withFkReservationId(entity.fkReservationId)
      .withFileUrl(entity.fileUrl)
      .withUploadedByUserId(entity.uploadedByUserId)
      .withOriginalFilename(entity.originalFilename)
      .withFileSize(entity.fileSize ? Number(entity.fileSize) : null)
      .withMimeType(entity.mimeType)
      .withUploadedAt(entity.uploadedAt)
      .withCreatedAt(entity.createdAt)
      .withUpdatedAt(entity.updatedAt)
      .build();
    
    // Preserve user relation if available
    if (entity.uploadedByUser) {
      (domain as any).uploadedByUser = entity.uploadedByUser;
    }
    
    return domain;
  }

  /**
   * Convierte de la entidad de dominio a la entidad de persistencia
   */
  static toEntity(domain: PaymentProofDomainEntity): PaymentProofEntity {
    const entity = new PaymentProofEntity();
    if (domain.id !== null) {
      entity.id = domain.id;
    }
    entity.fkReservationId = domain.fkReservationId;
    entity.fileUrl = domain.fileUrl;
    entity.uploadedByUserId = domain.uploadedByUserId;
    entity.originalFilename = domain.originalFilename;
    entity.fileSize = domain.fileSize;
    entity.mimeType = domain.mimeType;
    entity.uploadedAt = domain.uploadedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * Convierte un array de entidades de persistencia a entidades de dominio
   */
  static toDomainArray(entities: PaymentProofEntity[]): PaymentProofDomainEntity[] {
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * Convierte un array de entidades de dominio a entidades de persistencia
   */
  static toEntityArray(domains: PaymentProofDomainEntity[]): PaymentProofEntity[] {
    return domains.map(domain => this.toEntity(domain));
  }
}