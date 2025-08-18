// src/infrastructure/adapters/inbound/http/dtos/city/city-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CityResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;
}
