// src/infrastructure/adapters/inbound/http/dtos/user/user-with-relations.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { RoleResponseDto } from '../role/role-response.dto';
import { NeighborhoodResponseDto } from '../neighborhood/neighborhood-response.dto';

// Import DTOs for Commune and City
import { CommuneResponseDto } from '../commune/commune-response.dto';
import { CityResponseDto } from '../city/city-response.dto';

export class UserWithRelationsDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  dni: number;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phone: string;

  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  active: boolean;

  @ApiProperty({ type: () => RoleResponseDto })
  @Expose()
  @Type(() => RoleResponseDto)
  role: RoleResponseDto;

  @ApiProperty({ type: () => NeighborhoodResponseDto })
  @Expose()
  @Type(() => NeighborhoodResponseDto)
  neighborhood: NeighborhoodResponseDto;

  @ApiProperty({ type: () => CommuneResponseDto })
  @Expose()
  @Type(() => CommuneResponseDto)
  commune: CommuneResponseDto;

  @ApiProperty({ type: () => CityResponseDto })
  @Expose()
  @Type(() => CityResponseDto)
  city: CityResponseDto;
}
