import {
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Document Number (DNI)',
    example: 12345678,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'DNI must be a number' })
  @Min(1000000, { message: 'DNI must be at least 7 digits' })
  dni?: number;

  @ApiProperty({
    description: 'First Name',
    example: 'Juan',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName?: string;

  @ApiProperty({
    description: 'Last Name',
    example: 'Pérez',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName?: string;

  @ApiProperty({
    description: 'Email Address',
    example: 'juan.perez@email.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(100, { message: 'Email must not exceed 100 characters' })
  email?: string;

  @ApiProperty({
    description: 'Phone Number',
    example: '+56912345678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MinLength(8, { message: 'Phone must be at least 8 characters' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  phone?: string;

  @ApiProperty({
    description: 'Address',
    example: 'Av. Principal 123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address?: string;

  @ApiProperty({
    description: 'Role ID',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Role ID must be a number' })
  @Min(1, { message: 'Role ID must be greater than 0' })
  roleId?: number;

  @ApiProperty({
    description: 'Neighborhood ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Neighborhood ID must be a number' })
  @Min(1, { message: 'Neighborhood ID must be greater than 0' })
  neighborhoodId?: number;

  @ApiProperty({
    description: 'Active Status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean' })
  active?: boolean;
}
