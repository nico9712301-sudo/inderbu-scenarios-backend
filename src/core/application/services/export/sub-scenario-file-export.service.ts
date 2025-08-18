import { Injectable } from '@nestjs/common';
import { SubScenarioDomainEntity } from 'src/core/domain/entities/sub-scenario.domain-entity';
import { ScenarioDomainEntity } from 'src/core/domain/entities/scenario.domain-entity';
import { ActivityAreaDomainEntity } from 'src/core/domain/entities/activity-area.domain-entity';
import * as XLSX from 'xlsx';
import { writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

export interface SubScenarioExportData {
  subScenarios: SubScenarioDomainEntity[];
  scenarios: Map<number, ScenarioDomainEntity>;
  activityAreas: Map<number, ActivityAreaDomainEntity>;
  includeFields?: string[];
}

export interface ExportResult {
  fileName: string;
  filePath: string;
  fileSize: number;
}

@Injectable()
export class SubScenarioFileExportService {
  private readonly exportsDir = join(process.cwd(), 'temp', 'exports');

  constructor() {
    this.ensureExportsDirectory();
  }

  private ensureExportsDirectory(): void {
    if (!existsSync(this.exportsDir)) {
      mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  async exportToExcel(data: SubScenarioExportData): Promise<ExportResult> {
    const { subScenarios, scenarios, activityAreas, includeFields } = data;

    // Preparar datos para Excel
    const excelData = this.prepareDataForExport(
      subScenarios,
      scenarios,
      activityAreas,
      includeFields,
    );

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 10 }, // ID
      { wch: 30 }, // Nombre
      { wch: 50 }, // Descripción
      { wch: 15 }, // Activo
      { wch: 25 }, // Escenario
      { wch: 25 }, // Área de Actividad
      { wch: 20 }, // Fecha Creación
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sub-Escenarios');

    // Generar archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `sub_escenarios_${timestamp}.xlsx`;
    const filePath = join(this.exportsDir, fileName);

    XLSX.writeFile(workbook, filePath);

    const fileSize = statSync(filePath).size;

    return {
      fileName,
      filePath,
      fileSize,
    };
  }

  async exportToCsv(data: SubScenarioExportData): Promise<ExportResult> {
    const { subScenarios, scenarios, activityAreas, includeFields } = data;

    // Preparar datos para CSV
    const csvData = this.prepareDataForExport(
      subScenarios,
      scenarios,
      activityAreas,
      includeFields,
    );

    // Crear workbook y convertir a CSV
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    // Generar archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `sub_escenarios_${timestamp}.csv`;
    const filePath = join(this.exportsDir, fileName);

    writeFileSync(filePath, csvContent, 'utf8');

    const fileSize = statSync(filePath).size;

    return {
      fileName,
      filePath,
      fileSize,
    };
  }

  private prepareDataForExport(
    subScenarios: SubScenarioDomainEntity[],
    scenarios: Map<number, ScenarioDomainEntity>,
    activityAreas: Map<number, ActivityAreaDomainEntity>,
    includeFields?: string[],
  ): any[] {
    return subScenarios.map((subScenario) => {
      const scenario = subScenario.scenarioId
        ? scenarios.get(subScenario.scenarioId)
        : null;

      const activityArea = subScenario.activityAreaId
        ? activityAreas.get(subScenario.activityAreaId)
        : null;

      const fullData = {
        ID: subScenario.id,
        Nombre: subScenario.name,
        Activo: subScenario.active ? 'Sí' : 'No',
        Escenario: scenario?.name || 'Sin escenario',
        'Área de Actividad': activityArea?.name || 'Sin área',
        'Fecha Creación': subScenario.createdAt
          ? new Date(subScenario.createdAt).toLocaleDateString('es-CL')
          : '',
      };

      // Si se especifican campos, filtrar
      if (includeFields && includeFields.length > 0) {
        const filteredData: any = {};

        includeFields.forEach((field) => {
          switch (field) {
            case 'id':
              filteredData['ID'] = fullData['ID'];
              break;
            case 'name':
              filteredData['Nombre'] = fullData['Nombre'];
              break;
            case 'description':
              filteredData['Descripción'] = fullData['Descripción'];
              break;
            case 'active':
              filteredData['Activo'] = fullData['Activo'];
              break;
            case 'scenario.name':
              filteredData['Escenario'] = fullData['Escenario'];
              break;
            case 'activityArea.name':
              filteredData['Área de Actividad'] = fullData['Área de Actividad'];
              break;
            case 'capacity':
              filteredData['Capacidad'] = fullData['Capacidad'];
              break;
            case 'costPerHour':
              filteredData['Costo'] = fullData['Costo'];
              break;
            case 'createdAt':
              filteredData['Fecha Creación'] = fullData['Fecha Creación'];
              break;
          }
        });

        return filteredData;
      }

      return fullData;
    });
  }

  getFilePath(fileName: string): string {
    return join(this.exportsDir, fileName);
  }

  fileExists(fileName: string): boolean {
    const filePath = this.getFilePath(fileName);
    return existsSync(filePath);
  }

  getFileSize(fileName: string): number {
    const filePath = this.getFilePath(fileName);
    if (!existsSync(filePath)) return 0;
    return statSync(filePath).size;
  }

  cleanupOldFiles(olderThanHours = 24): number {
    // Esta funcionalidad se puede implementar como una tarea cron
    // Por ahora dejamos la estructura básica
    return 0;
  }
}
