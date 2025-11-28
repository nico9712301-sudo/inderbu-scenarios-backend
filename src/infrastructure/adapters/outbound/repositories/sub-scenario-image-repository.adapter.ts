import { Inject, Injectable } from '@nestjs/common';
import { Repository, In, Not } from 'typeorm';

import { SubScenarioImageEntity } from '../../../persistence/image.entity';
import { ISubScenarioImageRepositoryPort } from '../../../../core/domain/ports/outbound/sub-scenario-image-repository.port';
import { SubScenarioImageDomainEntity } from '../../../../core/domain/entities/sub-scenario-image.domain-entity';
import { SubScenarioImageEntityMapper } from '../../../mappers/images/image-entity.mapper';

@Injectable()
export class SubScenarioImageRepositoryAdapter
  implements ISubScenarioImageRepositoryPort
{
  constructor(
    @Inject(SubScenarioImageEntity)
    private readonly repository: Repository<SubScenarioImageEntity>,
  ) {}

  async save(
    image: SubScenarioImageDomainEntity,
  ): Promise<SubScenarioImageDomainEntity> {
    const entityToSave = SubScenarioImageEntityMapper.toPersistence(image);

    if (image.isFeature) {
      // Si es una imagen principal, asegurarse de que no haya otras imágenes principales
      await this.repository.update(
        { subScenario: { id: image.subScenarioId }, isFeature: true },
        { isFeature: false },
      );
    }

    const savedEntity = await this.repository.save(entityToSave);
    return SubScenarioImageEntityMapper.toDomain(savedEntity);
  }

  async findBySubScenarioId(
    subScenarioId: number,
    includeHistorical: boolean = false,
  ): Promise<SubScenarioImageDomainEntity[]> {
    try {
      const where: any = { subScenario: { id: subScenarioId } };

      // Por defecto, solo traer imágenes actuales (current: true)
      if (!includeHistorical) {
        where.current = true;
      }

      const entities = await this.repository.find({
        where,
        relations: ['subScenario'],
        order: { isFeature: 'DESC', displayOrder: 'ASC' },
      });
      return entities.map((entity) =>
        SubScenarioImageEntityMapper.toDomain(entity),
      );
    } catch (error) {
      console.error(
        'Error fetching images for subScenarioId:',
        subScenarioId,
        error,
      );
      return []; // Retornar un array vacío en caso de error
    }
  }

  async findBySubScenarioIds(
    subScenarioIds: number[],
    includeHistorical: boolean = false,
  ): Promise<SubScenarioImageDomainEntity[]> {
    try {
      console.log(
        `Buscando imágenes para ${subScenarioIds.length} sub-escenarios: ${subScenarioIds.join(', ')}`,
      );

      if (subScenarioIds.length === 0) {
        return [];
      }

      const where: any = { subScenario: { id: In(subScenarioIds) } };

      // Por defecto, solo traer imágenes actuales (current: true)
      if (!includeHistorical) {
        where.current = true;
      }

      const entities: SubScenarioImageEntity[] = await this.repository.find({
        where,
        relations: ['subScenario'],
        order: { isFeature: 'DESC', displayOrder: 'ASC' },
      });

      // Agrupar imágenes por subScenarioId para depuración
      const imagesBySubScenario = {};
      entities.forEach((entity) => {
        const subScenarioId = entity.subScenario?.id;
        if (subScenarioId) {
          if (!imagesBySubScenario[subScenarioId]) {
            imagesBySubScenario[subScenarioId] = [];
          }
          imagesBySubScenario[subScenarioId].push(entity.id);
        }
      });

      const entitiesMapped: SubScenarioImageDomainEntity[] = entities.map(
        SubScenarioImageEntityMapper.toDomain,
      );
      return entitiesMapped;
    } catch (error) {
      console.error(
        'Error fetching images for multiple subScenarioIds:',
        subScenarioIds,
        error,
      );
      return []; // Retornar un array vacío en caso de error
    }
  }

  async findById(id: number): Promise<SubScenarioImageDomainEntity | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id },
        relations: ['subScenario'],
      });
      return entity ? SubScenarioImageEntityMapper.toDomain(entity) : null;
    } catch (error) {
      console.error('Error fetching image by id:', id, error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }

  async updateOrderAndFeature(
    images: SubScenarioImageDomainEntity[],
  ): Promise<SubScenarioImageDomainEntity[]> {
    const updatedImages: SubScenarioImageDomainEntity[] = [];

    for (const image of images) {
      if (!image.id) continue;

      await this.repository.update(
        { id: image.id },
        {
          isFeature: image.isFeature,
          displayOrder: image.displayOrder,
        },
      );

      const updatedEntity = await this.repository.findOne({
        where: { id: image.id },
      });

      if (updatedEntity) {
        updatedImages.push(
          SubScenarioImageEntityMapper.toDomain(updatedEntity),
        );
      }
    }

    return updatedImages;
  }

  async markAsHistorical(
    subScenarioId: number,
    exceptIds?: number[],
  ): Promise<void> {
    const where: any = { subScenario: { id: subScenarioId } };

    // Si se proporcionan IDs a excluir, agregar condición NOT IN
    if (exceptIds && exceptIds.length > 0) {
      where.id = Not(In(exceptIds));
    }

    await this.repository.update(where, { current: false });
  }

  async markAsHistoricalByPosition(
    subScenarioId: number,
    isFeature: boolean,
    displayOrder: number,
  ): Promise<void> {
    // Solo marcar como históricas las imágenes que ocupan la misma posición
    const where = {
      subScenario: { id: subScenarioId },
      isFeature,
      displayOrder,
      current: true,
    };

    await this.repository.update(where, { current: false });
  }
}
