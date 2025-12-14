import { IsString, IsOptional, IsBoolean, IsJSON, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTemplateDto {
  @ApiPropertyOptional({
    description: 'Template name',
    example: 'Updated Receipt Template',
    minLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Template content as JSON string',
    example: '{"components": [{"type": "logo", "position": {"x": 0, "y": 0}}]}',
  })
  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  @IsJSON({ message: 'Content must be valid JSON' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Template description',
    example: 'Updated receipt template',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the template is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active?: boolean;
}

