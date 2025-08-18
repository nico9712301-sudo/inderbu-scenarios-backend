// src/infrastructure/adapters/inbound/http/dtos/commune/commune-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CityResponseDto } from '../city/city-response.dto';

export class CommuneResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ type: () => CityResponseDto, required: false })
  @Expose()
  @Type(() => CityResponseDto)
  city?: CityResponseDto;
}
