import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IHomeSlideRepositoryPort } from '../../../domain/entities/home-slide/home-slide-repository.port';
import {
  HomeSlideEntity,
  CreateHomeSlideData,
  UpdateHomeSlideData,
} from '../../../domain/entities/home-slide/home-slide.entity';
import { REPOSITORY_PORTS } from '../../../../infrastructure/tokens/ports';

export type CreateHomeSlideRequest = CreateHomeSlideData;

export type UpdateHomeSlideRequest = UpdateHomeSlideData;

export interface ReorderSlidesRequest {
  slideOrders: Array<{ id: number; displayOrder: number }>;
}

@Injectable()
export class ManageHomeSlidesUseCase {
  constructor(
    @Inject(REPOSITORY_PORTS.HOME_SLIDE)
    private readonly homeSlideRepository: IHomeSlideRepositoryPort,
  ) {}

  async createSlide(request: CreateHomeSlideRequest): Promise<HomeSlideEntity> {
    try {
      // Create domain entity with validation
      const slideData = HomeSlideEntity.create(request);

      // Set display order if not provided
      if (slideData.displayOrder === 0) {
        const nextOrder = await this.homeSlideRepository.getNextDisplayOrder(
          slideData.slideType,
        );
        slideData.displayOrder = nextOrder;
      }

      return await this.homeSlideRepository.create(slideData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateSlide(
    id: number,
    request: UpdateHomeSlideRequest,
  ): Promise<HomeSlideEntity> {
    const existingSlide = await this.homeSlideRepository.findById(id);
    if (!existingSlide) {
      throw new NotFoundException(`Home slide with id ${id} not found`);
    }

    try {
      // Apply business logic validation through domain entity
      existingSlide.update(request);
      return await this.homeSlideRepository.update(id, existingSlide);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteSlide(id: number): Promise<boolean> {
    const existingSlide = await this.homeSlideRepository.findById(id);
    if (!existingSlide) {
      throw new NotFoundException(`Home slide with id ${id} not found`);
    }

    // Business rule: prevent deletion of placeholder slides if it's the only one
    if (existingSlide.isPlaceholder()) {
      const placeholderSlides = await this.homeSlideRepository.findActiveSlides(
        existingSlide.slideType,
      );
      if (placeholderSlides.length <= 1) {
        throw new BadRequestException(
          'Cannot delete the last placeholder slide',
        );
      }
    }

    return await this.homeSlideRepository.delete(id);
  }

  async toggleSlideStatus(id: number): Promise<HomeSlideEntity> {
    const slide = await this.homeSlideRepository.findById(id);
    if (!slide) {
      throw new NotFoundException(`Home slide with id ${id} not found`);
    }

    try {
      return await this.homeSlideRepository.updateActiveStatus(
        id,
        !slide.isActive,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async reorderSlides(request: ReorderSlidesRequest): Promise<void> {
    // Validate that all slide IDs exist
    for (const item of request.slideOrders) {
      const slide = await this.homeSlideRepository.findById(item.id);
      if (!slide) {
        throw new NotFoundException(`Home slide with id ${item.id} not found`);
      }
    }

    // Validate display orders are valid
    const orders = request.slideOrders
      .map((item) => item.displayOrder)
      .sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] < 0) {
        throw new BadRequestException(
          'Display order must be a positive number',
        );
      }
    }

    await this.homeSlideRepository.updateDisplayOrders(request.slideOrders);
  }

  async getSlideById(id: number): Promise<HomeSlideEntity> {
    const slide = await this.homeSlideRepository.findById(id);
    if (!slide) {
      throw new NotFoundException(`Home slide with id ${id} not found`);
    }
    return slide;
  }
}
