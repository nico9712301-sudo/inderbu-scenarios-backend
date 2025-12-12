import { Expose } from 'class-transformer';

export enum TemplateTypeDomain {
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  EMAIL = 'email',
}

export class TemplateDomainEntity {
  @Expose()
  public readonly id: number | null;

  @Expose()
  public readonly name: string;

  @Expose()
  public readonly type: TemplateTypeDomain;

  @Expose()
  public readonly content: string;

  @Expose()
  public readonly isActive: boolean;

  @Expose()
  public readonly createdBy: number | null;

  @Expose()
  public readonly createdAt: Date;

  @Expose()
  public readonly updatedAt: Date;

  private constructor(builder: TemplateDomainBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.type = builder.type;
    this.content = builder.content;
    this.isActive = builder.isActive;
    this.createdBy = builder.createdBy;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static buildFromBuilder(builder: TemplateDomainBuilder): TemplateDomainEntity {
    return new TemplateDomainEntity(builder);
  }

  static builder(): TemplateDomainBuilder {
    return new TemplateDomainBuilder();
  }

  /**
   * Validates if the template content is valid JSON
   */
  validateContent(): boolean {
    try {
      const parsed = JSON.parse(this.content);
      return parsed && typeof parsed === 'object' && parsed.components;
    } catch {
      return false;
    }
  }

  /**
   * Checks if template is available for use
   */
  isAvailableForUse(): boolean {
    return this.isActive && this.validateContent();
  }

  /**
   * Gets the template components from JSON content
   */
  getComponents(): any[] {
    try {
      const parsed = JSON.parse(this.content);
      return parsed.components || [];
    } catch {
      return [];
    }
  }
}

export class TemplateDomainBuilder {
  id: number | null = null;
  name: string = '';
  type: TemplateTypeDomain = TemplateTypeDomain.RECEIPT;
  content: string = '';
  isActive: boolean = true;
  createdBy: number | null = null;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  withId(id: number | null): TemplateDomainBuilder {
    this.id = id;
    return this;
  }

  withName(name: string): TemplateDomainBuilder {
    this.name = name;
    return this;
  }

  withType(type: TemplateTypeDomain): TemplateDomainBuilder {
    this.type = type;
    return this;
  }

  withContent(content: string): TemplateDomainBuilder {
    this.content = content;
    return this;
  }

  withIsActive(isActive: boolean): TemplateDomainBuilder {
    this.isActive = isActive;
    return this;
  }

  withCreatedBy(createdBy: number | null): TemplateDomainBuilder {
    this.createdBy = createdBy;
    return this;
  }

  withCreatedAt(createdAt: Date): TemplateDomainBuilder {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): TemplateDomainBuilder {
    this.updatedAt = updatedAt;
    return this;
  }

  build(): TemplateDomainEntity {
    return TemplateDomainEntity.buildFromBuilder(this);
  }
}