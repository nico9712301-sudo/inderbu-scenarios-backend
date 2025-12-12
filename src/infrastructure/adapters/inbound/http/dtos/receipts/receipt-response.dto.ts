import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReceiptResponseDto {
  @ApiProperty({
    description: 'ID único del recibo',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID de la reservación',
    example: 5,
  })
  reservationId: number;

  @ApiProperty({
    description: 'ID de la plantilla usada',
    example: 1,
  })
  templateId: number;

  @ApiProperty({
    description: 'URL del archivo PDF',
    example: 'https://receipts.example.com/receipt_5_cliente_2025-12-12.pdf',
  })
  pdfUrl: string;

  @ApiProperty({
    description: 'Fecha de generación',
    example: '2025-12-12T06:45:00.000Z',
  })
  generatedAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha de envío por email',
    example: '2025-12-12T07:00:00.000Z',
  })
  sentAt?: Date;

  @ApiPropertyOptional({
    description: 'Email al que fue enviado',
    example: 'cliente@example.com',
  })
  sentToEmail?: string;

  @ApiProperty({
    description: 'Indica si el recibo fue generado exitosamente',
    example: true,
  })
  isGenerated: boolean;

  @ApiProperty({
    description: 'Indica si el recibo fue enviado',
    example: false,
  })
  isSent: boolean;
}