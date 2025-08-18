export enum HomeSlideType {
  BANNER = 'banner',
  PLACEHOLDER = 'placeholder',
}

export interface CreateHomeSlideData {
  title: string;
  description?: string;
  imageUrl: string;
  displayOrder?: number;
  slideType?: HomeSlideType;
  moduleId?: number;
  entityId?: number;
}

export interface UpdateHomeSlideData {
  title?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  slideType?: HomeSlideType;
  moduleId?: number;
  entityId?: number;
}

export class HomeSlideEntity {
  constructor(
    public readonly id: number,
    public title: string,
    public description: string | null,
    public imageUrl: string,
    public displayOrder: number,
    public isActive: boolean,
    public slideType: HomeSlideType,
    public moduleId: number | null,
    public entityId: number | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  // Business Logic Methods
  
  /**
   * Checks if this slide is active and should be displayed
   */
  canBeDisplayed(): boolean {
    return this.isActive && this.imageUrl.length > 0;
  }

  /**
   * Checks if this slide is a banner type
   */
  isBanner(): boolean {
    return this.slideType === HomeSlideType.BANNER;
  }

  /**
   * Checks if this slide is a placeholder type
   */
  isPlaceholder(): boolean {
    return this.slideType === HomeSlideType.PLACEHOLDER;
  }

  /**
   * Updates slide activation status with business validation
   */
  updateActiveStatus(newActiveStatus: boolean): void {
    // Business rule: placeholder slides should always remain active
    if (this.isPlaceholder() && !newActiveStatus) {
      throw new Error('Placeholder slides cannot be deactivated');
    }
    
    this.isActive = newActiveStatus;
    this.updatedAt = new Date();
  }

  /**
   * Updates display order with validation
   */
  updateDisplayOrder(newOrder: number): void {
    if (newOrder < 0) {
      throw new Error('Display order must be a positive number');
    }
    
    this.displayOrder = newOrder;
    this.updatedAt = new Date();
  }

  /**
   * Updates slide data with business validation
   */
  update(data: UpdateHomeSlideData): void {
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw new Error('Title cannot be empty');
      }
      this.title = data.title.trim();
    }

    if (data.description !== undefined) {
      this.description = data.description?.trim() || null;
    }

    if (data.imageUrl !== undefined) {
      if (data.imageUrl.trim().length === 0) {
        throw new Error('Image URL cannot be empty');
      }
      this.imageUrl = data.imageUrl.trim();
    }

    if (data.moduleId !== undefined) {
      this.moduleId = data.moduleId;
    }

    if (data.entityId !== undefined) {
      this.entityId = data.entityId;
    }

    if (data.displayOrder !== undefined) {
      this.updateDisplayOrder(data.displayOrder);
    }

    if (data.isActive !== undefined) {
      this.updateActiveStatus(data.isActive);
    }

    if (data.slideType !== undefined) {
      this.slideType = data.slideType;
    }

    this.updatedAt = new Date();
  }

  // Factory Methods

  /**
   * Creates a new HomeSlide entity from creation data
   */
  static create(data: CreateHomeSlideData): HomeSlideEntity {
    if (!data.title?.trim()) {
      throw new Error('Title is required');
    }

    if (!data.imageUrl?.trim()) {
      throw new Error('Image URL is required');
    }

    // id, createdAt, and updatedAt are set to placeholder values (e.g., 0 and new Date())
    return new HomeSlideEntity(
      0,
      data.title.trim(),
      data.description?.trim() || null,
      data.imageUrl.trim(),
      data.displayOrder ?? 0,
      true,
      data.slideType ?? HomeSlideType.BANNER,
      data.moduleId ?? null,
      data.entityId ?? null,
      new Date(),
      new Date()
    );
  }

  /**
   * Creates HomeSlide entity from database/API data
   */
  static fromPersistence(data: any): HomeSlideEntity {
    return new HomeSlideEntity(
      data.id,
      data.title,
      data.description,
      data.imageUrl,
      data.displayOrder,
      data.isActive,
      data.slideType as HomeSlideType,
      data.moduleId || null,
      data.entityId || null,
      data.createdAt,
      data.updatedAt,
    );
  }
}