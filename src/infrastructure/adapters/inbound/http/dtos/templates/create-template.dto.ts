import { IsString, IsEnum, IsOptional, IsBoolean, IsJSON, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TemplateTypeDto {
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  EMAIL = 'email',
}

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Basic Receipt Template',
    minLength: 3,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @ApiProperty({
    description: 'Template type',
    enum: TemplateTypeDto,
    example: TemplateTypeDto.RECEIPT,
  })
  @IsEnum(TemplateTypeDto, { message: 'Type must be one of: receipt, invoice, email' })
  type: TemplateTypeDto;

  @ApiProperty({
    description: 'Template content as JSON string',
    example: '{"components": [{"type": "logo", "position": {"x": 0, "y": 0}}]}',
  })
  @IsString({ message: 'Content must be a string' })
  @IsJSON({ message: 'Content must be valid JSON' })
  content: string;

  @ApiPropertyOptional({
    description: 'Template description',
    example: 'Basic receipt template for payments',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the template is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active?: boolean;
}

