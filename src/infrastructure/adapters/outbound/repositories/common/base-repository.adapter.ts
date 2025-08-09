import { FindOptionsWhere, Repository } from 'typeorm';

export interface BaseEntity {
  id?: number;
}
export abstract class BaseRepositoryAdapter<Entity extends BaseEntity, Domain> {
  constructor(
    protected readonly repository: Repository<Entity>,
    protected readonly relations: string[] = [], // Lista de relaciones opcional
  ) { }

  async save(domain: Domain): Promise<Domain> {
    const entity = this.toEntity(domain);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async findById(id: number): Promise<Domain | null> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<Entity>,
      relations: this.relations,
    });
    if (!entity) {
      return null;
    }
    return this.toDomain(entity);
  }

  protected abstract toEntity(domain: Domain): Entity;
  protected abstract toDomain(entity: Entity): Domain;
}
