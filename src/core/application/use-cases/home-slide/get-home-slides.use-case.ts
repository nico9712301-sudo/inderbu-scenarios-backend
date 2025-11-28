import { Injectable, Inject } from '@nestjs/common';
import {
  IHomeSlideRepositoryPort,
  HomeSlideFilters,
} from '../../../domain/entities/home-slide/home-slide-repository.port';
import {
  HomeSlideEntity,
  HomeSlideType,
} from '../../../domain/entities/home-slide/home-slide.entity';
import { REPOSITORY_PORTS } from '../../../../infrastructure/tokens/ports';

export interface GetHomeSlidesRequest {
  slideType?: HomeSlideType;
  isActive?: boolean;
  limit?: number;
  includeInactive?: boolean;
}

export interface GetHomeSlidesResponse {
  slides: HomeSlideEntity[];
  totalCount: number;
}

@Injectable()
export class GetHomeSlidesUseCase {
  constructor(
    @Inject(REPOSITORY_PORTS.HOME_SLIDE)
    private readonly homeSlideRepository: IHomeSlideRepositoryPort,
  ) {}

  async execute(
    request: GetHomeSlidesRequest = {},
  ): Promise<GetHomeSlidesResponse> {
    const filters: HomeSlideFilters = {
      slideType: request.slideType,
      isActive: request.includeInactive,
      limit: request.limit,
      orderBy: 'displayOrder',
      orderDirection: 'ASC',
    };

    if (request.isActive !== undefined) {
      filters.isActive = request.isActive;
    }

    const slides = await this.homeSlideRepository.findAll(filters);

    return {
      slides,
      totalCount: slides.length,
    };
  }

  /**
   * Get only active banner slides for home page
   */
  async getHomeBanners(): Promise<HomeSlideEntity[]> {
    return this.homeSlideRepository.findActiveSlides(HomeSlideType.BANNER);
  }

  /**
   * Get placeholder slide for sub-scenarios without images
   */
  async getPlaceholderSlide(): Promise<HomeSlideEntity | null> {
    return this.homeSlideRepository.getPlaceholderSlide();
  }
}
