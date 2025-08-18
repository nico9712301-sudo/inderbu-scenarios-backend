import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MenuItemEntity } from 'src/infrastructure/persistence/menu-item.entity';
import { ModuleEntity } from 'src/infrastructure/persistence/module.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { IMenuItemSeed } from '../interfaces/menu-item-seed.interface';
import { DATA_LOADER } from 'src/infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class MenuItemSeeder
  extends AbstractSeeder<MenuItemEntity, IMenuItemSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.MENU_ITEM)
    repository: Repository<MenuItemEntity>,
    @Inject(MYSQL_REPOSITORY.MODULE)
    private moduleRepository: Repository<ModuleEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected async getSeeds(): Promise<IMenuItemSeed[]> {
    return this.jsonLoader.load<IMenuItemSeed>('menu-item-seeds.json');
  }

  protected async transform(seeds: IMenuItemSeed[]): Promise<MenuItemEntity[]> {
    const entities: MenuItemEntity[] = [];
    for (const seed of seeds) {
      const module = await this.moduleRepository.findOneBy({
        name: seed.moduleName,
      });
      if (!module) {
        this.logger.warn(`Module ${seed.moduleName} not found.`);
        continue;
      }
      entities.push(
        this.repository.create({
          path: seed.pathName,
          module,
          fk_menu_item: seed.fk_menu_item,
        }),
      );
    }
    return entities;
  }
}