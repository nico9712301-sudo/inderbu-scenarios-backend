import { HomeSlideEntity, HomeSlideType } from './home-slide.entity';

export interface HomeSlideFilters {
  slideType?: HomeSlideType;
  isActive?: boolean;
  limit?: number;
  orderBy?: 'displayOrder' | 'createdAt';
  orderDirection?: 'ASC' | 'DESC';
}

export interface IHomeSlideRepositoryPort {
  /**
   * Find all home slides with optional filters
   */
  findAll(filters?: HomeSlideFilters): Promise<HomeSlideEntity[]>;

  /**
   * Find active slides ordered by display order
   */
  findActiveSlides(slideType?: HomeSlideType): Promise<HomeSlideEntity[]>;

  /**
   * Find a home slide by ID
   */
  findById(id: number): Promise<HomeSlideEntity | null>;

  /**
   * Create a new home slide
   */
  create(slideData: Omit<HomeSlideEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<HomeSlideEntity>;

  /**
   * Update an existing home slide
   */
  update(id: number, slide: HomeSlideEntity): Promise<HomeSlideEntity>;

  /**
   * Update slide active status
   */
  updateActiveStatus(id: number, isActive: boolean): Promise<HomeSlideEntity>;

  /**
   * Update display order for multiple slides
   */
  updateDisplayOrders(updates: Array<{ id: number; displayOrder: number }>): Promise<void>;

  /**
   * Delete a home slide
   */
  delete(id: number): Promise<boolean>;

  /**
   * Get the next available display order
   */
  getNextDisplayOrder(slideType?: HomeSlideType): Promise<number>;

  /**
   * Get placeholder slide for sub-scenarios
   */
  getPlaceholderSlide(): Promise<HomeSlideEntity | null>;
}