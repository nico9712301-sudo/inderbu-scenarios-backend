import { ApiProperty } from '@nestjs/swagger';

export class PageMetaDto {
  @ApiProperty() readonly page: number;
  @ApiProperty() readonly limit: number;
  @ApiProperty() readonly totalItems: number;
  @ApiProperty() readonly totalPages: number;

  constructor({
    page,
    limit,
    totalItems,
  }: {
    page: number;
    limit: number;
    totalItems: number;
  }) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / limit);
  }
}

export class PageDto<T> {
  @ApiProperty({ isArray: true }) readonly data: T[];
  @ApiProperty() readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
