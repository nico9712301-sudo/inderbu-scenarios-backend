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
    // Mapeo estático de UUIDs exactos del dump.sql por sub_scenario_id
    const DUMP_UUIDS = {
      1: '17bb8bc5-fd6e-4f7d-9d25-2bfe60334dc1',
      2: '46195c0a-f48e-41df-9589-6cbdf2b62d99',
      3: '01249eb3-df81-483e-b0d3-d7025fdcc6ad',
      4: '749042da-fa35-446d-9ac5-940a03c2e17c',
      5: '9b52dc30-1475-4cd7-be3f-ebd6cd6bf168',
      6: 'e19e3545-dc7c-49c0-818e-867010d43d9c',
      7: '67cfdb9d-e150-4e9f-98ef-3d87d6e8f7c1',
      8: '11d55ed1-0469-43bc-a1b2-03f3349ccc41',
      9: '767462f3-1383-4b6a-b060-bac72bdd1092',
      10: '072e6867-ffcf-4fa4-8ca9-41c14564fe71',
      11: '5c555839-0957-4ec8-ab5c-fb966a6f560c',
      12: '4efa5166-6026-480a-aa14-0076e85f914d',
      13: '9facf91b-717e-4994-aaea-1b0a3eaae559',
      14: '19a64309-6f27-4c0c-8ea4-2a68ce4616e2',
      15: '58671103-0ef0-4d8d-b1fd-a6b299ad75d6',
      16: 'b25e74b9-fcfa-4bf4-9ebf-9abd566ecda4',
      17: 'c826466c-dabe-4fd1-ab4d-96555eb4f55a',
      18: 'f4f66572-7c46-4fa2-98b7-941fc25809a1',
      19: 'a655c6a3-99fc-4b29-98b7-b25c33e8d4c9',
      20: '913ab6ec-f73b-4a23-af2e-75544438705b',
      21: '08ab47b2-a08e-499e-95fe-b0b894a266e3',
      22: '04ec47a2-7f17-4be8-8eda-48238980aeac',
      23: '34707fbe-47d5-493a-af5a-b7cc63dbe586',
      24: 'd3c3bcb9-5ba1-4e58-a63f-f546e7a21286',
      25: 'c27888b5-2e35-438b-a79d-f5a135b56c28',
      26: 'a24c4b1b-8e12-4c1f-8eba-b36ac6337511',
      27: '863a7510-cb01-4525-8866-443c1351e52b',
      28: 'f9c5cc0d-14d6-4f74-870c-d8229fd3a368',
      29: '7273a6e2-8464-4989-9415-142bf50519c0',
      30: '6643aa74-e3a7-4638-91f7-9fd7572b31f8',
      31: '01302abb-a7f5-4577-8575-38398e30935e',
      32: '7634be0e-fcb7-40d1-8b34-b6b79a773d63',
      33: '7fdaae4c-0c4f-4782-946a-08f5d1fee1ff',
      34: '883f982c-e68e-4e69-921b-da268d2313f9',
      35: 'f7e2aa32-8e86-4e14-a46f-214df3f8f0ca',
      36: '64d4f5bb-da0f-431f-9b8d-e969b7dbb9bc',
      37: 'a51f2b55-d58b-4c25-9d2c-a92b43baecd4',
      38: '86792346-2fb8-431b-a5f7-e3145d8d5e94',
      39: '6ec40987-e061-4559-af58-a7748a2ee8c4',
      40: '1675ac84-b9c9-4c72-aebe-6400a9cc4c21',
      41: '9a505627-2937-4e63-ac9f-e51c7c77a7fb',
      42: '93aa8c40-3e61-4b45-a72f-4f1feaa358b7',
      43: 'da4d6c0a-0d1e-4cd9-93c2-c5fcdd59a734',
      44: '901b4133-361e-4363-add8-b49d54200f2f',
      45: '68e84797-1bde-402a-b96b-8f59097f6fa2',
      46: '16b5df81-256a-4786-9ba1-3644ef1257bc',
      47: '01e5a510-40f9-4ee0-b1c7-65ae2e37f99a',
      48: '668233fa-26d0-4499-818f-025116120968',
      49: '9882e43b-6d36-4b73-8874-d7d86d431a0b',
      50: 'e9ff0c34-cfc6-4519-88f1-a1459178f26b',
      51: '95332d1b-bb37-429b-94af-f9cf1784082b',
      52: 'f7a3d597-27d7-40d3-8a53-f2483eeee38a',
      53: '0bade542-e9b5-4f67-97d2-e87f6006452c',
      54: 'dc23adc2-fe1a-464c-9db4-cab9f0d9d958',
      55: 'f85ce536-92b5-48aa-a4e6-91a751244e50',
      56: '7596cda2-e0c5-4243-96ee-2af8005ccaa5',
      57: 'a238abec-25ec-4362-b090-50833ebedfff',
      58: 'fddeec92-9b60-4bd6-8e59-907272425497',
      59: 'c546cd1f-607a-4199-9197-6214e2166d5e',
      60: 'a0975bdb-cd20-448d-b1a8-9cdbcb530a5d',
      61: '0b19c3a7-4643-4de4-9f26-705bc1577c22',
      62: '9f6ad190-8a2a-4b5c-a2ed-8d547a5636d7',
      63: 'aa0cd630-0204-4dd4-84db-6f0388162e47',
      64: 'f5c9cdd0-3e9d-449c-9611-59249185a9da',
      65: '33e5820d-5ee1-44f6-a22b-82891d9a3c3e',
      66: '69c32767-c621-40e5-8a74-63f387ae7b55',
      67: '32107dfd-f63b-43fd-9ceb-b747a06f42bf',
      68: '44a6a0a9-2f18-4697-b1cf-78f1820c9396',
      69: '9471934b-0243-4934-be3e-d92cc94fb731',
      70: '80bd7de8-361e-4593-9230-f1e7caa2c56c',
      71: '6d008a7e-4bb3-4518-9bf6-d93f9951197d',
      72: '6c5ab5f5-23f3-4f97-82f4-48a912065510',
      73: '0b4a62c1-d986-4c31-9862-ba6614f970b1',
      74: '38356bdf-8077-418d-b8fb-10309ab94649',
      75: '51299bb9-233f-4f90-8f4b-cd8f21b7e7fc',
      76: '2e613048-3545-4577-b6fc-8fffe853e593',
      77: '7011d132-9787-4024-a74e-544c6706518b',
      78: '4781c65a-74cf-4d87-8409-e3496560b043',
      79: 'f6b600e9-f170-4685-83d1-fa08288aac94',
      80: '0f59ef30-d993-4985-920e-590b34dfd22f',
      81: '224364bb-42b8-4b40-935a-a926560874f5',
    };

    const path_folder = 'sub-scenarios/';
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
          // Usar UUID exacto del dump.sql según sub_scenario_id
          const uuid = DUMP_UUIDS[subScenario.id];
          if (!uuid) {
            this.logger.error(
              `UUID no encontrado para sub_scenario_id: ${subScenario.id}`,
            );
            continue;
          }
          subScenarioImage.path =
            path_folder + uuid + '.' + imageData.imageExtension;
          subScenarioImage.current = true; // 🆕 Todas las imágenes de seed son actuales
          subScenarioImage.subScenario = subScenario;

          entities.push(subScenarioImage);

          this.logger.log(
            `Creando imagen ${uuid}.${imageData.imageExtension} para sub-escenario ${seed.name} (isFeature: ${imageData.isFeature}, order: ${subScenarioImage.displayOrder})`,
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
