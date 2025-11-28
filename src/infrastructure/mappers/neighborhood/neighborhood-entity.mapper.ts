// src/infrastructure/mappers/neighborhood/neighborhood-entity.mapper.ts
import { NeighborhoodEntity } from '../../persistence/neighborhood.entity';
import { CommuneEntity } from '../../persistence/commune.entity';
import { NeighborhoodDomainEntity } from '../../../core/domain/entities/neighborhood.domain-entity';
import { CommuneDomainEntity } from '../../../core/domain/entities/commune.domain-entity';
import { CityDomainEntity } from '../../../core/domain/entities/city.domain-entity';

export class NeighborhoodEntityMapper {
  static toDomain(e: NeighborhoodEntity): NeighborhoodDomainEntity {
    const builder = NeighborhoodDomainEntity.builder()
      .withId(e.id)
      .withName(e.name);

    if (e.commune) {
      // Mapear commune directamente para evitar dependencia circular
      const communeBuilder = CommuneDomainEntity.builder()
        .withId(e.commune.id)
        .withName(e.commune.name);

      if (e.commune.city) {
        const cityDomain = CityDomainEntity.builder()
          .withId(e.commune.city.id)
          .withName(e.commune.city.name)
          .build();
        communeBuilder.withCity(cityDomain).withCityId(e.commune.city.id);
      }

      const communeDomain = communeBuilder.build();
      builder.withCommune(communeDomain).withCommuneId(e.commune.id);
    }

    return builder.build();
  }

  static toEntity(d: NeighborhoodDomainEntity): NeighborhoodEntity {
    const e = new NeighborhoodEntity();
    if (d.id != null) {
      e.id = d.id;
    }
    e.name = d.name;

    // Crear entidad de comuna solo con el ID para la relación
    if (d.communeId) {
      const communeEntity = new CommuneEntity();
      communeEntity.id = d.communeId;
      e.commune = communeEntity;
    }

    return e;
  }
}
