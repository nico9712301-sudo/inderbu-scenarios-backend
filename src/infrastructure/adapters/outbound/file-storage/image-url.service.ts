import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageUrlService {
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

    if (!publicUrl) {
      throw new Error('Variable de entorno R2_PUBLIC_URL es requerida');
    }

    this.publicUrl = publicUrl;
  }

  getPublicUrl(path: string): string {
    if (!path) {
      return '';
    }

    // Si el path ya es una URL completa, retornarlo tal como está
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Si el path empieza con '/', removerlo para evitar URLs dobles
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // Construir URL completa
    const baseUrl = this.publicUrl.endsWith('/')
      ? this.publicUrl.slice(0, -1)
      : this.publicUrl;
    return `${baseUrl}/${cleanPath}`;
  }

  isLegacyPath(path: string): boolean {
    return path.startsWith('/temp/images/');
  }

  convertLegacyPath(legacyPath: string): string {
    if (!this.isLegacyPath(legacyPath)) {
      return legacyPath;
    }

    // Convertir "/temp/images/sub-scenarios/abc.jpg" a "sub-scenarios/abc.jpg"
    return legacyPath.replace('/temp/images/', '');
  }

  getR2Key(path: string): string {
    // Si es un legacy path, convertirlo primero
    if (this.isLegacyPath(path)) {
      return this.convertLegacyPath(path);
    }

    // Si es una URL completa, extraer solo la clave
    if (path.startsWith('http://') || path.startsWith('https://')) {
      try {
        const url = new URL(path);
        return url.pathname.substring(1); // Remover el '/' inicial
      } catch {
        return path;
      }
    }

    return path;
  }
}
