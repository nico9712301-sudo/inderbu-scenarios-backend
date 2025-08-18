import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { 
  IHomeSlideRepositoryPort, 
  HomeSlideFilters 
} from 'src/core/domain/entities/home-slide/home-slide-repository.port';
import { 
  HomeSlideEntity as DomainHomeSlideEntity, 
  HomeSlideType 
} from 'src/core/domain/entities/home-slide/home-slide.entity';
import { HomeSlideEntity as PersistenceHomeSlideEntity } from 'src/infrastructure/persistence/home-slide.entity';
import { MYSQL_REPOSITORY } from 'src/infrastructure/tokens/repositories';

@Injectable()
export class HomeSlideRepositoryAdapter implements IHomeSlideRepositoryPort {
  constructor(
    @Inject(MYSQL_REPOSITORY.HOME_SLIDE)
    private readonly homeSlideRepository: Repository<PersistenceHomeSlideEntity>,
  ) {}

  async findAll(filters?: HomeSlideFilters): Promise<DomainHomeSlideEntity[]> {
    const queryBuilder = this.homeSlideRepository.createQueryBuilder('slide');

    // Apply filters
    if (filters?.slideType) {
      queryBuilder.andWhere('slide.slideType = :slideType', { 
        slideType: filters.slideType 
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('slide.isActive = :isActive', { 
        isActive: filters.isActive 
      });
    }

    // Apply ordering
    const orderBy = filters?.orderBy || 'displayOrder';
    const orderDirection = filters?.orderDirection || 'ASC';
    queryBuilder.orderBy(`slide.${orderBy}`, orderDirection);

    // Apply limit
    if (filters?.limit) {
      queryBuilder.limit(filters.limit);
    }

    const slides = await queryBuilder.getMany();
    return slides.map(this.toDomain);
  }

  async findActiveSlides(slideType?: HomeSlideType): Promise<DomainHomeSlideEntity[]> {
    const filters: HomeSlideFilters = {
      isActive: true,
      orderBy: 'displayOrder',
      orderDirection: 'ASC',
    };

    if (slideType) {
      filters.slideType = slideType;
    }

    return this.findAll(filters);
  }

  async findById(id: number): Promise<DomainHomeSlideEntity | null> {
    const slide = await this.homeSlideRepository.findOne({ where: { id } });
    return slide ? this.toDomain(slide) : null;
  }

  async create(slideData: Omit<DomainHomeSlideEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DomainHomeSlideEntity> {
    const slideEntity = {
      title: slideData.title,
      description: slideData.description,
      imageUrl: slideData.imageUrl,
      displayOrder: slideData.displayOrder,
      isActive: slideData.isActive,
      slideType: slideData.slideType as any,
    };

    const savedSlide = await this.homeSlideRepository.save(slideEntity);
    return this.toDomain(savedSlide);
  }

  async update(id: number, slide: DomainHomeSlideEntity): Promise<DomainHomeSlideEntity> {
    await this.homeSlideRepository.update(id, {
      title: slide.title,
      description: slide.description,
      imageUrl: slide.imageUrl,
      displayOrder: slide.displayOrder,
      isActive: slide.isActive,
      slideType: slide.slideType as any,
      updatedAt: slide.updatedAt,
    });

    const updatedSlide = await this.homeSlideRepository.findOne({ where: { id } });
    if (!updatedSlide) {
      throw new Error(`HomeSlide with id ${id} not found`);
    }

    return this.toDomain(updatedSlide);
  }

  async updateActiveStatus(id: number, isActive: boolean): Promise<DomainHomeSlideEntity> {
    const slide = await this.findById(id);
    if (!slide) {
      throw new Error(`HomeSlide with id ${id} not found`);
    }

    slide.updateActiveStatus(isActive);
    return this.update(id, slide);
  }

  async updateDisplayOrders(updates: Array<{ id: number; displayOrder: number }>): Promise<void> {
    for (const update of updates) {
      await this.homeSlideRepository.update(update.id, {
        displayOrder: update.displayOrder,
        updatedAt: new Date(),
      });
    }
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.homeSlideRepository.delete(id);
    return result.affected! > 0;
  }

  async getNextDisplayOrder(slideType?: HomeSlideType): Promise<number> {
    const queryBuilder = this.homeSlideRepository.createQueryBuilder('slide');
    
    if (slideType) {
      queryBuilder.where('slide.slideType = :slideType', { slideType });
    }
    
    queryBuilder.orderBy('slide.displayOrder', 'DESC').limit(1);
    
    const lastSlide = await queryBuilder.getOne();
    return lastSlide ? lastSlide.displayOrder + 1 : 0;
  }

  async getPlaceholderSlide(): Promise<DomainHomeSlideEntity | null> {
    const slides = await this.findActiveSlides(HomeSlideType.PLACEHOLDER);
    return slides.length > 0 ? slides[0] : null;
  }

  /**
   * Converts persistence entity to domain entity
   */
  private toDomain(persistence: PersistenceHomeSlideEntity): DomainHomeSlideEntity {
    return DomainHomeSlideEntity.fromPersistence({
      id: persistence.id,
      title: persistence.title,
      description: persistence.description,
      imageUrl: persistence.imageUrl,
      displayOrder: persistence.displayOrder,
      isActive: persistence.isActive,
      slideType: persistence.slideType,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    });
  }
}