import { Command } from 'nestjs-command';
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { SubScenarioImageEntity } from '../../persistence/image.entity';
import { HomeSlideEntity } from '../../persistence/home-slide.entity';
import { CloudflareR2Service } from '../../adapters/outbound/file-storage/cloudflare-r2.service';
import { ImageUrlService } from '../../adapters/outbound/file-storage/image-url.service';
import { MYSQL_REPOSITORY } from '../../tokens/repositories';

@Injectable()
export class MigrateImagesToR2Command {
  constructor(
    @Inject(MYSQL_REPOSITORY.SUB_SCENARIO_IMAGE)
    private readonly imageRepository: Repository<SubScenarioImageEntity>,
    @Inject(MYSQL_REPOSITORY.HOME_SLIDE)
    private readonly homeSlideRepository: Repository<HomeSlideEntity>,
    private readonly r2Service: CloudflareR2Service,
    private readonly imageUrlService: ImageUrlService,
  ) {}

  @Command({
    command: 'migrate:images-r2',
    describe:
      'Migra imágenes locales a Cloudflare R2 y actualiza referencias en BD',
  })
  async migrate(): Promise<void> {
    console.log('🚀 Iniciando migración de imágenes a Cloudflare R2...\n');

    let totalMigrated = 0;
    let totalErrors = 0;

    try {
      // Migrar imágenes de sub-escenarios
      const subScenarioImages = await this.imageRepository.find({
        where: { current: true },
      });

      console.log(
        `📷 Encontradas ${subScenarioImages.length} imágenes de sub-escenarios a migrar`,
      );

      for (const imageEntity of subScenarioImages) {
        try {
          // Determinar ruta local basada en si es legacy o R2 path
          let localPath: string;
          if (this.imageUrlService.isLegacyPath(imageEntity.path)) {
            // Path legacy: /temp/images/sub-scenarios/image2.jpeg
            localPath = this.getLocalFilePath(imageEntity.path);
          } else {
            // Path R2: sub-scenarios/image2.jpeg → buscar en /temp/images/sub-scenarios/image2.jpeg
            localPath = path.join(
              process.cwd(),
              'temp',
              'images',
              imageEntity.path,
            );
          }

          if (!fs.existsSync(localPath)) {
            console.log(`  Archivo no encontrado: ${localPath}`);
            totalErrors++;
            continue;
          }

          // Crear buffer del archivo
          const fileBuffer = fs.readFileSync(localPath);
          const fileName = path.basename(localPath);
          const fileExtension = path.extname(fileName).substring(1);

          // Simular Express.Multer.File
          const mockFile: Express.Multer.File = {
            buffer: fileBuffer,
            originalname: fileName,
            mimetype: this.getMimeType(fileExtension),
            size: fileBuffer.length,
            fieldname: 'file',
            encoding: '7bit',
            destination: '',
            filename: fileName,
            path: localPath,
            stream: null as any,
          };

          // Subir a R2
          const r2Key = await this.r2Service.uploadFile(
            mockFile,
            'sub-scenarios',
          );

          // Solo actualizar BD si cambió el path
          if (imageEntity.path !== r2Key) {
            await this.imageRepository.update(imageEntity.id, { path: r2Key });
          }

          console.log(
            `✅ Subida imagen ${imageEntity.id}: ${imageEntity.path} → R2 (${r2Key})`,
          );
          totalMigrated++;

          // Opcional: eliminar archivo local tras migración exitosa
          // fs.unlinkSync(localPath);
        } catch (error) {
          console.error(
            `Error migrando imagen ${imageEntity.id}: ${error.message}`,
          );
          totalErrors++;
        }
      }

      // Migrar home slides
      const homeSlides = await this.homeSlideRepository.find({
        where: { isActive: true },
      });

      console.log(`\n🏠 Encontrados ${homeSlides.length} home slides a migrar`);

      for (const slideEntity of homeSlides) {
        try {
          // Determinar ruta local basada en si es legacy o R2 path
          let localPath: string;
          if (this.imageUrlService.isLegacyPath(slideEntity.imageUrl)) {
            // Path legacy: /temp/images/home/slide-1.jpg
            localPath = this.getLocalFilePath(slideEntity.imageUrl);
          } else {
            // Path R2: home/slide-1.jpg → buscar en /temp/images/home/slide-1.jpg
            localPath = path.join(
              process.cwd(),
              'temp',
              'images',
              slideEntity.imageUrl,
            );
          }

          if (!fs.existsSync(localPath)) {
            console.log(`  Archivo no encontrado: ${localPath}`);
            totalErrors++;
            continue;
          }

          // Crear buffer del archivo
          const fileBuffer = fs.readFileSync(localPath);
          const fileName = path.basename(localPath);
          const fileExtension = path.extname(fileName).substring(1);

          // Simular Express.Multer.File
          const mockFile: Express.Multer.File = {
            buffer: fileBuffer,
            originalname: fileName,
            mimetype: this.getMimeType(fileExtension),
            size: fileBuffer.length,
            fieldname: 'file',
            encoding: '7bit',
            destination: '',
            filename: fileName,
            path: localPath,
            stream: null as any,
          };

          // Subir a R2
          const r2Key = await this.r2Service.uploadFile(mockFile, 'home');

          // Solo actualizar BD si cambió el path
          if (slideEntity.imageUrl !== r2Key) {
            await this.homeSlideRepository.update(slideEntity.id, {
              imageUrl: r2Key,
            });
          }

          console.log(
            `✅ Subida home slide ${slideEntity.id}: ${slideEntity.imageUrl} → R2 (${r2Key})`,
          );
          totalMigrated++;
        } catch (error) {
          console.error(
            `Error migrando home slide ${slideEntity.id}: ${error.message}`,
          );
          totalErrors++;
        }
      }
    } catch (error) {
      console.error(`💥 Error fatal durante migración: ${error.message}`);
      throw error;
    }

    console.log(`\n📊 Resumen de migración:`);
    console.log(`✅ Archivos migrados exitosamente: ${totalMigrated}`);
    console.log(`Errores encontrados: ${totalErrors}`);

    if (totalErrors === 0) {
      console.log(`\n¡Migración completada exitosamente!`);
      console.log(
        `💡 Ahora puedes eliminar los archivos locales en temp/images/`,
      );
    } else {
      console.log(
        `\n  Migración completada con errores. Revisa los logs anteriores.`,
      );
    }
  }

  private getLocalFilePath(dbPath: string): string {
    // Convertir path BD a ruta local del archivo
    // "/temp/images/sub-scenarios/abc.jpg" → "process.cwd()/temp/images/sub-scenarios/abc.jpg"
    if (dbPath.startsWith('/temp/')) {
      return path.join(process.cwd(), dbPath);
    }
    return path.join(process.cwd(), 'temp', 'images', dbPath);
  }

  private getMimeType(extension: string): string {
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
