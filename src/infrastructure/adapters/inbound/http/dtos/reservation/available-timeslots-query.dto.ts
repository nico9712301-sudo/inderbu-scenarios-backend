import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class AvailableTimeslotsQueryDto {
  @ApiProperty({
    description: 'ID del sub-escenario',
    example: 16,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly subScenarioId: number;

  @ApiProperty({
    description: 'Fecha inicial para consultar disponibilidad (YYYY-MM-DD)',
    example: '2025-06-10',
    type: String,
  })
  @IsDateString()
  readonly initialDate: string;

  @ApiPropertyOptional({
    description:
      'Fecha final para consultar disponibilidad (YYYY-MM-DD). Si no se especifica, consulta solo initialDate',
    example: '2025-06-20',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  readonly finalDate?: string;

  @ApiPropertyOptional({
    description:
      'Días de semana específicos separados por comas (0=Domingo, 1=Lunes, ..., 6=Sábado)',
    example: '1,3,5',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+(,\d+)*$/, {
    message: 'weekdays must be comma-separated numbers between 0-6',
  })
  readonly weekdays?: string;

  /**
   * Computed property para convertir string de weekdays a array de números
   */
  get weekdaysArray(): number[] | undefined {
    if (!this.weekdays) return undefined;

    const parsed = this.weekdays.split(',').map((w) => parseInt(w.trim()));

    // Validar que todos los valores estén entre 0-6
    const validWeekdays = parsed.filter((w) => w >= 0 && w <= 6);

    return validWeekdays.length > 0 ? validWeekdays : undefined;
  }

  /**
   * Validation method para lógica de negocio
   */
  validate(): string[] {
    const errors: string[] = [];

    // Si hay finalDate, debe ser posterior a initialDate
    if (this.finalDate && this.finalDate <= this.initialDate) {
      errors.push('finalDate must be after initialDate');
    }

    // Si hay weekdays pero no finalDate, no tiene sentido
    if (this.weekdays && !this.finalDate) {
      errors.push(
        'weekdays parameter only applies when finalDate is specified',
      );
    }

    // Validar weekdays values
    if (this.weekdays) {
      const parsed = this.weekdaysArray;
      if (!parsed || parsed.length === 0) {
        errors.push('weekdays must contain at least one valid day (0-6)');
      }
    }

    return errors;
  }

  /**
   * Helper para determinar el tipo de consulta
   */
  get queryType(): 'SINGLE' | 'RANGE' {
    return this.finalDate ? 'RANGE' : 'SINGLE';
  }

  /**
   * Helper para logging/debugging
   */
  toString(): string {
    const parts = [
      `subScenarioId=${this.subScenarioId}`,
      `initialDate=${this.initialDate}`,
    ];

    if (this.finalDate) {
      parts.push(`finalDate=${this.finalDate}`);
    }

    if (this.weekdays) {
      parts.push(`weekdays=${this.weekdays}`);
    }

    return parts.join('&');
  }
}
