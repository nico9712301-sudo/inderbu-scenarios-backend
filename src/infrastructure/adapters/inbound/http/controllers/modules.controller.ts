import { Controller, Get } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ModuleEntity } from '../../../../persistence/module.entity';
import { EntityEntity } from '../../../../persistence/entity.entity';
import { MYSQL_REPOSITORY } from '../../../../tokens/repositories';

@Controller('modules')
export class ModulesController {
  constructor(
    @Inject(MYSQL_REPOSITORY.MODULE)
    private readonly moduleRepository: Repository<ModuleEntity>,
  ) {}

  @Get()
  async getModules() {
    return this.moduleRepository.find();
  }
}

@Controller('entities')
export class EntitiesController {
  constructor(
    @Inject(MYSQL_REPOSITORY.ENTITY)
    private readonly entityRepository: Repository<EntityEntity>,
  ) {}

  @Get()
  async getEntities() {
    return this.entityRepository.find();
  }
}
