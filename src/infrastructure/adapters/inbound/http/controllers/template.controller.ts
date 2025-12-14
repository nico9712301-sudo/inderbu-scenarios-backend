import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TemplateManagementApplicationPort } from '../../../../../core/application/ports/inbound/template-management-application.port';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateResponseDto,
  TemplateTypeDto,
} from '../dtos/templates';
import { APPLICATION_PORTS } from '../../../../providers/billing/application-ports';
import { Inject } from '@nestjs/common';

@ApiTags('Templates')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/templates')
export class TemplateController {
  constructor(
    @Inject(APPLICATION_PORTS.TEMPLATE_MANAGEMENT)
    private readonly templateService: TemplateManagementApplicationPort,
  ) {}

  @Post()
  // @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: TemplateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createTemplate(
    @Body() createDto: CreateTemplateDto,
  ): Promise<TemplateResponseDto> {
    try {
      const result = await this.templateService.createTemplate({
        name: createDto.name,
        type: createDto.type as any,
        content: createDto.content,
        description: createDto.description,
        active: createDto.active ?? true,
      });

      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update an existing template' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
    type: TemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTemplateDto,
  ): Promise<TemplateResponseDto> {
    try {
      const result = await this.templateService.updateTemplate(id, {
        name: updateDto.name,
        content: updateDto.content,
        description: updateDto.description,
        active: updateDto.active,
      });

      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Template found',
    type: TemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplateById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TemplateResponseDto> {
    const result = await this.templateService.getTemplateById(id);

    if (!result) {
      throw new NotFoundException('Template not found');
    }

    return this.mapToResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates with pagination' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async getAllTemplates(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: TemplateResponseDto[]; total: number; page: number; limit: number }> {
    const result = await this.templateService.getAllTemplates(page, limit);

    return {
      data: result.data.map(template => this.mapToResponseDto(template)),
      total: result.total,
      page,
      limit,
    };
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get active templates by type' })
  @ApiParam({ name: 'type', enum: TemplateTypeDto })
  @ApiResponse({ status: 200, description: 'List of active templates by type' })
  async getActiveTemplatesByType(
    @Param('type') type: TemplateTypeDto,
  ): Promise<TemplateResponseDto[]> {
    const results = await this.templateService.getActiveTemplatesByType(type as any);
    return results.map(template => this.mapToResponseDto(template));
  }

  @Get('receipts/active')
  @ApiOperation({ summary: 'Get all active receipt templates' })
  @ApiQuery({ name: 'search', required: false, type: 'string', description: 'Search templates by name' })
  @ApiResponse({ status: 200, description: 'List of active receipt templates' })
  async getActiveReceiptTemplates(
    @Query('search') searchTerm?: string,
  ): Promise<TemplateResponseDto[]> {
    let results;
    if (searchTerm && searchTerm.trim().length > 0) {
      results = await this.templateService.searchActiveReceiptTemplatesByName(searchTerm);
    } else {
      results = await this.templateService.getActiveReceiptTemplates();
    }
    return results.map(template => this.mapToResponseDto(template));
  }

  @Post('validate')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Validate template content' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateTemplateContent(
    @Body() body: { content: string },
  ): Promise<{ isValid: boolean; reason?: string }> {
    return await this.templateService.validateTemplateContent(body.content);
  }

  @Put(':id/activate')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Activate a template' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Template activated', type: TemplateResponseDto })
  async activateTemplate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TemplateResponseDto> {
    try {
      const result = await this.templateService.activateTemplate(id);
      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id/deactivate')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Deactivate a template' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Template deactivated', type: TemplateResponseDto })
  async deactivateTemplate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TemplateResponseDto> {
    try {
      const result = await this.templateService.deactivateTemplate(id);
      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  // @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a template' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  async deleteTemplate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const success = await this.templateService.deleteTemplate(id);

    if (!success) {
      throw new NotFoundException('Template not found or could not be deleted');
    }
  }

  @Post(':id/duplicate')
  // @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Duplicate a template' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 201, description: 'Template duplicated', type: TemplateResponseDto })
  async duplicateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { newName: string },
  ): Promise<TemplateResponseDto> {
    try {
      const result = await this.templateService.duplicateTemplate(id, body.newName);
      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('statistics/overview')
  // @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get template statistics' })
  @ApiResponse({ status: 200, description: 'Template statistics' })
  async getTemplateStatistics() {
    return await this.templateService.getTemplateStatistics();
  }

  private mapToResponseDto(entity: any): TemplateResponseDto {
    return {
      id: entity.id!,
      name: entity.name,
      type: entity.type as any,
      content: entity.content,
      isActive: entity.isActive,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

