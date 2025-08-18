import { plainToInstance } from 'class-transformer';
import { ReservationStateDto } from 'src/infrastructure/adapters/inbound/http/dtos/reservation/base-reservation.dto';
import { ReservationStateDomainEntity } from 'src/core/domain/entities/reservation-state.domain-entity';

export class ReservationStateResponseMapper {
  static toDto(domain: ReservationStateDomainEntity): ReservationStateDto {
    return plainToInstance(
      ReservationStateDto,
      {
        id: domain.id,
        name: domain.name,
        description: `Estado: ${domain.name}`, // Descripción básica
      },
      { excludeExtraneousValues: true },
    );
  }
}
