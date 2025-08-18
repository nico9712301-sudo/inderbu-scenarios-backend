import { CommuneEntity } from 'src/infrastructure/persistence/commune.entity';
import { CityEntity } from 'src/infrastructure/persistence/city.entity';
import { CommuneDomainEntity } from 'src/core/domain/entities/commune.domain-entity';
import { CityDomainEntity } from 'src/core/domain/entities/city.domain-entity';

export class CommuneEntityMapper {
  static toDomain(e: CommuneEntity): CommuneDomainEntity {
    const builder = CommuneDomainEntity.builder().withId(e.id).withName(e.name);

    if (e.city) {
      const cityDomain = CityDomainEntity.builder()
        .withId(e.city.id)
        .withName(e.city.name)
        .build();

      builder.withCity(cityDomain).withCityId(e.city.id);
    }

    return builder.build();
  }

  static toEntity(d: CommuneDomainEntity): CommuneEntity {
    const e = new CommuneEntity();
    if (d.id != null) {
      e.id = d.id;
    }
    e.name = d.name;

    // Crear entidad de ciudad solo con el ID para la relación
    if (d.cityId) {
      const cityEntity = new CityEntity();
      cityEntity.id = d.cityId;
      e.city = cityEntity;
    }

    return e;
  }
}
