import { TemplateDomainEntity, TemplateTypeDomain } from '../../../core/domain/entities/template.domain-entity';
import { TemplateEntity, TemplateType } from '../../persistence/template.entity';

export class TemplateEntityMapper {
  /**
   * Convierte de la entidad de persistencia a la entidad de dominio usando el builder
   */
  static toDomain(entity: TemplateEntity): TemplateDomainEntity {
    return TemplateDomainEntity.builder()
      .withId(entity.id)
      .withName(entity.name)
      .withType(entity.type as unknown as TemplateTypeDomain)
      .withContent(entity.content)
      .withIsActive(entity.isActive)
      .withCreatedBy(entity.createdBy)
      .withCreatedAt(entity.createdAt)
      .withUpdatedAt(entity.updatedAt)
      .build();
  }

  /**
   * Convierte de la entidad de dominio a la entidad de persistencia
   */
  static toEntity(domain: TemplateDomainEntity): TemplateEntity {
    const entity = new TemplateEntity();
    if (domain.id !== null) {
      entity.id = domain.id;
    }
    entity.name = domain.name;
    entity.type = domain.type as unknown as TemplateType;
    entity.content = domain.content;
    entity.isActive = domain.isActive;
    entity.createdBy = domain.createdBy;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * Convierte un array de entidades de persistencia a entidades de dominio
   */
  static toDomainArray(entities: TemplateEntity[]): TemplateDomainEntity[] {
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * Convierte un array de entidades de dominio a entidades de persistencia
   */
  static toEntityArray(domains: TemplateDomainEntity[]): TemplateEntity[] {
    return domains.map(domain => this.toEntity(domain));
  }
}