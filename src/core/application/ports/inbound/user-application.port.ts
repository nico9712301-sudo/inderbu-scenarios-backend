import { UserDomainEntity } from '../../../domain/entities/user.domain-entity';
import { CreateUserDto } from '../../../../infrastructure/adapters/inbound/http/dtos/user/create-user-request.dto';
import { UpdateUserDto } from '../../../../infrastructure/adapters/inbound/http/dtos/user/update-user.dto';
import { UserPageOptionsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/user/user-page-options.dto';
import { PageDto } from '../../../../infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { UserWithRelationsDto } from '../../../../infrastructure/adapters/inbound/http/dtos/user/user-with-relations.dto';

export interface IUserApplicationPort {
  createUser(createUserDto: CreateUserDto): Promise<UserDomainEntity>;
  updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithRelationsDto>;
  findByEmail(email: string): Promise<UserDomainEntity | null>;
  findById(id: number): Promise<UserDomainEntity | null>; // Añadido para auth service
  confirmUser(token: string): Promise<{ message: string }>;
  resendConfirmation(email: string): Promise<{ message: string }>;

  // Métodos para listar usuarios con filtros avanzados
  getAllUsers(
    pageOptionsDto: UserPageOptionsDto,
  ): Promise<PageDto<UserWithRelationsDto>>;
  getUserById(id: number): Promise<UserWithRelationsDto>;
}
