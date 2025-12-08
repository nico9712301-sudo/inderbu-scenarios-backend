import { Injectable } from '@nestjs/common';
import { HomeSlideEntity } from '../../persistence/home-slide.entity';
import { HomeSlideResponseDto } from '../../adapters/inbound/http/dtos/home-slide/home-slide-response.dto';
import { ImageUrlService } from '../../adapters/outbound/file-storage/image-url.service';
import { HomeSlideType } from '../../../core/domain/entities/home-slide/home-slide.entity';

@Injectable()
export class HomeSlideResponseMapper {
  constructor(private readonly imageUrlService: ImageUrlService) {}

  toDto(entity: HomeSlideEntity): HomeSlideResponseDto {
    const dto = new HomeSlideResponseDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.description = entity.description;
    // Construir URL completa usando ImageUrlService
    dto.imageUrl = this.imageUrlService.getPublicUrl(entity.imageUrl);
    dto.displayOrder = entity.displayOrder;
    dto.isActive = entity.isActive;
    // Mapeo de SlideType (persistence) a HomeSlideType (domain)
    dto.slideType = entity.slideType as unknown as HomeSlideType;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;

    return dto;
  }

  // Mantener método estático por compatibilidad
  static toDto(entity: HomeSlideEntity): HomeSlideResponseDto {
    const dto = new HomeSlideResponseDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.imageUrl = entity.imageUrl; // Legacy: sin construcción de URL
    dto.displayOrder = entity.displayOrder;
    dto.isActive = entity.isActive;
    // Mapeo de SlideType (persistence) a HomeSlideType (domain)
    dto.slideType = entity.slideType as unknown as HomeSlideType;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;

    return dto;
  }
}
