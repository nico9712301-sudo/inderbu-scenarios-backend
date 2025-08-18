import { Injectable, Inject } from '@nestjs/common';
import { GetHomeSlidesUseCase } from '../use-cases/home-slide/get-home-slides.use-case';
import { ManageHomeSlidesUseCase } from '../use-cases/home-slide/manage-home-slides.use-case';
import { 
  HomeSlideEntity, 
  HomeSlideType 
} from 'src/core/domain/entities/home-slide/home-slide.entity';

export interface IHomeSlideApplicationPort {
  getHomeSlides(filters?: any): Promise<{ slides: HomeSlideEntity[] }>;
  getHomeBanners(): Promise<HomeSlideEntity[]>;
  getPlaceholderSlide(): Promise<HomeSlideEntity | null>;
  createSlide(data: any): Promise<HomeSlideEntity>;
  updateSlide(id: number, data: any): Promise<HomeSlideEntity>;
  deleteSlide(id: number): Promise<void>;
  toggleSlideStatus(id: number): Promise<HomeSlideEntity>;
  getSlideById(id: number): Promise<HomeSlideEntity>;
  reorderSlides(data: any): Promise<void>;
}

@Injectable()
export class HomeSlideApplicationService implements IHomeSlideApplicationPort {
  constructor(
    private readonly getHomeSlidesUseCase: GetHomeSlidesUseCase,
    private readonly manageHomeSlidesUseCase: ManageHomeSlidesUseCase,
  ) {}

  async getHomeSlides(filters?: any): Promise<{ slides: HomeSlideEntity[] }> {
    return this.getHomeSlidesUseCase.execute(filters);
  }

  async getHomeBanners(): Promise<HomeSlideEntity[]> {
    return this.getHomeSlidesUseCase.getHomeBanners();
  }

  async getPlaceholderSlide(): Promise<HomeSlideEntity | null> {
    return this.getHomeSlidesUseCase.getPlaceholderSlide();
  }

  async createSlide(data: any): Promise<HomeSlideEntity> {
    return this.manageHomeSlidesUseCase.createSlide(data);
  }

  async updateSlide(id: number, data: any): Promise<HomeSlideEntity> {
    return this.manageHomeSlidesUseCase.updateSlide(id, data);
  }

  async deleteSlide(id: number): Promise<void> {
    this.manageHomeSlidesUseCase.deleteSlide(id);
  }

  async toggleSlideStatus(id: number): Promise<HomeSlideEntity> {
    return this.manageHomeSlidesUseCase.toggleSlideStatus(id);
  }

  async getSlideById(id: number): Promise<HomeSlideEntity> {
    return this.manageHomeSlidesUseCase.getSlideById(id);
  }

  async reorderSlides(data: any): Promise<void> {
    return this.manageHomeSlidesUseCase.reorderSlides(data);
  }
}