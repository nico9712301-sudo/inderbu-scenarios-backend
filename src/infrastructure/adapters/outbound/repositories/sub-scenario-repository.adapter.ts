import { Injectable, Inject } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { SubScenarioEntityMapper } from '../../../mappers/sub-scenario/sub-scenario-entity.mapper';
import { ISubScenarioRepositoryPort } from '../../../../core/domain/ports/outbound/sub-scenario-repository.port';
import { SubScenarioDomainEntity } from '../../../../core/domain/entities/sub-scenario.domain-entity';
import { SubScenarioEntity } from '../../../persistence/sub-scenario.entity';
import { SubScenarioPageOptionsDto } from '../../inbound/http/dtos/sub-scenarios/sub-scenario-page-options.dto';
import { MYSQL_REPOSITORY } from '../../../tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';
import { SearchQueryHelper } from './common/search-query.helper';

@Injectable()
export class SubScenarioRepositoryAdapter
  extends BaseRepositoryAdapter<SubScenarioEntity, SubScenarioDomainEntity>
  implements ISubScenarioRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.SUB_SCENARIO)
    repository: Repository<SubScenarioEntity>,
  ) {
    super(repository, ['scenario', 'activityArea', 'fieldSurfaceType']);
  }

  protected toEntity(domain: SubScenarioDomainEntity): SubScenarioEntity {
    return SubScenarioEntityMapper.toEntity(domain);
  }

  protected toDomain(entity: SubScenarioEntity): SubScenarioDomainEntity {
    return SubScenarioEntityMapper.toDomain(entity);
  }

  async findAll(): Promise<SubScenarioDomainEntity[]> {
    const entities = await this.repository.find({
      relations: ['scenario', 'activityArea', 'fieldSurfaceType'],
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: number): Promise<SubScenarioDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(
    domainEntity: SubScenarioDomainEntity,
  ): Promise<SubScenarioDomainEntity> {
    const entity = this.toEntity(domainEntity);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }

  async findByIdWithRelations(
    id: number,
  ): Promise<SubScenarioDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: [
        'scenario',
        'scenario.neighborhood',
        'activityArea',
        'fieldSurfaceType',
      ],
    });
    return entity ? this.toDomain(entity) : null;
  }

  /** Lista paginada + búsqueda ponderada */
  async findPaged(opts: SubScenarioPageOptionsDto) {
    const {
      page = 1,
      limit = 20,
      search,
      scenarioId,
      activityAreaId,
      neighborhoodId,
      hasCost,
      active,
    } = opts;

    const qb: SelectQueryBuilder<SubScenarioEntity> = this.repository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.scenario', 'sc')
      .leftJoinAndSelect('sc.neighborhood', 'n')
      .leftJoinAndSelect('s.activityArea', 'aa')
      .leftJoinAndSelect('s.fieldSurfaceType', 'fs');

    /* ───── filtros ───── */
    if (scenarioId) qb.andWhere('sc.id = :scenarioId', { scenarioId });
    if (activityAreaId)
      qb.andWhere('aa.id = :activityAreaId', { activityAreaId });
    if (neighborhoodId)
      qb.andWhere('n.id = :neighborhoodId', { neighborhoodId });
    if (typeof hasCost === 'boolean')
      qb.andWhere('s.hasCost = :hasCost', { hasCost });
    if (typeof active === 'boolean')
      qb.andWhere('s.active = :active', { active });

    /* ───── búsqueda ───── */
    if (search?.trim()) {
      const term = search.trim();

      if (SearchQueryHelper.shouldUseLikeSearch(term)) {
        this.applyLikeSearch(qb, term);
      } else {
        this.applyFulltextSearch(qb, term);
      }
    }

    /* ───── orden secundario + paginación ───── */
    if (!search?.trim()) {
      qb.orderBy('s.createdAt', 'DESC').addOrderBy('s.name', 'ASC');
    } else {
      qb.addOrderBy('s.createdAt', 'DESC').addOrderBy('s.name', 'ASC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      data: entities.map((entity) => SubScenarioEntityMapper.toDomain(entity)),
      total,
    };
  }

  /**
   * Aplica búsqueda LIKE para términos cortos
   * @private
   */
  private applyLikeSearch(
    qb: SelectQueryBuilder<SubScenarioEntity>,
    term: string,
  ): void {
    const { prefix, contains } = SearchQueryHelper.generateLikePatterns(term);

    qb.addSelect(
      `(
        (s.name LIKE :pref)*1 + (s.name LIKE :any)*0.5 +
        (sc.name LIKE :pref)*0.75 + (sc.name LIKE :any)*0.375 +
        (aa.name LIKE :pref)*0.50 + (aa.name LIKE :any)*0.25 +
        (fs.name LIKE :pref)*0.25 + (fs.name LIKE :any)*0.125
      )`,
      'score',
    ).andWhere(
      `(
        s.name LIKE :any OR sc.name LIKE :any OR 
        aa.name LIKE :any OR fs.name LIKE :any
      )`,
      { pref: prefix, any: contains },
    );

    qb.addSelect('LOCATE(:loc, s.name)', 'pos')
      .setParameter('loc', term)
      .orderBy('score', 'DESC')
      .addOrderBy('pos', 'ASC');
  }

  /**
   * Aplica búsqueda FULLTEXT para términos largos
   * @private
   */
  private applyFulltextSearch(
    qb: SelectQueryBuilder<SubScenarioEntity>,
    term: string,
  ): void {
    const sanitizedTerm = SearchQueryHelper.sanitizeSearchTerm(term);

    if (!SearchQueryHelper.isValidForFulltext(sanitizedTerm)) {
      // Fallback a LIKE si el término sanitizado no es válido
      console.log(
        `Fallback to LIKE search. Original: "${term}", Sanitized: "${sanitizedTerm}"`,
      );
      this.applyLikeSearch(qb, term);
      return;
    }

    console.log(
      `Using FULLTEXT search. Original: "${term}", Sanitized: "${sanitizedTerm}"`,
    );

    qb.addSelect(
      `(
        (MATCH(s.name) AGAINST (:q IN BOOLEAN MODE))*1 +
        (MATCH(sc.name) AGAINST (:q IN BOOLEAN MODE))*0.75 +
        (MATCH(aa.name) AGAINST (:q IN BOOLEAN MODE))*0.50 +
        (MATCH(fs.name) AGAINST (:q IN BOOLEAN MODE))*0.25
      )`,
      'score',
    )
      .andWhere(
        `(
        MATCH(s.name) AGAINST (:q IN BOOLEAN MODE) OR
        MATCH(sc.name) AGAINST (:q IN BOOLEAN MODE) OR
        MATCH(aa.name) AGAINST (:q IN BOOLEAN MODE) OR
        MATCH(fs.name) AGAINST (:q IN BOOLEAN MODE)
      )`,
        { q: sanitizedTerm },
      )
      .orderBy('score', 'DESC');
  }
}
