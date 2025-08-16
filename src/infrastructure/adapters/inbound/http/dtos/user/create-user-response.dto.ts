import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 123456789 })
  readonly dni: number;

  @ApiProperty({ example: 'John' })
  readonly firstName: string;

  @ApiProperty({ example: 'Doe' })
  readonly lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  readonly email: string;

  @ApiProperty({ example: '1234567890' })
  readonly phone: string;

  @ApiProperty({ example: 1 })
  readonly roleId: number | null;

  @ApiProperty({ example: '123 Main St' })
  readonly address: string;

  @ApiProperty({ example: 1 })
  readonly neighborhoodId: number;

  @ApiProperty({ example: false, description: 'Indica si la cuenta está activa' })
  @Expose()
  active: boolean;
}
