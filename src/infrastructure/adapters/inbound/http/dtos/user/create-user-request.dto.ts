import {
  IsDefined,
  IsNotEmpty,
  IsEmail,
  IsString,
  Matches,
  MinLength,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 123456789, description: 'Número de documento (DNI)' })
  @IsDefined()
  @IsNumber()
  @IsPositive()
  readonly dni: number;

  @ApiProperty({ example: 'John', description: 'Nombre del usuario' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido del usuario' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Correo electrónico',
  })
  @IsDefined()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: '1234567890', description: 'Número de teléfono' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'Contraseña que debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 dígito y 1 carácter especial (@, #, $, etc.)',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/, {
    message: 'La contraseña es muy débil.',
  })
  readonly password: string;

  @ApiProperty({ example: 1, description: 'ID del rol' })
  @IsDefined()
  @IsNumber()
  @IsPositive()
  readonly roleId: number;

  @ApiProperty({ example: '123 Main St', description: 'Dirección del usuario' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @ApiProperty({ example: 1, description: 'ID del barrio' })
  @IsDefined()
  @IsNumber()
  @IsPositive()
  readonly neighborhoodId: number;

  @ApiProperty({
    example: true,
    description: 'Estado activo/inactivo del usuario',
  })
  @IsDefined()
  readonly active: boolean = true;
}
