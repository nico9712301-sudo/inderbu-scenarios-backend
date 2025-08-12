import { Injectable, Inject } from '@nestjs/common';
import { Repository, In, SelectQueryBuilder } from 'typeorm';
import { PageOptionsDto } from '../../inbound/http/dtos/common/page-options.dto';

import { IScenarioRepositoryPort } from 'src/core/domain/ports/outbound/scenario-repository.port';
import { ScenarioEntityMapper } from 'src/infrastructure/mappers/scenario/scenario-entity.mapper';
import { ScenarioDomainEntity } from 'src/core/domain/entities/scenario.domain-entity';
import { ScenarioEntity } from 'src/infrastructure/persistence/scenario.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';
import { SearchQueryHelper } from './common/search-query.helper';

@Injectable()
export class ScenarioRepositoryAdapter
  extends BaseRepositoryAdapter<ScenarioEntity, ScenarioDomainEntity>
  implements IScenarioRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.SCENARIO)
    repo: Repository<ScenarioEntity>,
  ) {
    super(repo);
  }

  protected toDomain(e: ScenarioEntity): ScenarioDomainEntity {
    return ScenarioEntityMapper.toDomain(e);
  }
  protected toEntity(d: ScenarioDomainEntity): ScenarioEntity {
    return ScenarioEntityMapper.toEntity(d);
  }

  async findByIds(ids: number[]): Promise<ScenarioDomainEntity[]> {
    const entities = await this.repository.find({
      where: { id: In(ids) },
      relations: ['neighborhood'],
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<ScenarioDomainEntity[]> {
    const entities = await this.repository.find({
      relations: ['neighborhood'],
      order: { name: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findPaged(
    opts: PageOptionsDto,
  ): Promise<{ data: ScenarioDomainEntity[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      activityAreaId,
      neighborhoodId,
      userId,
      scenarioId,
      active,
    } = opts;

    const qb: SelectQueryBuilder<ScenarioEntity> = this.repository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.neighborhood', 'n');

    /* ───── FILTROS EXACTOS ───── */
    if (neighborhoodId) {
      qb.andWhere('n.id = :neighborhoodId', { neighborhoodId });
    }

    if (activityAreaId) {
      qb.andWhere('s.activityAreaId = :activityAreaId', { activityAreaId });
    }

    if (userId) {
      qb.andWhere('s.userId = :userId', { userId });
    }

    if (scenarioId) {
      qb.andWhere('s.id = :scenarioId', { scenarioId });
    }

    if (active !== undefined) {
      qb.andWhere('s.is_active = :active', { active });
    }

    /* ───── BÚSQUEDA POR TEXTO EN NOMBRE DE ESCENARIO ───── */
    if (search?.trim()) {
      const term = search.trim();
      
      if (SearchQueryHelper.shouldUseLikeSearch(term)) {
        this.applyLikeSearch(qb, term);
      } else {
        this.applyFulltextSearch(qb, term);
      }
    }

    /* ───── orden secundario + paginación ───── */
    qb.addOrderBy('s.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();
    return { data: entities.map(this.toDomain), total };
  }

  /**
   * Aplica búsqueda LIKE para términos cortos - solo en el nombre del escenario
   * @private
   */
  private applyLikeSearch(qb: SelectQueryBuilder<ScenarioEntity>, term: string): void {
    const { prefix, contains } = SearchQueryHelper.generateLikePatterns(term);

    qb.addSelect(
      `(
        (s.name LIKE :pref)*1 + (s.name LIKE :any)*0.5
      )`,
      'score',
    ).andWhere(`s.name LIKE :any`, { pref: prefix, any: contains });

    /* posición de la coincidencia en s.name */
    qb.addSelect('LOCATE(:loc, s.name)', 'pos')
      .setParameter('loc', term)
      .orderBy('score', 'DESC')
      .addOrderBy('pos', 'ASC');
  }

  /**
   * Aplica búsqueda FULLTEXT para términos largos - solo en el nombre del escenario
   * @private
   */
  private applyFulltextSearch(qb: SelectQueryBuilder<ScenarioEntity>, term: string): void {
    const sanitizedTerm = SearchQueryHelper.sanitizeSearchTerm(term);
    
    if (!SearchQueryHelper.isValidForFulltext(sanitizedTerm)) {
      // Fallback a LIKE si el término sanitizado no es válido
      console.log(`ScenarioRepo: Fallback to LIKE search. Original: "${term}", Sanitized: "${sanitizedTerm}"`);
      this.applyLikeSearch(qb, term);
      return;
    }

    console.log(`ScenarioRepo: Using FULLTEXT search. Original: "${term}", Sanitized: "${sanitizedTerm}"`);

    qb.addSelect(`(MATCH(s.name) AGAINST (:q IN BOOLEAN MODE))`, 'score')
      .andWhere(`MATCH(s.name) AGAINST (:q IN BOOLEAN MODE)`, {
        q: sanitizedTerm,
      })
      .orderBy('score', 'DESC');
  }

  // MÉTODO DELETE IMPLEMENTADO
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }
}
