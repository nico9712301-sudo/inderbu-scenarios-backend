import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
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

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
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

  async deleteFile(key: string): Promise<boolean> {
    if (!key) return false;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
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
}
