import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ITemplateRepositoryPort } from '../../core/domain/ports/outbound/template-repository.port';
import { TemplateDomainEntity, TemplateTypeDomain } from '../../core/domain/entities/template.domain-entity';
import { TemplateEntity } from '../persistence/template.entity';
import { TemplateEntityMapper } from '../mappers/template/template-entity.mapper';
import { MYSQL_REPOSITORY } from '../tokens/repositories';

@Injectable()
export class TemplateRepositoryAdapter implements ITemplateRepositoryPort {
  constructor(
    @Inject(MYSQL_REPOSITORY.TEMPLATE)
    private readonly templateRepository: Repository<TemplateEntity>,
  ) {}

  async findActiveByType(type: TemplateTypeDomain): Promise<TemplateDomainEntity[]> {
    const entities = await this.templateRepository.find({
      where: {
        type: type as any,
        isActive: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return TemplateEntityMapper.toDomainArray(entities);
  }

  async findPaged(page: number, limit: number): Promise<{ data: TemplateDomainEntity[]; total: number }> {
    const [entities, total] = await this.templateRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: TemplateEntityMapper.toDomainArray(entities),
      total,
    };
  }

  async findById(id: number): Promise<TemplateDomainEntity | null> {
    const entity = await this.templateRepository.findOne({
      where: { id },
    });

    return entity ? TemplateEntityMapper.toDomain(entity) : null;
  }

  async save(template: TemplateDomainEntity): Promise<TemplateDomainEntity> {
    const entity = TemplateEntityMapper.toEntity(template);
    const savedEntity = await this.templateRepository.save(entity);
    return TemplateEntityMapper.toDomain(savedEntity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.templateRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async countByType(type: TemplateTypeDomain): Promise<number> {
    return await this.templateRepository.count({
      where: {
        type: type as any,
      },
    });
  }

  async findActiveReceiptTemplates(): Promise<TemplateDomainEntity[]> {
    return await this.findActiveByType(TemplateTypeDomain.RECEIPT);
  }

  async existsAndIsActive(id: number): Promise<boolean> {
    const count = await this.templateRepository.count({
      where: {
        id,
        isActive: true,
      },
    });

    return count > 0;
  }

  async searchActiveReceiptTemplatesByName(searchTerm: string): Promise<TemplateDomainEntity[]> {
    const entities = await this.templateRepository
      .createQueryBuilder('template')
      .where('template.type = :type', { type: 'receipt' })
      .andWhere('template.isActive = :isActive', { isActive: true })
      .andWhere('template.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('template.createdAt', 'DESC')
      .getMany();

    return TemplateEntityMapper.toDomainArray(entities);
  }
}