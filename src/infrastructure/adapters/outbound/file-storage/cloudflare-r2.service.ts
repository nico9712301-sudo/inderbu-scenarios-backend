import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CloudflareR2Service {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    const bucketName = this.configService.get<string>('R2_BUCKET_NAME');

    if (!endpoint) {
      throw new Error('Variable de entorno R2_ENDPOINT es requerida');
    }
    if (!accessKeyId) {
      throw new Error('Variable de entorno R2_ACCESS_KEY_ID es requerida');
    }
    if (!secretAccessKey) {
      throw new Error('Variable de entorno R2_SECRET_ACCESS_KEY es requerida');
    }
    if (!bucketName) {
      throw new Error('Variable de entorno R2_BUCKET_NAME es requerida');
    }

    this.bucketName = bucketName;

    this.client = new S3Client({
      endpoint,
      region: 'auto',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folderPath?: string,
    bucketName?: string,
  ): Promise<string> {
    if (!file) {
      throw new Error('Archivo inválido: no se proporcionó archivo');
    }

    let fileExtension = '';
    if (file.originalname && file.originalname.includes('.')) {
      fileExtension = file.originalname.split('.').pop() || '';
    } else if (file.mimetype) {
      const mimeToExt = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      fileExtension = mimeToExt[file.mimetype] || 'jpg';
    } else {
      fileExtension = 'jpg';
    }

    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = folderPath ? `${folderPath}/${fileName}` : fileName;

    let fileData: Buffer;
    if (file.buffer) {
      fileData = file.buffer;
    } else if (file.path) {
      const fs = require('fs');
      fileData = fs.readFileSync(file.path);
    } else {
      throw new Error('Archivo inválido: no tiene buffer ni path');
    }

    if (!fileData || fileData.length === 0) {
      throw new Error('Archivo inválido: datos vacíos');
    }

    const targetBucket = bucketName || this.bucketName;

    const command = new PutObjectCommand({
      Bucket: targetBucket,
      Key: key,
      Body: fileData,
      ContentType: file.mimetype || 'application/octet-stream',
    });

    try {
      await this.client.send(command);
      return key;
    } catch (error) {
      console.error(`Error al subir archivo a R2: ${error.message}`);
      throw new Error(`No se pudo subir el archivo a R2: ${error.message}`);
    }
  }

  async deleteFile(key: string, bucketName?: string): Promise<boolean> {
    if (!key) return false;

    try {
      const targetBucket = bucketName || this.bucketName;
      const command = new DeleteObjectCommand({
        Bucket: targetBucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error(`Error al eliminar el archivo ${key} de R2:`, error);
      return false;
    }
  }

  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Downloads a file from R2 by key
   */
  async downloadFile(key: string, bucketName?: string): Promise<Buffer> {
    if (!key) {
      throw new Error('Key is required to download file');
    }

    try {
      const targetBucket = bucketName || this.bucketName;
      const command = new GetObjectCommand({
        Bucket: targetBucket,
        Key: key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error('No se pudo descargar el archivo desde R2');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as Readable;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      throw new Error(
        `Error al descargar archivo desde R2: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }

  /**
   * Extracts the R2 key from a full URL or returns the key if it's already a key
   */
  extractKeyFromUrl(url: string): string {
    // If URL contains bucket name, extract the key after it
    if (url.includes(this.bucketName + '/')) {
      return url.split(this.bucketName + '/').pop() || url;
    }
    // If it's already a key (no http/https), return as is
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url;
    }
    // Otherwise, try to extract from URL path
    try {
      const urlObj = new URL(url);
      // Remove leading slash from pathname
      return urlObj.pathname.substring(1);
    } catch {
      // If URL parsing fails, return the original string
      return url;
    }
  }
}
