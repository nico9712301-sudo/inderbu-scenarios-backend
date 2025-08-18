import { ApiProperty } from '@nestjs/swagger';

export class ActivityAreaResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
}
