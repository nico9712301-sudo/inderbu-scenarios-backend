import { Controller, Get, Inject, Query } from '@nestjs/common';

import { ICityApplicationPort } from 'src/core/application/ports/inbound/city-application.port';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
@Controller('cities')
export class CityController {
  constructor(
    @Inject(APPLICATION_PORTS.CITY)
    private readonly cityApplicationService: ICityApplicationPort,
  ) {}

  @Get()
  async getAll() {
    return this.cityApplicationService.getAll();
  }

  @Get('/:id')
  async findById(@Query('id') id: number) {
    return this.cityApplicationService.findById(id);
  }
}
