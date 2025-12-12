import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadPaymentProofDto {
  @ApiProperty({
    description: 'ID de la reservación',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID de la reservación debe ser un número' })
  @Min(1, { message: 'El ID de la reservación debe ser mayor a 0' })
  reservationId: number;

  @ApiProperty({
    description: 'URL del archivo subido',
    example: 'https://storage.example.com/payment_proofs/proof_123.jpg',
  })
  @IsString({ message: 'La URL del archivo debe ser una cadena' })
  @IsNotEmpty({ message: 'La URL del archivo es requerida' })
  fileUrl: string;

  @ApiProperty({
    description: 'Nombre original del archivo',
    example: 'comprobante_pago.jpg',
  })
  @IsString({ message: 'El nombre del archivo debe ser una cadena' })
  @IsNotEmpty({ message: 'El nombre del archivo es requerido' })
  originalFileName: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
    example: 'image/jpeg',
  })
  @IsString({ message: 'El tipo MIME debe ser una cadena' })
  @IsNotEmpty({ message: 'El tipo MIME es requerido' })
  mimeType: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 1024000,
  })
  @IsNumber({}, { message: 'El tamaño del archivo debe ser un número' })
  @Min(1, { message: 'El tamaño del archivo debe ser mayor a 0' })
  fileSize: number;

  @ApiProperty({
    description: 'ID del usuario que sube el archivo',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  uploadedByUserId: number;
}