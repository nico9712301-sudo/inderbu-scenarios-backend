import { TemplateDomainEntity, TemplateTypeDomain } from '../../../domain/entities/template.domain-entity';

export interface CreateTemplateCommand {
  name: string;
  type: TemplateTypeDomain;
  content: string;
  description?: string;
  active?: boolean;
}

export interface UpdateTemplateCommand {
  name?: string;
  content?: string;
  description?: string;
  active?: boolean;
}

export interface TemplateManagementApplicationPort {
  /**
   * Creates a new template
   */
  createTemplate(command: CreateTemplateCommand): Promise<TemplateDomainEntity>;

  /**
   * Updates an existing template
   */
  updateTemplate(id: number, command: UpdateTemplateCommand): Promise<TemplateDomainEntity>;

  /**
   * Gets template by ID
   */
  getTemplateById(id: number): Promise<TemplateDomainEntity | null>;

  /**
   * Gets all templates with pagination
   */
  getAllTemplates(page?: number, limit?: number): Promise<{ data: TemplateDomainEntity[]; total: number }>;

  /**
   * Gets active templates by type
   */
  getActiveTemplatesByType(type: TemplateTypeDomain): Promise<TemplateDomainEntity[]>;

  /**
   * Gets all active receipt templates
   */
  getActiveReceiptTemplates(): Promise<TemplateDomainEntity[]>;

  /**
   * Validates template content
   */
  validateTemplateContent(content: string): Promise<{ isValid: boolean; reason?: string }>;

  /**
   * Checks if template exists and is active
   */
  isTemplateActiveAndExists(id: number): Promise<boolean>;

  /**
   * Counts templates by type
   */
  countTemplatesByType(type: TemplateTypeDomain): Promise<number>;

  /**
   * Activates a template
   */
  activateTemplate(id: number): Promise<TemplateDomainEntity>;

  /**
   * Deactivates a template
   */
  deactivateTemplate(id: number): Promise<TemplateDomainEntity>;

  /**
   * Deletes a template
   */
  deleteTemplate(id: number): Promise<boolean>;

  /**
   * Duplicates a template
   */
  duplicateTemplate(id: number, newName: string): Promise<TemplateDomainEntity>;

  /**
   * Gets template statistics
   */
  getTemplateStatistics(): Promise<{
    totalTemplates: number;
    totalActive: number;
    totalByType: Record<TemplateTypeDomain, number>;
    mostUsedTemplate: { id: number; name: string; usageCount: number } | null;
  }>;

  /**
   * Searches active receipt templates by name
   */
  searchActiveReceiptTemplatesByName(searchTerm: string): Promise<TemplateDomainEntity[]>;
}