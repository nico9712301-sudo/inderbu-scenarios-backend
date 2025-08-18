import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileStorageService {
  private readonly uploadDir = join(process.cwd(), 'temp/images/sub-scenarios');
  private readonly tempDir = join(process.cwd(), 'temp/images/sub-scenarios');

  constructor() {
    // Asegurar que los directorios existan
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Guarda un archivo en el sistema de archivos
   * @param file Archivo a guardar
   * @returns Ruta relativa del archivo guardado
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    // Validar que el archivo exista
    if (!file) {
      throw new Error('Archivo inválido: no se proporcionó archivo');
    }

    // Obtener la extensión del archivo
    let fileExtension = '';
    if (file.originalname && file.originalname.includes('.')) {
      fileExtension = file.originalname.split('.').pop() || '';
    } else if (file.mimetype) {
      // Fallback: usar mimetype para determinar la extensión
      const mimeToExt = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      fileExtension = mimeToExt[file.mimetype] || 'jpg';
    } else {
      fileExtension = 'jpg'; // Default fallback
    }

    const fileName = `${uuidv4()}.${fileExtension}`;
    const relativePath = `/temp/images/sub-scenarios/${fileName}`;
    const fullPath = join(this.uploadDir, fileName);

    // Guardar el archivo usando writeFileSync
    try {
      let fileData: Buffer;
      let tempFilePath: string | null = null;

      if (file.buffer) {
        // Si tiene buffer, usarlo directamente
        fileData = file.buffer;
      } else if (file.path) {
        // Si tiene path, leer el archivo temporal
        const fs = require('fs');
        tempFilePath = file.path; // Guardar referencia para limpiar después
        fileData = fs.readFileSync(file.path);
      } else {
        throw new Error('Archivo inválido: no tiene buffer ni path');
      }

      if (!fileData || fileData.length === 0) {
        throw new Error('Archivo inválido: datos vacíos');
      }

      // Guardar el archivo en la ubicación final
      writeFileSync(fullPath, fileData);

      // Limpiar archivo temporal si existe
      if (tempFilePath && existsSync(tempFilePath)) {
        try {
          unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.warn(
            'No se pudo limpiar archivo temporal:',
            cleanupError.message,
          );
        }
      }

      return relativePath;
    } catch (error) {
      console.error(`Error al guardar archivo: ${error.message}`);
      throw new Error(`No se pudo guardar el archivo: ${error.message}`);
    }
  }

  /**
   * Elimina un archivo del sistema de archivos
   * @param relativePath Ruta relativa del archivo a eliminar
   * @returns true si se eliminó correctamente, false si no existía
   */
  async deleteFile(relativePath: string): Promise<boolean> {
    if (!relativePath) return false;

    try {
      // Ajustar la ruta si no incluye 'uploads'
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
      console.error(`Error al eliminar el archivo ${relativePath}:`, error);
      return false;
    }
  }
}
