import { IsNumber, IsEmail, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendReceiptDto {
  @ApiProperty({
    description: 'ID del recibo a enviar',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID del recibo debe ser un número' })
  @Min(1, { message: 'El ID del recibo debe ser mayor a 0' })
  receiptId: number;

  @ApiProperty({
    description: 'Email destinatario',
    example: 'cliente@example.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;
}