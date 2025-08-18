import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { HomeSlideEntity as PersistenceHomeSlideEntity, SlideType } from 'src/infrastructure/persistence/home-slide.entity';
import { ModuleEntity } from 'src/infrastructure/persistence/module.entity';
import { EntityEntity } from 'src/infrastructure/persistence/entity.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { IHomeSlideSeed } from '../interfaces/home-slide-seed.interface';
import { DATA_LOADER } from 'src/infrastructure/tokens/data-loader';
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

  protected async getSeeds(): Promise<IHomeSlideSeed[]> {
    return this.jsonLoader.load<IHomeSlideSeed>('home-slide-seeds.json');
  }

  protected async transform(seeds: IHomeSlideSeed[]): Promise<PersistenceHomeSlideEntity[]> {
    const entities: PersistenceHomeSlideEntity[] = [];
    for (const seed of seeds) {
      const slideType = seed.slideType === 'banner' ? SlideType.BANNER : SlideType.PLACEHOLDER;
      
      let module: ModuleEntity | null = null;
      let entity: EntityEntity | null = null;

      // Para banners, buscar el módulo
      if (slideType === SlideType.BANNER && seed.moduleName) {
        module = await this.moduleRepository.findOneBy({
          name: seed.moduleName,
        });
        if (!module) {
          this.logger.warn(`Module ${seed.moduleName} not found for slide ${seed.title}.`);
          continue;
        }
      }

      // Para placeholders, buscar la entidad
      if (slideType === SlideType.PLACEHOLDER && seed.entityType) {
        entity = await this.entityRepository.findOneBy({
          type: seed.entityType,
        });
        if (!entity) {
          this.logger.warn(`Entity ${seed.entityType} not found for slide ${seed.title}.`);
          continue;
        }
      }

      entities.push(
        this.repository.create({
          title: seed.title,
          description: seed.description,
          imageUrl: seed.imageUrl,
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