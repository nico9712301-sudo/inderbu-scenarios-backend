import { plainToInstance } from 'class-transformer';
import { ReservationStateDto } from '../../adapters/inbound/http/dtos/reservation/base-reservation.dto';
import { ReservationStateDomainEntity } from '../../../core/domain/entities/reservation-state.domain-entity';

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
