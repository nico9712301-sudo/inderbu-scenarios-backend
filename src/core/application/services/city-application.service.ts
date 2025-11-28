import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { ICityRepositoryPort } from '../../domain/ports/outbound/city-repository.port';
import { ICityApplicationPort } from '../ports/inbound/city-application.port';
import { CityEntity } from '../../../infrastructure/persistence/city.entity';
import { DATA_SOURCE } from '../../../infrastructure/tokens/data_sources';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class CityApplicationService implements ICityApplicationPort {
  constructor(
    @Inject(DATA_SOURCE.MYSQL)
    private readonly databaseSource: DataSource,
    @Inject(REPOSITORY_PORTS.CITY)
    private readonly cityRepositoryAdapter: ICityRepositoryPort,
  ) {}

  async getAll() {
    const cityRepository: Repository<CityEntity> =
      this.databaseSource.getRepository(CityEntity);
    return await cityRepository.find();
  }

  async findById(id: number): Promise<any> {
    return this.cityRepositoryAdapter.findById(id);
  }
}
