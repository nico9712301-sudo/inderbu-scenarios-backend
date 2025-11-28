import { IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SlideOrderDto {
  @ApiProperty({
    description: 'Slide ID',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'New display order',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  displayOrder: number;
}

export class ReorderSlidesDto {
  @ApiProperty({
    description: 'Array of slide orders',
    type: [SlideOrderDto],
    example: [
      { id: 1, displayOrder: 0 },
      { id: 2, displayOrder: 1 },
      { id: 3, displayOrder: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlideOrderDto)
  slideOrders: SlideOrderDto[];
}
