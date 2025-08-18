import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { HomeSlideEntity } from './home-slide.entity';

@Entity('entities')
export class EntityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500 })
  description?: string;

  @OneToMany(() => HomeSlideEntity, (homeSlide) => homeSlide.entity)
  homeSlides: HomeSlideEntity[];
}