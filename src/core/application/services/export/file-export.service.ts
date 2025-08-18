import { Injectable } from '@nestjs/common';
import { ScenarioDomainEntity } from 'src/core/domain/entities/scenario.domain-entity';
import { NeighborhoodDomainEntity } from 'src/core/domain/entities/neighborhood.domain-entity';
import * as XLSX from 'xlsx';
import { writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';
export interface ExportData {
  scenarios: ScenarioDomainEntity[];
  neighborhoods: Map<number, NeighborhoodDomainEntity>;
  includeFields?: string[];
}

export interface ExportResult {
  fileName: string;
  filePath: string;
  fileSize: number;
}

@Injectable()
export class FileExportService {
  private readonly exportsDir = join(process.cwd(), 'temp', 'exports');

  constructor() {
    this.ensureExportsDirectory();
  }

  private ensureExportsDirectory(): void {
    if (!existsSync(this.exportsDir)) {
      mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  async exportToExcel(data: ExportData): Promise<ExportResult> {
    const { scenarios, neighborhoods, includeFields } = data;

    // Preparar datos para Excel
    const excelData = this.prepareDataForExport(
      scenarios,
      neighborhoods,
      includeFields,
    );

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 10 }, // ID
      { wch: 30 }, // Nombre
      { wch: 40 }, // Dirección
      { wch: 15 }, // Activo
      { wch: 25 }, // Barrio
      { wch: 20 }, // Fecha Creación
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Escenarios');

    // Generar archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `escenarios_${timestamp}.xlsx`;
    const filePath = join(this.exportsDir, fileName);

    XLSX.writeFile(workbook, filePath);

    const fileSize = statSync(filePath).size;

    return {
      fileName,
      filePath,
      fileSize,
    };
  }

  async exportToCsv(data: ExportData): Promise<ExportResult> {
    const { scenarios, neighborhoods, includeFields } = data;

    // Preparar datos para CSV
    const csvData = this.prepareDataForExport(
      scenarios,
      neighborhoods,
      includeFields,
    );

    // Crear workbook y convertir a CSV
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    // Generar archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `escenarios_${timestamp}.csv`;
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
    scenarios: ScenarioDomainEntity[],
    neighborhoods: Map<number, NeighborhoodDomainEntity>,
    includeFields?: string[],
  ): any[] {
    return scenarios.map((scenario) => {
      const neighborhood = scenario.neighborhoodId
        ? neighborhoods.get(scenario.neighborhoodId)
        : null;

      const fullData = {
        ID: scenario.id,
        Nombre: scenario.name,
        Dirección: scenario.address,
        Activo: scenario.active ? 'Sí' : 'No',
        Barrio: neighborhood?.name || 'Sin barrio',
        Comuna: neighborhood?.commune?.name || 'Sin comuna',
        // 'Fecha Creación': scenario.createdAt ? new Date(scenario.createdAt).toLocaleDateString('es-CL') : '',
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
            case 'address':
              filteredData['Dirección'] = fullData['Dirección'];
              break;
            case 'active':
              filteredData['Activo'] = fullData['Activo'];
              break;
            case 'neighborhood.name':
              filteredData['Barrio'] = fullData['Barrio'];
              break;
            case 'neighborhood.commune.name':
              filteredData['Comuna'] = fullData['Comuna'];
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
