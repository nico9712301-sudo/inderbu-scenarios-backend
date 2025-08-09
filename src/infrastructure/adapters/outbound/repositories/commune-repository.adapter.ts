import { Injectable, Inject } from '@nestjs/common';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { PageOptionsDto } from '../../inbound/http/dtos/common/page-options.dto';

import { CommuneEntityMapper } from 'src/infrastructure/mappers/commune/commune-entity.mapper';
import { ICommuneRepositoryPort } from 'src/core/domain/ports/outbound/commune-repository.port';
import { CommuneDomainEntity } from 'src/core/domain/entities/commune.domain-entity';
import { CommuneEntity } from '../../../persistence/commune.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';
import { SearchQueryHelper } from './common/search-query.helper';

@Injectable()
export class CommuneRepositoryAdapter
  extends BaseRepositoryAdapter<CommuneEntity, CommuneDomainEntity>
  implements ICommuneRepositoryPort
{
  constructor(
    @Inject(MYSQL_REPOSITORY.COMMUNE)
    communeRepository: Repository<CommuneEntity>,
  ) {
    super(communeRepository, ['city']);
  }

  protected toDomain(entity: CommuneEntity): CommuneDomainEntity {
    return CommuneEntityMapper.toDomain(entity);
  }

  protected toEntity(domain: CommuneDomainEntity): CommuneEntity {
    return CommuneEntityMapper.toEntity(domain);
  }

  async deleteById(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<CommuneDomainEntity[]> {
    const list = await this.repository.find({ 
      relations: ['city'],
      order: { name: 'ASC' } 
    });
    return list.map(CommuneEntityMapper.toDomain);
  }

  async findByIds(ids: number[]): Promise<CommuneDomainEntity[]> {
    if (!ids.length) return [];
    const list = await this.repository.find({
      where: { id: In(ids) },
      relations: ['city'] // Cargar relaciones
    });
    return list.map(CommuneEntityMapper.toDomain);
  }

  async findPaged(opts: PageOptionsDto): Promise<{ data: CommuneDomainEntity[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search
    } = opts;

    const qb: SelectQueryBuilder<CommuneEntity> = this.repository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.city', 'city'); // JOIN con city

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
    qb.addOrderBy('c.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();
    return { data: entities.map(CommuneEntityMapper.toDomain), total };
  }

  /**
   * Aplica búsqueda LIKE para términos cortos - solo en el nombre de la comuna
   * @private
   */
  private applyLikeSearch(qb: SelectQueryBuilder<CommuneEntity>, term: string): void {
    const { prefix, contains } = SearchQueryHelper.generateLikePatterns(term);

    qb.addSelect(
      `(
        (c.name LIKE :pref)*1 + (c.name LIKE :any)*0.5
      )`,
      'score',
    ).andWhere(`c.name LIKE :any`, { pref: prefix, any: contains });

    qb.addSelect('LOCATE(:loc, c.name)', 'pos')
      .setParameter('loc', term)
      .orderBy('score', 'DESC')
      .addOrderBy('pos', 'ASC');
  }

  /**
   * Aplica búsqueda FULLTEXT para términos largos - solo en el nombre de la comuna
   * @private
   */
  private applyFulltextSearch(qb: SelectQueryBuilder<CommuneEntity>, term: string): void {
    const sanitizedTerm = SearchQueryHelper.sanitizeSearchTerm(term);
    
    if (!SearchQueryHelper.isValidForFulltext(sanitizedTerm)) {
      console.log(`CommuneRepo: Fallback to LIKE search. Original: "${term}", Sanitized: "${sanitizedTerm}"`);
      this.applyLikeSearch(qb, term);
      return;
    }

    console.log(`CommuneRepo: Using FULLTEXT search. Original: "${term}", Sanitized: "${sanitizedTerm}"`);

    qb.addSelect(`(MATCH(c.name) AGAINST (:q IN BOOLEAN MODE))`, 'score')
      .andWhere(`MATCH(c.name) AGAINST (:q IN BOOLEAN MODE)`, {
        q: sanitizedTerm,
      })
      .orderBy('score', 'DESC');
  }
}
