import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { GetHomeSlidesUseCase } from '../../../../../core/application/use-cases/home-slide/get-home-slides.use-case';
import { ManageHomeSlidesUseCase } from '../../../../../core/application/use-cases/home-slide/manage-home-slides.use-case';
import { HomeSlideType } from '../../../../../core/domain/entities/home-slide/home-slide.entity';

import { CreateHomeSlideDto } from '../dtos/home-slide/create-home-slide.dto';
import { UpdateHomeSlideDto } from '../dtos/home-slide/update-home-slide.dto';
import { HomeSlideResponseDto } from '../dtos/home-slide/home-slide-response.dto';
import { ReorderSlidesDto } from '../dtos/home-slide/reorder-slides.dto';

@ApiTags('Home Slides')
@Controller('home-slides')
export class HomeSlideController {
  constructor(
    private readonly getHomeSlidesUseCase: GetHomeSlidesUseCase,
    private readonly manageHomeSlidesUseCase: ManageHomeSlidesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all home slides with optional filters' })
  @ApiQuery({
    name: 'slideType',
    required: false,
    enum: HomeSlideType,
    description: 'Filter by slide type',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of results',
  })
  @ApiResponse({
    status: 200,
    description: 'Home slides retrieved successfully',
    type: [HomeSlideResponseDto],
  })
  async getHomeSlides(
    @Query('slideType') slideType?: HomeSlideType,
    @Query('isActive') isActive?: boolean,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<HomeSlideResponseDto[]> {
    const result = await this.getHomeSlidesUseCase.execute({
      slideType,
      isActive,
      limit,
    });

    return result.slides.map((slide) => this.toResponseDto(slide));
  }

  @Get('banners')
  @ApiOperation({ summary: 'Get active banner slides for home page' })
  @ApiResponse({
    status: 200,
    description: 'Active banner slides retrieved successfully',
    type: [HomeSlideResponseDto],
  })
  async getHomeBanners(): Promise<HomeSlideResponseDto[]> {
    const slides = await this.getHomeSlidesUseCase.getHomeBanners();
    return slides.map((slide) => this.toResponseDto(slide));
  }

  @Get('placeholder')
  @ApiOperation({ summary: 'Get placeholder slide for sub-scenarios' })
  @ApiResponse({
    status: 200,
    description: 'Placeholder slide retrieved successfully',
    type: HomeSlideResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No placeholder slide found',
  })
  async getPlaceholderSlide(): Promise<HomeSlideResponseDto | null> {
    const slide = await this.getHomeSlidesUseCase.getPlaceholderSlide();
    return slide ? this.toResponseDto(slide) : null;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific home slide by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Slide ID' })
  @ApiResponse({
    status: 200,
    description: 'Home slide retrieved successfully',
    type: HomeSlideResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Home slide not found' })
  async getHomeSlideById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HomeSlideResponseDto> {
    const slide = await this.manageHomeSlidesUseCase.getSlideById(id);
    return this.toResponseDto(slide);
  }

  @Post()
  // @UseGuards(AuthGuard('jwt'))
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new home slide' })
  @ApiResponse({
    status: 201,
    description: 'Home slide created successfully',
    type: HomeSlideResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid slide data' })
  async createHomeSlide(
    @Body() createSlideDto: CreateHomeSlideDto,
  ): Promise<HomeSlideResponseDto> {
    const slide =
      await this.manageHomeSlidesUseCase.createSlide(createSlideDto);
    return this.toResponseDto(slide);
  }

  @Put(':id')
  // @UseGuards(AuthGuard('jwt'))
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing home slide' })
  @ApiParam({ name: 'id', type: Number, description: 'Slide ID' })
  @ApiResponse({
    status: 200,
    description: 'Home slide updated successfully',
    type: HomeSlideResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Home slide not found' })
  @ApiResponse({ status: 400, description: 'Invalid slide data' })
  async updateHomeSlide(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSlideDto: UpdateHomeSlideDto,
  ): Promise<HomeSlideResponseDto> {
    const slide = await this.manageHomeSlidesUseCase.updateSlide(
      id,
      updateSlideDto,
    );
    return this.toResponseDto(slide);
  }

  @Put(':id/toggle')
  // @UseGuards(AuthGuard('jwt'))
  // @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle slide active status' })
  @ApiParam({ name: 'id', type: Number, description: 'Slide ID' })
  @ApiResponse({
    status: 200,
    description: 'Slide status toggled successfully',
    type: HomeSlideResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Home slide not found' })
  async toggleSlideStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HomeSlideResponseDto> {
    const slide = await this.manageHomeSlidesUseCase.toggleSlideStatus(id);
    return this.toResponseDto(slide);
  }

  @Put('reorder')
  // @UseGuards(AuthGuard('jwt'))
  // @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder multiple slides' })
  @ApiResponse({
    status: 200,
    description: 'Slides reordered successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid reorder data' })
  async reorderSlides(@Body() reorderDto: ReorderSlidesDto): Promise<void> {
    await this.manageHomeSlidesUseCase.reorderSlides(reorderDto);
  }

  @Delete(':id')
  // @UseGuards(AuthGuard('jwt'))
  // @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a home slide' })
  @ApiParam({ name: 'id', type: Number, description: 'Slide ID' })
  @ApiResponse({
    status: 204,
    description: 'Home slide deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Home slide not found' })
  async deleteHomeSlide(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.manageHomeSlidesUseCase.deleteSlide(id);
  }

  /**
   * Maps domain entity to response DTO
   */
  private toResponseDto(slide: any): HomeSlideResponseDto {
    return {
      id: slide.id,
      title: slide.title,
      description: slide.description,
      imageUrl: slide.imageUrl,
      linkUrl: slide.linkUrl,
      displayOrder: slide.displayOrder,
      isActive: slide.isActive,
      slideType: slide.slideType,
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt,
    };
  }
}
