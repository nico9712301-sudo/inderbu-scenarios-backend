// src/infrastructure/adapters/inbound/http/dtos/neighborhood/neighborhood-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CommuneResponseDto } from '../commune/commune-response.dto';

export class NeighborhoodResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ type: () => CommuneResponseDto })
  @Expose()
  @Type(() => CommuneResponseDto)
  commune?: CommuneResponseDto;
}
