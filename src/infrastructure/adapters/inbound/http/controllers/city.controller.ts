import { Controller, Get, Inject, Query } from '@nestjs/common';

import { ICityApplicationPort } from '../../../../../core/application/ports/inbound/city-application.port';
import { APPLICATION_PORTS } from '../../../../../core/application/tokens/ports';
@Controller('cities')
export class CityController {
  constructor(
    @Inject(APPLICATION_PORTS.CITY)
    private readonly cityApplicationService: ICityApplicationPort,
  ) {}

  @Get()
  getAll() {
    return this.cityApplicationService.getAll();
  }

  @Get('/:id')
  findById(@Query('id') id: number) {
    return this.cityApplicationService.findById(id);
  }
}
