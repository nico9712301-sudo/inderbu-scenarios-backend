import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CloudflareR2Service } from './cloudflare-r2.service';

@Injectable()
export class FileStorageService {
  private readonly uploadDir = join(process.cwd(), 'temp/images/sub-scenarios');
  private readonly tempDir = join(process.cwd(), 'temp/images/sub-scenarios');

  constructor(private readonly r2Service: CloudflareR2Service) {
    // Asegurar que los directorios existan para backward compatibility
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Guarda un archivo en Cloudflare R2
   * @param file Archivo a guardar
   * @returns Clave relativa del archivo en R2 (sin dominio)
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      // Subir archivo a R2 - carpeta sub-scenarios
      const r2Key = await this.r2Service.uploadFile(file, 'sub-scenarios');

      // Limpiar archivo temporal si existe
      if (file.path && existsSync(file.path)) {
        try {
          unlinkSync(file.path);
        } catch (cleanupError) {
          console.warn(
            'No se pudo limpiar archivo temporal:',
            cleanupError.message,
          );
        }
      }

      // Retornar solo la clave (sin dominio): "sub-scenarios/uuid.ext"
      return r2Key;
    } catch (error) {
      console.error(`Error al guardar archivo: ${error.message}`);
      throw new Error(`No se pudo guardar el archivo: ${error.message}`);
    }
  }

  /**
   * Elimina un archivo de Cloudflare R2
   * @param r2Key Clave del archivo en R2
   * @returns true si se eliminó correctamente, false si no existía
   */
  async deleteFile(r2Key: string): Promise<boolean> {
    if (!r2Key) return false;

    try {
      // Si es un path legacy, convertir a key R2
      let keyToDelete = r2Key;
      if (r2Key.startsWith('/temp/images/')) {
        keyToDelete = r2Key.replace('/temp/images/', '');
      }

      return await this.r2Service.deleteFile(keyToDelete);
    } catch (error) {
      console.error(`Error al eliminar el archivo ${r2Key}:`, error);
      return false;
    }
  }

  /**
   * Método legacy para mantener compatibilidad con archivos locales durante migración
   */
  async deleteLocalFile(relativePath: string): Promise<boolean> {
    if (!relativePath) return false;

    try {
      let fullPath = '';
      if (relativePath.startsWith('/temp/')) {
        fullPath = join(process.cwd(), relativePath);
      } else {
        fullPath = join(process.cwd(), 'temp', relativePath);
      }

      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        `Error al eliminar el archivo local ${relativePath}:`,
        error,
      );
      return false;
    }
  }
}
