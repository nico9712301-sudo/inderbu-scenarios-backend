import { IsEmail, IsDefined, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendConfirmationDto {
  @ApiProperty({
    example: 'juan.perez@example.com',
    description: 'Correo del usuario que solicita reenvío',
  })
  @IsDefined()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
