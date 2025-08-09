import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { FieldSurfaceTypeEntity } from 'src/infrastructure/persistence/field-surface-type.entity';
import { ActivityAreaEntity } from 'src/infrastructure/persistence/activity-area.entity';
import { SubScenarioEntity } from 'src/infrastructure/persistence/sub-scenario.entity';
import { SubScenarioImageEntity } from 'src/infrastructure/persistence/image.entity';
import { ScenarioEntity } from 'src/infrastructure/persistence/scenario.entity';
import { ISubScenarioSeed } from '../interfaces/sub-scenario-seed.interface';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';
import { DATA_LOADER } from 'src/infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';
import { ENV_CONFIG } from 'src/infrastructure/config/env.constants';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class SubScenarioImageSeeder
    extends AbstractSeeder<SubScenarioImageEntity, ISubScenarioSeed>
    implements ISeeder {
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

    protected async getSeeds(): Promise<ISubScenarioSeed[]> {
        return this.jsonLoader.load<ISubScenarioSeed>('sub-scenario-seeds.json');
    }

    protected async transform(
        seeds: ISubScenarioSeed[],
    ): Promise<SubScenarioImageEntity[]> {
        const bucket_host = this.configService.get<string>('BUCKET_HOST');        
        const path_folder = bucket_host + "/temp/images/sub-scenarios/"
        
        const entities: SubScenarioImageEntity[] = [];
        for (const seed of seeds) {
            //Buscar el subscenario relacionado
            const subScenario = await this.subScenarioRepository.findOneBy({
                name: seed.name,
            });
            if (!subScenario) {
                this.logger.warn(`Escenario ${seed.scenarioName} no encontrado.`);
                continue;
            }

            // Create the entity properly
            const subScenarioImage: SubScenarioImageEntity = new SubScenarioImageEntity();
            subScenarioImage.isFeature = seed.images?.[0]?.isFeature ?? false;
            subScenarioImage.displayOrder = 1;
            subScenarioImage.path = path_folder + seed.images?.[0]?.imageName + "." + seed.images?.[0]?.imageExtension;

            entities.push(subScenarioImage);
        }
        return entities;
    }
}
