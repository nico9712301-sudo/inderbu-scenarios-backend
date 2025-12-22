import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { CommuneEntity } from '../../../../../infrastructure/persistence/commune.entity';
import { MYSQL_REPOSITORY } from '../../../../../infrastructure/tokens/repositories';
import { CityEntity } from '../../../../../infrastructure/persistence/city.entity';
import { ICommuneSeed } from '../interfaces/commune-seed.interface';
import { DATA_LOADER } from '../../../../../infrastructure/tokens/data-loader';
import { IDataLoader } from '../interfaces/data-loader.interface';
import { ISeeder } from '../interfaces/seeder.interface';
import { AbstractSeeder } from './abstract.seeder';

@Injectable()
export class CommuneSeeder
  extends AbstractSeeder<CommuneEntity, ICommuneSeed>
  implements ISeeder
{
  constructor(
    @Inject(MYSQL_REPOSITORY.COMMUNE)
    repository: Repository<CommuneEntity>,
    @Inject(MYSQL_REPOSITORY.CITY)
    private cityRepository: Repository<CityEntity>,
    @Inject(DATA_LOADER.JSON)
    protected jsonLoader: IDataLoader,
  ) {
    super(repository);
  }

  async seed(): Promise<void> {
    // Verificar si ya hay comunas sembradas
    const existingCount = await this.repository.count();
    const seeds = await this.getSeeds();
    
    if (existingCount === 0) {
      // Si no hay comunas, usar el comportamiento normal del AbstractSeeder
      const entities = await this.transform(seeds);
      await this.repository.save(entities);
      this.logger.log(`${entities.length} comunas sembradas.`);
    } else {
      // Si ya hay comunas, solo actualizar las que tengan nombres vacíos
      const communesToUpdate: CommuneEntity[] = [];
      const allExistingCommunes = await this.repository.find({
        relations: ['city']
      });
      
      for (let i = 0; i < seeds.length && i < allExistingCommunes.length; i++) {
        const seed = seeds[i];
        const existingCommune = allExistingCommunes[i];
        
        // Solo actualizar si el nombre está vacío o es null
        if (existingCommune && (!existingCommune.name || existingCommune.name.trim() === '')) {
          existingCommune.name = seed.name;
          communesToUpdate.push(existingCommune);
          this.logger.debug(`Actualizando nombre de comuna ID ${existingCommune.id}: "${seed.name}"`);
        }
      }
      
      if (communesToUpdate.length > 0) {
        await this.repository.save(communesToUpdate);
        this.logger.log(`${communesToUpdate.length} comunas actualizadas con nombres.`);
      } else {
        this.logger.log('Todas las comunas ya tienen nombres correctos. No se requiere actualización.');
      }
    }
  }

  protected async alreadySeeded(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  protected getSeeds(): Promise<ICommuneSeed[]> {
    return Promise.resolve(
      this.jsonLoader.load<ICommuneSeed>('commune-seeds.json'),
    );
  }

  protected async transform(seeds: ICommuneSeed[]): Promise<CommuneEntity[]> {
    const entities: CommuneEntity[] = [];
    for (const seed of seeds) {
      const city = await this.cityRepository.findOneBy({ name: seed.cityName });
      if (!city) {
        this.logger.warn(`Ciudad ${seed.cityName} no encontrada.`);
        continue;
      }
      const entity = this.repository.create({ 
        name: seed.name, 
        city: city 
      });
      this.logger.debug(`Creando comuna: ${entity.name} para ciudad: ${city.name}`);
      entities.push(entity);
    }
    return entities;
  }
}
