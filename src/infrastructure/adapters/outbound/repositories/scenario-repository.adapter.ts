import { Injectable, Inject } from '@nestjs/common';
import { Repository, In, SelectQueryBuilder } from 'typeorm';
import { PageOptionsDto } from '../../inbound/http/dtos/common/page-options.dto';

import { IScenarioRepositoryPort } from 'src/core/domain/ports/outbound/scenario-repository.port';
import { ScenarioEntityMapper } from 'src/infrastructure/mappers/scenario/scenario-entity.mapper';
import { ScenarioDomainEntity } from 'src/core/domain/entities/scenario.domain-entity';
import { ScenarioEntity } from 'src/infrastructure/persistence/scenario.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { BaseRepositoryAdapter } from './common/base-repository.adapter';

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

    console.log('Active filter:', active);

    if (active !== undefined) {
      qb.andWhere('s.is_active = :active', { active });
    }

    /* ───── BÚSQUEDA POR TEXTO EN NOMBRE DE ESCENARIO ───── */
    if (search?.trim()) {
      const term = search.trim();
      const isTiny = term.length < 4;

      if (isTiny) {
        /* LIKE prefijo + contiene - SOLO EN SCENARIO NAME */
        const likeAny = `%${term}%`;
        const likePref = `${term}%`;

        qb.addSelect(
          `
        (
          (s.name LIKE :pref)*1 + (s.name LIKE :any)*0.5
        )`,
          'score',
        ).andWhere(`s.name LIKE :any`, { pref: likePref, any: likeAny });

        /* posición de la coincidencia en s.name */
        qb.addSelect('LOCATE(:loc, s.name)', 'pos')
          .setParameter('loc', term)
          .orderBy('score', 'DESC')
          .addOrderBy('pos', 'ASC');
      } else {
        /* FULLTEXT BOOLEAN MODE - SOLO EN SCENARIO NAME */
        const boolean = term
          .split(/\s+/)
          .map((w) => `+${w}*`)
          .join(' ');

        qb.addSelect(`(MATCH(s.name) AGAINST (:q IN BOOLEAN MODE))`, 'score')
          .andWhere(`MATCH(s.name) AGAINST (:q IN BOOLEAN MODE)`, {
            q: boolean,
          })
          .orderBy('score', 'DESC');
      }
    }

    /* ───── orden secundario + paginación ───── */
    qb.addOrderBy('s.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();
    console.log({ entities });
    return { data: entities.map(this.toDomain), total };
  }

  // MÉTODO DELETE IMPLEMENTADO
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }
}
