import { Expose } from 'class-transformer';

export class TimeSlotDomainEntity {
  @Expose()
  readonly id: number | null;
  @Expose()
  readonly startTime: string;
  @Expose()
  readonly endTime: string;

  constructor(builder: TimeSlotDomainBuilder) {
    this.id = builder.id;
    this.startTime = builder.startTime;
    this.endTime = builder.endTime;
  }

  static builder(): TimeSlotDomainBuilder {
    return new TimeSlotDomainBuilder();
  }
}

export class TimeSlotDomainBuilder {
  id: number | null = null;
  startTime: string;
  endTime: string;

  withId(id: number): this {
    this.id = id;
    return this;
  }

  withStartTime(time: string): this {
    this.startTime = time;
    return this;
  }

  withEndTime(time: string): this {
    this.endTime = time;
    return this;
  }

  build(): TimeSlotDomainEntity {
    return new TimeSlotDomainEntity(this);
  }
}
