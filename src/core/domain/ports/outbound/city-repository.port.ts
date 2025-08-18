import { CityDomainEntity } from '../../entities/city.domain-entity';

export interface ICityRepositoryPort {
  findById(id: number): Promise<CityDomainEntity | null>;
}
