import { IsString, IsEnum, IsOptional, IsNumber, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationTypeDto {
  PAYMENT_PROOF_UPLOADED = 'payment_proof_uploaded',
  RECEIPT_GENERATED = 'receipt_generated',
  RECEIPT_SENT = 'receipt_sent',
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification type',
    enum: NotificationTypeDto,
    example: NotificationTypeDto.PAYMENT_PROOF_UPLOADED,
  })
  @IsEnum(NotificationTypeDto, {
    message: 'Type must be one of: payment_proof_uploaded, receipt_generated, receipt_sent',
  })
  type: NotificationTypeDto;

  @ApiProperty({
    description: 'Notification title',
    example: 'New payment proof uploaded',
    minLength: 3,
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'A new payment proof has been uploaded for reservation #123',
    minLength: 5,
  })
  @IsString({ message: 'Message must be a string' })
  @MinLength(5, { message: 'Message must be at least 5 characters long' })
  message: string;

  @ApiPropertyOptional({
    description: 'Reservation ID related to this notification',
    example: 123,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Reservation ID must be a number' })
  reservationId?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON object',
    example: { paymentProofId: 456 },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

