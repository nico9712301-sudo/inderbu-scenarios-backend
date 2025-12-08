import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import {
  HomeSlideEntity as PersistenceHomeSlideEntity,
  SlideType,
} from '../../../../../infrastructure/persistence/home-slide.entity';
import { ModuleEntity } from '../../../../../infrastructure/persistence/module.entity';
import { EntityEntity } from '../../../../../infrastructure/persistence/entity.entity';
import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { IHomeSlideSeed } from '../interfaces/home-slide-seed.interface';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class HomeSlideSeeder
  extends AbstractSeeder<PersistenceHomeSlideEntity, IHomeSlideSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.HOME_SLIDE)
    repository: Repository<PersistenceHomeSlideEntity>,
    @Inject(MYSQL_REPOSITORY.MODULE)
    private moduleRepository: Repository<ModuleEntity>,
    @Inject(MYSQL_REPOSITORY.ENTITY)
    private entityRepository: Repository<EntityEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected getSeeds(): Promise<IHomeSlideSeed[]> {
    return Promise.resolve(
      this.jsonLoader.load<IHomeSlideSeed>('home-slide-seeds.json'),
    );
  }

  protected async transform(
    seeds: IHomeSlideSeed[],
  ): Promise<PersistenceHomeSlideEntity[]> {
    // Mapeo estático de UUIDs exactos del dump.sql para home_slides por display_order
    const DUMP_HOME_SLIDE_UUIDS = {
      1: 'ba9f7f21-41e2-48d2-842b-0ed349001af6.jpg',
      2: 'd29f4ccd-d58d-46d4-bc1c-3ce3cda5c492.jpg',
      3: 'c2adb1da-2ed7-4526-8871-0e090d2b2e59.jpg',
      4: '6e833c6a-2f0d-42bc-92be-fc69a699200a.jpg',
      5: 'd1a529c1-54a4-4503-bae3-b22b7c9fa094.jpg',
    };

    const entities: PersistenceHomeSlideEntity[] = [];
    for (const seed of seeds) {
      const slideType =
        seed.slideType === 'banner' ? SlideType.BANNER : SlideType.PLACEHOLDER;

      let module: ModuleEntity | null = null;
      let entity: EntityEntity | null = null;

      // Para banners, buscar el módulo
      if (slideType === SlideType.BANNER && seed.moduleName) {
        module = await this.moduleRepository.findOneBy({
          name: seed.moduleName,
        });
        if (!module) {
          this.logger.warn(
            `Module ${seed.moduleName} not found for slide ${seed.title}.`,
          );
          continue;
        }
      }

      // Para placeholders, buscar la entidad
      if (slideType === SlideType.PLACEHOLDER && seed.entity) {
        entity = await this.entityRepository.findOneBy({
          name: seed.entity,
        });
        if (!entity) {
          this.logger.warn(
            `Entity ${seed.entity} not found for slide ${seed.title}.`,
          );
          continue;
        }
      }

      // Usar UUID exacto del dump.sql según displayOrder
      const uuidFilename = DUMP_HOME_SLIDE_UUIDS[seed.displayOrder];
      if (!uuidFilename) {
        this.logger.error(
          `UUID no encontrado para home slide displayOrder: ${seed.displayOrder}`,
        );
        continue;
      }

      // Construir URL con el UUID exacto del dump
      const imageUrl = `home/${uuidFilename}`;

      this.logger.log(
        `Creating home slide: "${seed.title}" with UUID: ${uuidFilename}`,
      );

      entities.push(
        this.repository.create({
          title: seed.title,
          description: seed.description,
          imageUrl: imageUrl,
          displayOrder: seed.displayOrder,
          isActive: seed.isActive,
          slideType: slideType,
          module,
          entity,
        }),
      );
    }
    return entities;
  }
}
