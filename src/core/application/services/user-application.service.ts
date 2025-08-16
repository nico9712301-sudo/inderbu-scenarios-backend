import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

import {
  PageDto,
  PageMetaDto,
} from 'src/infrastructure/adapters/inbound/http/dtos/common/page.dto';
import { UserWithRelationsDto } from 'src/infrastructure/adapters/inbound/http/dtos/user/user-with-relations.dto';
import { CreateUserDto } from 'src/infrastructure/adapters/inbound/http/dtos/user/create-user-request.dto';
import { PageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page-options.dto';
import { INotificationService } from 'src/core/application/ports/outbound/notification-service.port';
import { IUserApplicationPort } from 'src/core/application/ports/inbound/user-application.port';
import { IUserRepositoryPort } from 'src/core/domain/ports/outbound/user-repository.port';
import { UserResponseMapper } from 'src/infrastructure/mappers/user/user-response.mapper';
import { UserDomainEntity } from 'src/core/domain/entities/user.domain-entity';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';

@Injectable()
export class UserApplicationService implements IUserApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.USER)
    private readonly userRepository: IUserRepositoryPort,
    @Inject(APPLICATION_PORTS.NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  /** Crea el usuario y emite mail de confirmación */
  async createUser(dto: CreateUserDto): Promise<UserDomainEntity> {
    const exists = await this.userRepository.findByEmail(dto.email);
    if (exists)
      throw new ConflictException('El correo electrónico ya está registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    // construimos dominio sin token
    const base = UserDomainEntity.builder()
      .withDni(dto.dni)
      .withFirstName(dto.firstName)
      .withLastName(dto.lastName)
      .withEmail(dto.email)
      .withPhone(dto.phone)
      .withPasswordHash(hash)
      .withRoleId(dto.roleId)
      .withAddress(dto.address)
      .withNeighborhoodId(dto.neighborhoodId);

    // emitimos confirmación
    return this.issueConfirmation(base.build());
  }

  /** Reenvía token de confirmación a un email existente */
  async resendConfirmation(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.active)
      throw new ConflictException('La cuenta ya está activada');

    await this.issueConfirmation(user);
    return { message: 'Enlace de confirmación reenviado con éxito' };
  }

  /** Valida el token y activa la cuenta */
  async confirmUser(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByConfirmationToken(token);
    if (!user) throw new NotFoundException('Token inválido');
    if (
      !user['confirmationTokenExpiresAt'] ||
      user['confirmationTokenExpiresAt'] < new Date()
    ) {
      throw new BadRequestException('El token ha expirado');
    }

    // reusamos builder para activar
    const activated = UserDomainEntity.builder()
      .withId(user.id!)
      .withDni(user.dni)
      .withFirstName(user.firstName)
      .withLastName(user.lastName)
      .withEmail(user.email)
      .withPhone(user.phone)
      .withPasswordHash(user['passwordHash'])
      .withRoleId(user.roleId)
      .withAddress(user.address)
      .withNeighborhoodId(user.neighborhoodId)
      .withActive(true)
      .withConfirmationToken('')
      .withConfirmationTokenExpiresAt(null as unknown as Date)
      .build();

    await this.userRepository.save(activated);
    return { message: 'Cuenta activada con éxito' };
  }

  async findByEmail(email: string): Promise<UserDomainEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<UserDomainEntity | null> {
    return this.userRepository.findById(id);
  }

  // Nuevos métodos para listado de usuarios
  async getAllUsers(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<UserWithRelationsDto>> {
    const { users, totalItems } =
      await this.userRepository.findAllPaged(pageOptionsDto);

    const data = users.map((user) =>
      UserResponseMapper.toDtoWithRelations(user),
    );
    const meta = new PageMetaDto({
      page: pageOptionsDto.page,
      limit: pageOptionsDto.limit,
      totalItems,
    });

    return new PageDto(data, meta);
  }

  async getUsersByRole(
    roleId: number,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<UserWithRelationsDto>> {
    const { users, totalItems } = await this.userRepository.findByRole(
      roleId,
      pageOptionsDto,
    );

    const data = users.map((user) =>
      UserResponseMapper.toDtoWithRelations(user),
    );
    const meta = new PageMetaDto({
      page: pageOptionsDto.page,
      limit: pageOptionsDto.limit,
      totalItems,
    });

    return new PageDto(data, meta);
  }

  async getUserById(id: number): Promise<UserWithRelationsDto> {
    const user = await this.userRepository.findByIdWithRelations(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return UserResponseMapper.toDtoWithRelations(user);
  }

  /**
   * PRIVADO: genera nuevo token + expiración, guarda y envía el correo
   */
  private async issueConfirmation(
    user: UserDomainEntity,
  ): Promise<UserDomainEntity> {
    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const withToken = UserDomainEntity.builder()
      .withId(user.id ?? null)
      .withDni(user.dni)
      .withFirstName(user.firstName)
      .withLastName(user.lastName)
      .withEmail(user.email)
      .withPhone(user.phone)
      .withPasswordHash((user as any).passwordHash)
      .withRoleId(user.roleId)
      .withAddress(user.address)
      .withNeighborhoodId(user.neighborhoodId)
      .withActive(false)
      .withConfirmationToken(token)
      .withConfirmationTokenExpiresAt(expires)
      .build();

    const saved = await this.userRepository.save(withToken);
    await this.notificationService.sendAccountConfirmation(saved.email, token);
    return saved;
  }
}
