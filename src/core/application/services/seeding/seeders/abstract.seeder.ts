import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

export abstract class AbstractSeeder<T extends Record<string, any>, Seed> {
  protected logger = new Logger(this.constructor.name);

  constructor(protected repository: Repository<T>) {}

  async seed(): Promise<void> {
    if (await this.alreadySeeded()) {
      this.logger.warn(`${this.constructor.name} ya fue sembrado.`);
      return;
    }
    const seeds = await this.getSeeds();
    const entities = await this.transform(seeds);
    await this.repository.save(entities);
    this.logger.log(`${entities.length} ${this.constructor.name} sembrados.`);
  }

  protected abstract alreadySeeded(): Promise<boolean>;
  protected abstract getSeeds(): Promise<Seed[]>;
  protected abstract transform(seeds: Seed[]): Promise<T[]>;
}
