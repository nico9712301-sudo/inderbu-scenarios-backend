import { Injectable, Inject } from '@nestjs/common';
import {
  TemplateManagementApplicationPort,
  CreateTemplateCommand,
  UpdateTemplateCommand,
} from '../ports/inbound/template-management-application.port';
import { ITemplateRepositoryPort } from '../../domain/ports/outbound/template-repository.port';
import { TemplateDomainEntity, TemplateTypeDomain } from '../../domain/entities/template.domain-entity';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class TemplateManagementApplicationService implements TemplateManagementApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.TEMPLATE)
    private readonly templateRepository: ITemplateRepositoryPort,
  ) {}

  async createTemplate(command: CreateTemplateCommand): Promise<TemplateDomainEntity> {
    // Validate template content
    const contentValidation = await this.validateTemplateContent(command.content);
    if (!contentValidation.isValid) {
      throw new Error(contentValidation.reason);
    }

    const template = TemplateDomainEntity.builder()
      .withName(command.name)
      .withType(command.type)
      .withContent(command.content)
      .withIsActive(command.active ?? true)
      .build();

    return await this.templateRepository.save(template);
  }

  async updateTemplate(id: number, command: UpdateTemplateCommand): Promise<TemplateDomainEntity> {
    const existingTemplate = await this.templateRepository.findById(id);
    if (!existingTemplate) {
      throw new Error('Plantilla no encontrada');
    }

    // Validate content if provided
    if (command.content) {
      const contentValidation = await this.validateTemplateContent(command.content);
      if (!contentValidation.isValid) {
        throw new Error(contentValidation.reason);
      }
    }

    const updatedTemplate = TemplateDomainEntity.builder()
      .withId(existingTemplate.id)
      .withName(command.name ?? existingTemplate.name)
      .withType(existingTemplate.type)
      .withContent(command.content ?? existingTemplate.content)
      .withIsActive(command.active ?? existingTemplate.isActive)
      .withCreatedAt(existingTemplate.createdAt)
      .build();

    return await this.templateRepository.save(updatedTemplate);
  }

  async getTemplateById(id: number): Promise<TemplateDomainEntity | null> {
    return await this.templateRepository.findById(id);
  }

  async getAllTemplates(page: number = 1, limit: number = 10): Promise<{ data: TemplateDomainEntity[]; total: number }> {
    return await this.templateRepository.findPaged(page, limit);
  }

  async getActiveTemplatesByType(type: TemplateTypeDomain): Promise<TemplateDomainEntity[]> {
    return await this.templateRepository.findActiveByType(type);
  }

  async getActiveReceiptTemplates(): Promise<TemplateDomainEntity[]> {
    return await this.templateRepository.findActiveReceiptTemplates();
  }

  async validateTemplateContent(content: string): Promise<{ isValid: boolean; reason?: string }> {
    try {
      const parsed = JSON.parse(content);

      if (!parsed || typeof parsed !== 'object') {
        return { isValid: false, reason: 'El contenido debe ser un objeto JSON válido' };
      }

      if (!parsed.components || !Array.isArray(parsed.components)) {
        return { isValid: false, reason: 'El contenido debe tener una propiedad "components" que sea un array' };
      }

      if (parsed.components.length === 0) {
        return { isValid: false, reason: 'La plantilla debe tener al menos un componente' };
      }

      // Validate each component has required properties
      for (const component of parsed.components) {
        if (!component.type) {
          return { isValid: false, reason: 'Todos los componentes deben tener una propiedad "type"' };
        }
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: 'Formato JSON inválido: ' + error.message };
    }
  }

  async isTemplateActiveAndExists(id: number): Promise<boolean> {
    return await this.templateRepository.existsAndIsActive(id);
  }

  async countTemplatesByType(type: TemplateTypeDomain): Promise<number> {
    return await this.templateRepository.countByType(type);
  }

  async activateTemplate(id: number): Promise<TemplateDomainEntity> {
    return await this.updateTemplate(id, { active: true });
  }

  async deactivateTemplate(id: number): Promise<TemplateDomainEntity> {
    return await this.updateTemplate(id, { active: false });
  }

  async deleteTemplate(id: number): Promise<boolean> {
    // Check if template is being used by any receipts
    // Check if template is being used - placeholder implementation
    const usageCount = 0; // await this.templateRepository.countByTemplateId?.(id) || 0;
    if (usageCount > 0) {
      throw new Error('No se puede eliminar la plantilla porque está siendo utilizada en recibos generados');
    }

    return await this.templateRepository.delete(id);
  }

  async duplicateTemplate(id: number, newName: string): Promise<TemplateDomainEntity> {
    const originalTemplate = await this.templateRepository.findById(id);
    if (!originalTemplate) {
      throw new Error('Plantilla original no encontrada');
    }

    const duplicateTemplate = TemplateDomainEntity.builder()
      .withName(newName)
      .withType(originalTemplate.type)
      .withContent(originalTemplate.content)
      .withIsActive(false) // Start as inactive
      .build();

    return await this.templateRepository.save(duplicateTemplate);
  }

  async getTemplateStatistics(): Promise<{
    totalTemplates: number;
    totalActive: number;
    totalByType: Record<TemplateTypeDomain, number>;
    mostUsedTemplate: { id: number; name: string; usageCount: number } | null;
  }> {
    // Placeholder implementation - would need aggregate queries
    const allTemplates = await this.templateRepository.findPaged(1, 1000);
    const totalTemplates = allTemplates.total;
    const totalActive = allTemplates.data.filter(t => t.isActive).length;

    const totalByType: Record<TemplateTypeDomain, number> = {
      [TemplateTypeDomain.RECEIPT]: await this.templateRepository.countByType(TemplateTypeDomain.RECEIPT),
      [TemplateTypeDomain.INVOICE]: await this.templateRepository.countByType(TemplateTypeDomain.INVOICE),
      [TemplateTypeDomain.EMAIL]: await this.templateRepository.countByType(TemplateTypeDomain.EMAIL),
    };

    return {
      totalTemplates,
      totalActive,
      totalByType,
      mostUsedTemplate: null, // Would require usage tracking
    };
  }
}