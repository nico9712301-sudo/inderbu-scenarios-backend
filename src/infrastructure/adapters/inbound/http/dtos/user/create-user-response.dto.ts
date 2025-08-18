import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 123456789 })
  @Expose()
  readonly dni: number;

  @ApiProperty({ example: 'John' })
  @Expose()
  readonly firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Expose()
  readonly lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Expose()
  readonly email: string;

  @ApiProperty({ example: '1234567890' })
  @Expose()
  readonly phone: string;

  @ApiProperty({ example: 1 })
  @Expose()
  readonly roleId: number | null;

  @ApiProperty({ example: '123 Main St' })
  @Expose()
  readonly address: string;

  @ApiProperty({ example: 1 })
  @Expose()
  readonly neighborhoodId: number;

  @ApiProperty({
    example: false,
    description: 'Indica si la cuenta está activa',
  })
  @Expose()
  active: boolean;
}
