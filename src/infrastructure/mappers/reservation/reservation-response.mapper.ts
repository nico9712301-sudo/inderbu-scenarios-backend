import { plainToInstance } from 'class-transformer';
import { ReservationWithDetailsResponseDto } from 'src/infrastructure/adapters/inbound/http/dtos/reservation/reservation.dto';
import { ReservationDomainEntity } from 'src/core/domain/entities/reservation.domain-entity';
import { UserEntityMapper } from '../user/user-entity.mapper';

export class ReservationResponseMapper {
  static toDetailsDto(
    domain: ReservationDomainEntity,
  ): ReservationWithDetailsResponseDto {
    // Extraer relaciones del domain entity (añadidas por el mapper de entidad)
    const user = (domain as any).user;
    const subScenario = (domain as any).subScenario;
    const reservationState = (domain as any).reservationState;
    const timeslots = (domain as any).timeslots || [];

    return plainToInstance(
      ReservationWithDetailsResponseDto,
      {
        id: domain.id!,
        type: domain.type.toString(),
        subScenarioId: domain.subScenarioId,
        userId: domain.userId,
        initialDate: domain.initialDate.toISOString().split('T')[0],
        finalDate: domain.finalDate?.toISOString().split('T')[0] || null,
        weekDays: domain.weekDays || null,
        comments: domain.comments || null,
        reservationStateId: domain.reservationStateId,

        // Mapear relaciones usando mappers específicos
        user: user
          ? {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              phone: user.phone || null,
            }
          : {
              id: domain.userId,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@email.com',
              phone: null,
            },

        subScenario: subScenario
          ? {
              id: subScenario.id,
              name: subScenario.name,
              description: subScenario.description || null,
              // Información adicional que espera el frontend
              hasCost: subScenario.hasCost || false,
              numberOfSpectators: subScenario.numberOfSpectators || null,
              numberOfPlayers: subScenario.numberOfPlayers || null,
              recommendations: subScenario.recommendations || null,
              scenarioId: subScenario.scenarioId || null,
              scenarioName: subScenario.scenario?.name || 'Unknown Scenario',
              // Información completa del scenario que necesita el frontend
              scenario: subScenario.scenario
                ? {
                    id: subScenario.scenario.id,
                    name: subScenario.scenario.name,
                    address:
                      subScenario.scenario.address || 'Dirección no disponible',
                    neighborhood: subScenario.scenario.neighborhood
                      ? {
                          id: subScenario.scenario.neighborhood.id,
                          name: subScenario.scenario.neighborhood.name,
                          commune: subScenario.scenario.neighborhood.commune
                            ? {
                                id: subScenario.scenario.neighborhood.commune
                                  .id,
                                name: subScenario.scenario.neighborhood.commune
                                  .name,
                                city: subScenario.scenario.neighborhood.commune
                                  .city
                                  ? {
                                      id: subScenario.scenario.neighborhood
                                        .commune.city.id,
                                      name: subScenario.scenario.neighborhood
                                        .commune.city.name,
                                    }
                                  : null,
                              }
                            : null,
                        }
                      : null,
                  }
                : null,
            }
          : {
              id: domain.subScenarioId,
              name: 'Unknown SubScenario',
              description: null,
              scenario: null,
            },

        reservationState: reservationState
          ? {
              id: reservationState.id,
              name: reservationState.state, // Conversion: entity.state -> DTO.name
              description: `Estado: ${reservationState.state}`,
            }
          : {
              id: domain.reservationStateId,
              name: 'PENDIENTE',
              description: 'Estado: PENDIENTE',
            },

        timeslots: timeslots.map((ts: any) => ({
          id: ts.timeslot?.id || ts.id,
          startTime: ts.timeslot?.startTime || '00:00:00',
          endTime: ts.timeslot?.endTime || '23:59:59',
          isAvailable: true,
        })),

        totalInstances: (domain as any).instances?.length || 0,
        createdAt: domain.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: domain.updatedAt?.toISOString() || new Date().toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }
}
