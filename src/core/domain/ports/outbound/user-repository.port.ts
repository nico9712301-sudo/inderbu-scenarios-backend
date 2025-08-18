import { PageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { UserPageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/user/user-page-options.dto';
import { UserDomainEntity } from 'src/core/domain/entities/user.domain-entity';

export interface IUserRepositoryPort {
  save(domain: UserDomainEntity): Promise<UserDomainEntity>;
  findById(id: number): Promise<UserDomainEntity | null>;
  findByEmail(email: string): Promise<UserDomainEntity | null>;
  findByConfirmationToken(token: string): Promise<UserDomainEntity | null>;

  // Métodos para listar usuarios con filtros avanzados
  findAllPaged(
    pageOptionsDto: UserPageOptionsDto,
  ): Promise<{ users: UserDomainEntity[]; totalItems: number }>;
  findByIdWithRelations(id: number): Promise<UserDomainEntity | null>;
}
