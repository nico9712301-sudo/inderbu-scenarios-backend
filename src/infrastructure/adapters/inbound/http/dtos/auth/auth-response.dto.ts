import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';
import { UserDomainEntity } from '../../../../../../core/domain/entities/user.domain-entity';

export class AuthTokensDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token de renovación',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;
}

export class UserDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Documento de identidad',
    example: 1234567890,
  })
  dni: number;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  lastName: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'juan.perez@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '+57 300 123 4567',
  })
  phone: string;

  @ApiProperty({
    description: 'ID del rol',
    example: 2,
  })
  roleId: number;

  @ApiProperty({
    description: 'Dirección',
    example: 'Calle 123 #45-67',
  })
  address: string;

  @ApiProperty({
    description: 'ID del barrio',
    example: 164,
  })
  neighborhoodId: number;

  @ApiProperty({
    description: 'Estado de activación de la cuenta',
    example: true,
  })
  active: boolean;

  static fromDomainEntity(user: UserDomainEntity): UserDto {
    return {
      id: user.id!,
      dni: user.dni,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      address: user.address,
      neighborhoodId: user.neighborhoodId,
      active: user.active,
    };
  }
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Token de renovación',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsJWT() // verifica formato JWT
  @IsNotEmpty() // no permite vacío
  refresh_token: string;
}
