import { Injectable, Inject } from '@nestjs/common';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { PageOptionsDto } from '../../inbound/http/dtos/common/page-options.dto';

import { NeighborhoodEntityMapper } from '../../../mappers/neighborhood/neighborhood-entity.mapper';
import { INeighborhoodRepositoryPort } from '../../../../core/domain/ports/outbound/neighborhood-repository.port';
import { NeighborhoodDomainEntity } from '../../../../core/domain/entities/neighborhood.domain-entity';
import { NeighborhoodEntity } from '../../../persistence/neighborhood.entity';
import { MYSQL_REPOSITORY } from '../../../tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';
import { SearchQueryHelper } from './common/search-query.helper';

@Injectable()
export class NeighborhoodRepositoryAdapter
  extends BaseRepositoryAdapter<NeighborhoodEntity, NeighborhoodDomainEntity>
  implements INeighborhoodRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.NEIGHBORHOOD)
    repo: Repository<NeighborhoodEntity>,
  ) {
    super(repo, ['commune']);
  }

  protected toDomain(entity: NeighborhoodEntity): NeighborhoodDomainEntity {
    return NeighborhoodEntityMapper.toDomain(entity);
  }

  protected toEntity(domain: NeighborhoodDomainEntity): NeighborhoodEntity {
    return NeighborhoodEntityMapper.toEntity(domain);
  }

  async deleteById(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<NeighborhoodDomainEntity[]> {
    const list = await this.repository.find({
      relations: ['commune', 'commune.city'], // Cargar relaciones
      order: { name: 'ASC' },
    });
    return list.map((item) => NeighborhoodEntityMapper.toDomain(item));
  }

  async findByIds(ids: number[]): Promise<NeighborhoodDomainEntity[]> {
    if (!ids.length) return [];
    const list = await this.repository.find({
      where: { id: In(ids) },
      relations: ['commune', 'commune.city'], // Cargar relaciones
    });
    return list.map((item) => NeighborhoodEntityMapper.toDomain(item));
  }

  async findPaged(
    opts: PageOptionsDto,
  ): Promise<{ data: NeighborhoodDomainEntity[]; total: number }> {
    const { page = 1, limit = 20, search } = opts;

    const qb: SelectQueryBuilder<NeighborhoodEntity> = this.repository
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.commune', 'commune') // JOIN con commune
      .leftJoinAndSelect('commune.city', 'city'); // JOIN con city

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
    qb.addOrderBy('n.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();
    return {
      data: entities.map((entity) => NeighborhoodEntityMapper.toDomain(entity)),
      total,
    };
  }

  /**
   * Aplica búsqueda LIKE para términos cortos - solo en el nombre del barrio
   * @private
   */
  private applyLikeSearch(
    qb: SelectQueryBuilder<NeighborhoodEntity>,
    term: string,
  ): void {
    const { prefix, contains } = SearchQueryHelper.generateLikePatterns(term);

    qb.addSelect(
      `(
        (n.name LIKE :pref)*1 + (n.name LIKE :any)*0.5
      )`,
      'score',
    ).andWhere(`n.name LIKE :any`, { pref: prefix, any: contains });

    qb.addSelect('LOCATE(:loc, n.name)', 'pos')
      .setParameter('loc', term)
      .orderBy('score', 'DESC')
      .addOrderBy('pos', 'ASC');
  }

  /**
   * Aplica búsqueda FULLTEXT para términos largos - solo en el nombre del barrio
   * @private
   */
  private applyFulltextSearch(
    qb: SelectQueryBuilder<NeighborhoodEntity>,
    term: string,
  ): void {
    const sanitizedTerm = SearchQueryHelper.sanitizeSearchTerm(term);

    if (!SearchQueryHelper.isValidForFulltext(sanitizedTerm)) {
      console.log(
        `NeighborhoodRepo: Fallback to LIKE search. Original: "${term}", Sanitized: "${sanitizedTerm}"`,
      );
      this.applyLikeSearch(qb, term);
      return;
    }

    console.log(
      `NeighborhoodRepo: Using FULLTEXT search. Original: "${term}", Sanitized: "${sanitizedTerm}"`,
    );

    qb.addSelect(`(MATCH(n.name) AGAINST (:q IN BOOLEAN MODE))`, 'score')
      .andWhere(`MATCH(n.name) AGAINST (:q IN BOOLEAN MODE)`, {
        q: sanitizedTerm,
      })
      .orderBy('score', 'DESC');
  }
}
