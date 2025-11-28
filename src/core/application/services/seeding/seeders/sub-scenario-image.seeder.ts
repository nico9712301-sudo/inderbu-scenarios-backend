import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { SubScenarioEntity } from '../../../../../infrastructure/persistence/sub-scenario.entity';
import { SubScenarioImageEntity } from '../../../../../infrastructure/persistence/image.entity';
import { ISubScenarioSeed } from '../interfaces/sub-scenario-seed.interface';
import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubScenarioImageSeeder
  extends AbstractSeeder<SubScenarioImageEntity, ISubScenarioSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.SUB_SCENARIO_IMAGE)
    repository: Repository<SubScenarioImageEntity>,
    @Inject(MYSQL_REPOSITORY.SUB_SCENARIO)
    private subScenarioRepository: Repository<SubScenarioEntity>,
    private readonly configService: ConfigService,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected getSeeds(): Promise<ISubScenarioSeed[]> {
    return Promise.resolve(
      this.jsonLoader.load<ISubScenarioSeed>('sub-scenario-seeds.json'),
    );
  }

  protected async transform(
    seeds: ISubScenarioSeed[],
  ): Promise<SubScenarioImageEntity[]> {
    // const bucket_host = this.configService.get<string>('BUCKET_HOST');
    const path_folder = '/temp/images/sub-scenarios/';

    const entities: SubScenarioImageEntity[] = [];
    for (const seed of seeds) {
      //Buscar el subscenario relacionado
      const subScenario = await this.subScenarioRepository.findOneBy({
        name: seed.name,
      });
      if (!subScenario) {
        this.logger.warn(`Sub-escenario ${seed.name} no encontrado.`);
        continue;
      }

      // Procesar todas las imágenes del sub-escenario (no solo la primera)
      if (seed.images && seed.images.length > 0) {
        for (let index = 0; index < seed.images.length; index++) {
          const imageData = seed.images[index];

          // Create the entity properly
          const subScenarioImage: SubScenarioImageEntity =
            new SubScenarioImageEntity();
          subScenarioImage.isFeature = imageData.isFeature;
          // Featured images have displayOrder 0, additional images start from 1
          subScenarioImage.displayOrder = imageData.isFeature ? 0 : index;
          subScenarioImage.path =
            path_folder + imageData.imageName + '.' + imageData.imageExtension;
          subScenarioImage.current = true; // 🆕 Todas las imágenes de seed son actuales
          subScenarioImage.subScenario = subScenario;

          entities.push(subScenarioImage);

          this.logger.log(
            `Creando imagen ${imageData.imageName} para sub-escenario ${seed.name} (isFeature: ${imageData.isFeature}, order: ${subScenarioImage.displayOrder})`,
          );
        }
      } else {
        this.logger.warn(
          `Sub-escenario ${seed.name} no tiene imágenes definidas.`,
        );
      }
    }
    return entities;
  }
}
