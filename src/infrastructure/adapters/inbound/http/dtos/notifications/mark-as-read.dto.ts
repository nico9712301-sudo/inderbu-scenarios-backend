import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkAsReadDto {
  @ApiProperty({
    description: 'Array of notification IDs to mark as read',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray({ message: 'Ids must be an array' })
  @ArrayMinSize(1, { message: 'At least one ID is required' })
  @IsNumber({}, { each: true, message: 'Each ID must be a number' })
  ids: number[];
}

