import { Injectable } from '@nestjs/common';
import { SubScenarioImageDomainEntity } from '../../../core/domain/entities/sub-scenario-image.domain-entity';
import { SubScenarioImageResponseDto } from '../../adapters/inbound/http/dtos/images/image-response.dto';
import { ImageUrlService } from '../../adapters/outbound/file-storage/image-url.service';

@Injectable()
export class SubScenarioImageResponseMapper {
  constructor(private readonly imageUrlService: ImageUrlService) {}

  toDto(domain: SubScenarioImageDomainEntity): SubScenarioImageResponseDto {
    const dto = new SubScenarioImageResponseDto();
    dto.id = domain.id!;
    dto.path = domain.path;

    // Construir URL completa usando ImageUrlService
    dto.url = this.imageUrlService.getPublicUrl(domain.path);

    dto.isFeature = domain.isFeature;
    dto.displayOrder = domain.displayOrder;
    dto.subScenarioId = domain.subScenarioId;
    dto.current = domain.current;
    dto.createdAt = domain.createdAt;
    return dto;
  }

  // Mantener método estático por compatibilidad temporal
  static toDto(domain: SubScenarioImageDomainEntity): SubScenarioImageResponseDto {
    const dto = new SubScenarioImageResponseDto();
    dto.id = domain.id!;
    dto.path = domain.path;

    // Construir URL completa (legacy - fallback)
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    dto.url = `${baseUrl}${domain.path}`;

    dto.isFeature = domain.isFeature;
    dto.displayOrder = domain.displayOrder;
    dto.subScenarioId = domain.subScenarioId;
    dto.current = domain.current;
    dto.createdAt = domain.createdAt;
    return dto;
  }
}
