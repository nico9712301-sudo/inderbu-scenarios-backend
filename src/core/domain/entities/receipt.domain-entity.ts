import { Expose } from 'class-transformer';

export class ReceiptDomainEntity {
  @Expose()
  public readonly id: number | null;

  @Expose()
  public readonly fkReservationId: number;

  @Expose()
  public readonly fkTemplateId: number;

  @Expose()
  public readonly variablesValues: {
    hourlyPrice: number;
    totalCost: number;
  };

  @Expose()
  public readonly generatedAt: Date;

  @Expose()
  public readonly sentAt: Date | null;

  @Expose()
  public readonly sentToEmail: string | null;

  @Expose()
  public readonly createdAt: Date;

  @Expose()
  public readonly updatedAt: Date;

  private constructor(builder: ReceiptDomainBuilder) {
    this.id = builder.id;
    this.fkReservationId = builder.fkReservationId;
    this.fkTemplateId = builder.fkTemplateId;
    this.variablesValues = builder.variablesValues;
    this.generatedAt = builder.generatedAt;
    this.sentAt = builder.sentAt;
    this.sentToEmail = builder.sentToEmail;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static buildFromBuilder(builder: ReceiptDomainBuilder): ReceiptDomainEntity {
    return new ReceiptDomainEntity(builder);
  }

  static builder(): ReceiptDomainBuilder {
    return new ReceiptDomainBuilder();
  }

  /**
   * Checks if the receipt has been sent via email
   */
  hasBeenSent(): boolean {
    return this.sentAt !== null && this.sentToEmail !== null;
  }

  /**
   * Validates that the receipt data is complete
   */
  isValid(): boolean {
    return (
      this.fkReservationId > 0 &&
      this.fkTemplateId > 0 &&
      this.variablesValues &&
      typeof this.variablesValues.hourlyPrice === 'number' &&
      typeof this.variablesValues.totalCost === 'number' &&
      this.generatedAt instanceof Date
    );
  }

  /**
   * Checks if the receipt is ready to be sent
   */
  isReadyToSend(): boolean {
    return this.isValid();
  }

  /**
   * Marks the receipt as sent
   */
  markAsSent(email: string): ReceiptDomainEntity {
    return ReceiptDomainEntity.builder()
      .withId(this.id)
      .withFkReservationId(this.fkReservationId)
      .withFkTemplateId(this.fkTemplateId)
      .withVariablesValues(this.variablesValues)
      .withGeneratedAt(this.generatedAt)
      .withSentAt(new Date())
      .withSentToEmail(email)
      .withCreatedAt(this.createdAt)
      .withUpdatedAt(new Date())
      .build();
  }
}

export class ReceiptDomainBuilder {
  id: number | null = null;
  fkReservationId: number = 0;
  fkTemplateId: number = 0;
  variablesValues: { hourlyPrice: number; totalCost: number } = { hourlyPrice: 0, totalCost: 0 };
  generatedAt: Date = new Date();
  sentAt: Date | null = null;
  sentToEmail: string | null = null;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  withId(id: number | null): ReceiptDomainBuilder {
    this.id = id;
    return this;
  }

  withFkReservationId(fkReservationId: number): ReceiptDomainBuilder {
    this.fkReservationId = fkReservationId;
    return this;
  }

  withFkTemplateId(fkTemplateId: number): ReceiptDomainBuilder {
    this.fkTemplateId = fkTemplateId;
    return this;
  }

  withVariablesValues(variablesValues: { hourlyPrice: number; totalCost: number }): ReceiptDomainBuilder {
    this.variablesValues = variablesValues;
    return this;
  }

  withGeneratedAt(generatedAt: Date): ReceiptDomainBuilder {
    this.generatedAt = generatedAt;
    return this;
  }

  withSentAt(sentAt: Date | null): ReceiptDomainBuilder {
    this.sentAt = sentAt;
    return this;
  }

  withSentToEmail(sentToEmail: string | null): ReceiptDomainBuilder {
    this.sentToEmail = sentToEmail;
    return this;
  }

  withCreatedAt(createdAt: Date): ReceiptDomainBuilder {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): ReceiptDomainBuilder {
    this.updatedAt = updatedAt;
    return this;
  }

  build(): ReceiptDomainEntity {
    return ReceiptDomainEntity.buildFromBuilder(this);
  }
}