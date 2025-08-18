// src/infrastructure/adapters/inbound/http/role.controller.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { IRoleApplicationPort } from 'src/core/application/ports/inbound/role-application.port';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { RoleResponseDto } from '../dtos/role/role-response.dto';

@Controller('roles')
export class RoleController {
  constructor(
    @Inject(APPLICATION_PORTS.ROLE)
    private readonly roleService: IRoleApplicationPort,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtiene todos los roles (sin super-admin ni admin)',
  })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  async getRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.roleService.getRoles();
    return roles.map((r) => ({
      id: r.id!,
      name: r.name,
      description: r.description,
    }));
  }
}
