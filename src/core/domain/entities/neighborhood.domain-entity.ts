import { Expose, Type } from 'class-transformer';
import { CommuneDomainEntity } from './commune.domain-entity';

export class NeighborhoodDomainEntity {
  @Expose()
  public readonly id: number | null;

  @Expose()
  public readonly name: string;

  @Expose()
  public readonly communeId: number;

  @Expose()
  @Type(() => CommuneDomainEntity)
  public readonly commune?: CommuneDomainEntity;

  constructor(builder: NeighborhoodDomainBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.communeId = builder.communeId;
    this.commune = builder.commune;
  }

  static builder(): NeighborhoodDomainBuilder {
    return new NeighborhoodDomainBuilder();
  }
}

export class NeighborhoodDomainBuilder {
  id: number | null = null;
  name: string = '';
  communeId: number = 0;
  commune?: CommuneDomainEntity;

  withId(id: number): NeighborhoodDomainBuilder {
    this.id = id;
    return this;
  }

  withName(name: string): NeighborhoodDomainBuilder {
    this.name = name;
    return this;
  }

  withCommuneId(communeId: number): NeighborhoodDomainBuilder {
    this.communeId = communeId;
    return this;
  }

  withCommune(commune: CommuneDomainEntity): NeighborhoodDomainBuilder {
    this.commune = commune;
    return this;
  }

  build(): NeighborhoodDomainEntity {
    return new NeighborhoodDomainEntity(this);
  }
}
