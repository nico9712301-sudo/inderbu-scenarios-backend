import { TemplateDomainEntity, TemplateTypeDomain } from '../../entities/template.domain-entity';

export interface ITemplateRepositoryPort {
  /**
   * Finds all active templates of a specific type
   */
  findActiveByType(type: TemplateTypeDomain): Promise<TemplateDomainEntity[]>;

  /**
   * Finds all templates with pagination
   */
  findPaged(page: number, limit: number): Promise<{ data: TemplateDomainEntity[]; total: number }>;

  /**
   * Finds a template by ID
   */
  findById(id: number): Promise<TemplateDomainEntity | null>;

  /**
   * Saves a template (create or update)
   */
  save(template: TemplateDomainEntity): Promise<TemplateDomainEntity>;

  /**
   * Deletes a template by ID
   */
  delete(id: number): Promise<boolean>;

  /**
   * Counts templates by type
   */
  countByType(type: TemplateTypeDomain): Promise<number>;

  /**
   * Finds all active receipt templates
   */
  findActiveReceiptTemplates(): Promise<TemplateDomainEntity[]>;

  /**
   * Validates if a template exists and is active
   */
  existsAndIsActive(id: number): Promise<boolean>;
}