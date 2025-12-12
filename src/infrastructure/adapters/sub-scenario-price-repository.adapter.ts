import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ISubScenarioPriceRepositoryPort } from '../../core/domain/ports/outbound/sub-scenario-price-repository.port';
import { SubScenarioPriceDomainEntity } from '../../core/domain/entities/sub-scenario-price.domain-entity';
import { SubScenarioPriceEntity } from '../persistence/sub-scenario-price.entity';
import { SubScenarioPriceEntityMapper } from '../mappers/sub-scenario-price/sub-scenario-price-entity.mapper';
import { MYSQL_REPOSITORY } from '../tokens/repositories';

@Injectable()
export class SubScenarioPriceRepositoryAdapter implements ISubScenarioPriceRepositoryPort {
  constructor(
    @Inject(MYSQL_REPOSITORY.SUB_SCENARIO_PRICE)
    private readonly subScenarioPriceRepository: Repository<SubScenarioPriceEntity>,
  ) {}

  async findBySubScenarioId(subScenarioId: number): Promise<SubScenarioPriceDomainEntity | null> {
    const entity = await this.subScenarioPriceRepository.findOne({
      where: { fkSubScenarioId: subScenarioId },
    });

    return entity ? SubScenarioPriceEntityMapper.toDomain(entity) : null;
  }

  async findPaged(page: number, limit: number): Promise<{ data: SubScenarioPriceDomainEntity[]; total: number }> {
    const [entities, total] = await this.subScenarioPriceRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: SubScenarioPriceEntityMapper.toDomainArray(entities),
      total,
    };
  }

  async findById(id: number): Promise<SubScenarioPriceDomainEntity | null> {
    const entity = await this.subScenarioPriceRepository.findOne({
      where: { id },
    });

    return entity ? SubScenarioPriceEntityMapper.toDomain(entity) : null;
  }

  async save(price: SubScenarioPriceDomainEntity): Promise<SubScenarioPriceDomainEntity> {
    const entity = SubScenarioPriceEntityMapper.toEntity(price);
    const savedEntity = await this.subScenarioPriceRepository.save(entity);
    return SubScenarioPriceEntityMapper.toDomain(savedEntity);
  }

  async deleteBySubScenarioId(subScenarioId: number): Promise<boolean> {
    const result = await this.subScenarioPriceRepository.delete({
      fkSubScenarioId: subScenarioId,
    });
    return (result.affected ?? 0) > 0;
  }

  async hasPrice(subScenarioId: number): Promise<boolean> {
    const count = await this.subScenarioPriceRepository.count({
      where: { fkSubScenarioId: subScenarioId },
    });

    return count > 0;
  }

  async findAllWithPrices(): Promise<SubScenarioPriceDomainEntity[]> {
    const entities = await this.subScenarioPriceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return SubScenarioPriceEntityMapper.toDomainArray(entities);
  }

  async updateHourlyPrice(subScenarioId: number, newPrice: number): Promise<SubScenarioPriceDomainEntity | null> {
    const entity = await this.subScenarioPriceRepository.findOne({
      where: { fkSubScenarioId: subScenarioId },
    });

    if (!entity) {
      return null;
    }

    entity.hourlyPrice = newPrice;
    entity.updatedAt = new Date();

    const savedEntity = await this.subScenarioPriceRepository.save(entity);
    return SubScenarioPriceEntityMapper.toDomain(savedEntity);
  }
}