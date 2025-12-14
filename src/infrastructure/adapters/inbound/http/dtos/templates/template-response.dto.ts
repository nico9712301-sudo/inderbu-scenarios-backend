import { ApiProperty } from '@nestjs/swagger';

export enum TemplateTypeResponseDto {
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  EMAIL = 'email',
}

export class TemplateResponseDto {
  @ApiProperty({
    description: 'Template ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Template name',
    example: 'Basic Receipt Template',
  })
  name: string;

  @ApiProperty({
    description: 'Template type',
    enum: TemplateTypeResponseDto,
    example: TemplateTypeResponseDto.RECEIPT,
  })
  type: TemplateTypeResponseDto;

  @ApiProperty({
    description: 'Template content as JSON string',
    example: '{"components": [{"type": "logo"}]}',
  })
  content: string;

  @ApiProperty({
    description: 'Whether the template is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'ID of user who created the template',
    example: 1,
    nullable: true,
  })
  createdBy: number | null;

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

