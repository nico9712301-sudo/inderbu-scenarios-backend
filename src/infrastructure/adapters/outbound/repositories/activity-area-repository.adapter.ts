import { Inject, Injectable } from '@nestjs/common';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { PageOptionsDto } from '../../inbound/http/dtos/common/page-options.dto';

import { ActivityAreaEntityMapper } from 'src/infrastructure/mappers/activity-area/activity-area-entity.mapper';
import { IActivityAreaRepositoryPort } from 'src/core/domain/ports/outbound/activity-area-repository.port';
import { ActivityAreaDomainEntity } from 'src/core/domain/entities/activity-area.domain-entity';
import { ActivityAreaEntity } from 'src/infrastructure/persistence/activity-area.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { SearchQueryHelper } from './common/search-query.helper';

@Injectable()
export class ActivityAreaRepositoryAdapter
  implements IActivityAreaRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.ACTIVITY_AREA)
    private readonly repository: Repository<ActivityAreaEntity>,
  ) {}

  async findById(id: number) {
    const e = await this.repository.findOne({ where: { id } });
    return e ? ActivityAreaEntityMapper.toDomain(e) : null;
  }

  async findByIds(ids: number[]) {
    if (!ids.length) return [];
    const list = await this.repository.findBy({ id: In(ids) });
    return list.map(ActivityAreaEntityMapper.toDomain);
  }

  async save(d: ActivityAreaDomainEntity): Promise<ActivityAreaDomainEntity> {
    const entity = ActivityAreaEntityMapper.toEntity(d);
    const savedEntity = await this.repository.save(entity);
    return ActivityAreaEntityMapper.toDomain(savedEntity);
  }

  async findAll(): Promise<ActivityAreaDomainEntity[]> {
    const list = await this.repository.find({ order: { name: 'ASC' } });
    return list.map(ActivityAreaEntityMapper.toDomain);
  }

  async findPaged(opts: PageOptionsDto): Promise<{ data: ActivityAreaDomainEntity[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search
    } = opts;

    const qb: SelectQueryBuilder<ActivityAreaEntity> = this.repository
      .createQueryBuilder('aa');

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
    qb.addOrderBy('aa.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();
    return { data: entities.map(ActivityAreaEntityMapper.toDomain), total };
  }

  /**
   * Aplica búsqueda LIKE para términos cortos - solo en el nombre del área de actividad
   * @private
   */
  private applyLikeSearch(qb: SelectQueryBuilder<ActivityAreaEntity>, term: string): void {
    const { prefix, contains } = SearchQueryHelper.generateLikePatterns(term);

    qb.addSelect(
      `(
        (aa.name LIKE :pref)*1 + (aa.name LIKE :any)*0.5
      )`,
      'score',
    ).andWhere(`aa.name LIKE :any`, { pref: prefix, any: contains });

    qb.addSelect('LOCATE(:loc, aa.name)', 'pos')
      .setParameter('loc', term)
      .orderBy('score', 'DESC')
      .addOrderBy('pos', 'ASC');
  }

  /**
   * Aplica búsqueda FULLTEXT para términos largos - solo en el nombre del área de actividad
   * @private
   */
  private applyFulltextSearch(qb: SelectQueryBuilder<ActivityAreaEntity>, term: string): void {
    const sanitizedTerm = SearchQueryHelper.sanitizeSearchTerm(term);
    
    if (!SearchQueryHelper.isValidForFulltext(sanitizedTerm)) {
      console.log(`ActivityAreaRepo: Fallback to LIKE search. Original: "${term}", Sanitized: "${sanitizedTerm}"`);
      this.applyLikeSearch(qb, term);
      return;
    }

    console.log(`ActivityAreaRepo: Using FULLTEXT search. Original: "${term}", Sanitized: "${sanitizedTerm}"`);

    qb.addSelect(`(MATCH(aa.name) AGAINST (:q IN BOOLEAN MODE))`, 'score')
      .andWhere(`MATCH(aa.name) AGAINST (:q IN BOOLEAN MODE)`, {
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
