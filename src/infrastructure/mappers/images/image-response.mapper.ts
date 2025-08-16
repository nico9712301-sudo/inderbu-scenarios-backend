import { SubScenarioImageDomainEntity } from 'src/core/domain/entities/sub-scenario-image.domain-entity';
import { SubScenarioImageResponseDto } from 'src/infrastructure/adapters/inbound/http/dtos/images/image-response.dto';

export class SubScenarioImageResponseMapper {
  static toDto(domain: SubScenarioImageDomainEntity): SubScenarioImageResponseDto {
    const dto = new SubScenarioImageResponseDto();
    dto.id = domain.id!;
    dto.path = domain.path;
    
    // Construir URL completa (asumiendo que esto es un path relativo)
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
