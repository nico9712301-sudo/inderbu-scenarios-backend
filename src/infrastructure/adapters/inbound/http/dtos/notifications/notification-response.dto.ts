import { ApiProperty } from '@nestjs/swagger';

export enum NotificationTypeResponseDto {
  PAYMENT_PROOF_UPLOADED = 'payment_proof_uploaded',
  RECEIPT_GENERATED = 'receipt_generated',
  RECEIPT_SENT = 'receipt_sent',
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Notification ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationTypeResponseDto,
    example: NotificationTypeResponseDto.PAYMENT_PROOF_UPLOADED,
  })
  type: NotificationTypeResponseDto;

  @ApiProperty({
    description: 'Notification title',
    example: 'New payment proof uploaded',
  })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'A new payment proof has been uploaded',
  })
  message: string;

  @ApiProperty({
    description: 'Reservation ID related to this notification',
    example: 123,
    nullable: true,
  })
  reservationId: number | null;

  @ApiProperty({
    description: 'Payment proof ID related to this notification',
    example: 456,
    nullable: true,
  })
  paymentProofId: number | null;

  @ApiProperty({
    description: 'Receipt ID related to this notification',
    example: 789,
    nullable: true,
  })
  receiptId: number | null;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Date when the notification was read',
    example: '2025-12-12T06:45:00.000Z',
    nullable: true,
  })
  readAt: Date | null;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-12-12T06:45:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-12-12T06:45:00.000Z',
  })
  updatedAt: Date;
}

