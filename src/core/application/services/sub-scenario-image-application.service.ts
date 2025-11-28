import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { SubScenarioImageResponseDto } from '../../../infrastructure/adapters/inbound/http/dtos/images/image-response.dto';
import { ISubScenarioImageRepositoryPort } from '../../domain/ports/outbound/sub-scenario-image-repository.port';
import { FileStorageService } from '../../../infrastructure/adapters/outbound/file-storage/file-storage.service';
import { ISubScenarioRepositoryPort } from '../../domain/ports/outbound/sub-scenario-repository.port';
import { SubScenarioImageDomainEntity } from '../../domain/entities/sub-scenario-image.domain-entity';
import { SubScenarioImageResponseMapper } from '../../../infrastructure/mappers/images/image-response.mapper';
import { ISubScenarioImageApplicationPort } from '../ports/inbound/sub-scenario-image-application.port';
import { UpdateImageDto } from '../../../infrastructure/adapters/inbound/http/dtos/images/update-image.dto';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class SubScenarioImageApplicationService
  implements ISubScenarioImageApplicationPort
{
  constructor(
    @Inject(REPOSITORY_PORTS.SUB_SCENARIO_IMAGE)
    private readonly imageRepository: ISubScenarioImageRepositoryPort,
    @Inject(REPOSITORY_PORTS.SUB_SCENARIO)
    private readonly subScenarioRepository: ISubScenarioRepositoryPort,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async uploadImage(
    subScenarioId: number,
    file: Express.Multer.File,
    isFeature: boolean = false,
    displayOrder: number = 0,
  ): Promise<SubScenarioImageResponseDto> {
    // Verificar que el sub-escenario exista
    const subScenario =
      await this.subScenarioRepository.findById(subScenarioId);
    if (!subScenario) {
      throw new NotFoundException(
        `SubScenario con ID ${subScenarioId} no encontrado`,
      );
    }

    // Guardar el archivo utilizando el servicio de almacenamiento
    const relativePath = await this.fileStorageService.saveFile(file);

    // Si es una imagen principal y hay otras imágenes, obtener la última posición
    let order = displayOrder;
    if (!isFeature && displayOrder === 0) {
      // Solo obtener imágenes actuales para calcular el orden
      const existingImages = await this.imageRepository.findBySubScenarioId(
        subScenarioId,
        false,
      );
      if (existingImages.length > 0) {
        const maxOrder = Math.max(
          ...existingImages.map((img) => img.displayOrder),
        );
        order = maxOrder + 1;
      }
    }

    // Marcar como históricas SOLO las imágenes que ocupan la misma posición
    // Si subo featured (displayOrder=0), solo marca featured anterior como histórica
    // Si subo additional (displayOrder=1), solo marca additional1 anterior como histórica
    await this.imageRepository.markAsHistoricalByPosition(
      subScenarioId,
      isFeature,
      order,
    );

    // Crear y guardar la nueva entidad de imagen (por defecto current: true)
    const imageDomain = SubScenarioImageDomainEntity.builder()
      .withPath(relativePath)
      .withIsFeature(isFeature)
      .withDisplayOrder(order)
      .withSubScenarioId(subScenarioId)
      .withCurrent(true) // Explícitamente marcar como actual
      .build();

    const savedImage = await this.imageRepository.save(imageDomain);
    return SubScenarioImageResponseMapper.toDto(savedImage);
  }

  async getImagesBySubScenarioId(
    subScenarioId: number,
    includeHistorical: boolean = false,
  ): Promise<SubScenarioImageResponseDto[]> {
    const images = await this.imageRepository.findBySubScenarioId(
      subScenarioId,
      includeHistorical,
    );
    return images.map((image) => SubScenarioImageResponseMapper.toDto(image));
  }

  async updateImage(
    imageId: number,
    updateDto: UpdateImageDto,
  ): Promise<SubScenarioImageResponseDto> {
    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      throw new NotFoundException(`Imagen con ID ${imageId} no encontrada`);
    }

    const updatedImage = SubScenarioImageDomainEntity.builder()
      .withId(image.id!)
      .withPath(image.path)
      .withIsFeature(
        updateDto.isFeature !== undefined
          ? updateDto.isFeature
          : image.isFeature,
      )
      .withDisplayOrder(
        updateDto.displayOrder !== undefined
          ? updateDto.displayOrder
          : image.displayOrder,
      )
      .withSubScenarioId(image.subScenarioId)
      .withCurrent(image.current) // Preservar estado current
      .withCreatedAt(image.createdAt ?? new Date())
      .build();

    const savedImage = await this.imageRepository.save(updatedImage);
    return SubScenarioImageResponseMapper.toDto(savedImage);
  }

  async manageImages(
    subScenarioId: number,
    imageUpdates: {
      featured?: Express.Multer.File;
      additional1?: Express.Multer.File;
      additional2?: Express.Multer.File;
    },
  ): Promise<SubScenarioImageResponseDto[]> {
    // Verificar que el sub-escenario exista
    const subScenario =
      await this.subScenarioRepository.findById(subScenarioId);
    if (!subScenario) {
      throw new NotFoundException(
        `SubScenario con ID ${subScenarioId} no encontrado`,
      );
    }

    const results: SubScenarioImageResponseDto[] = [];

    // Obtener las imágenes actuales para verificar qué posiciones tienen imágenes
    const currentImages = await this.imageRepository.findBySubScenarioId(
      subScenarioId,
      false,
    );

    // Crear un mapa de posiciones con imágenes actuales
    const currentImagesByPosition = new Map<string, boolean>();
    for (const image of currentImages) {
      let positionKey: string;
      if (image.isFeature) {
        positionKey = 'featured';
      } else if (image.displayOrder === 1) {
        positionKey = 'additional1';
      } else if (image.displayOrder === 2) {
        positionKey = 'additional2';
      } else {
        // Skip images with unexpected displayOrder
        continue;
      }
      currentImagesByPosition.set(positionKey, true);
    }

    // Definir las posiciones posibles
    const positions = [
      { key: 'featured', isFeature: true, displayOrder: 0 },
      { key: 'additional1', isFeature: false, displayOrder: 1 },
      { key: 'additional2', isFeature: false, displayOrder: 2 },
    ];

    for (const position of positions) {
      const file = imageUpdates[position.key as keyof typeof imageUpdates];

      if (file) {
        // Si se envía archivo, reemplazar la imagen en esta posición
        const result = await this.uploadImage(
          subScenarioId,
          file,
          position.isFeature,
          position.displayOrder,
        );
        results.push(result);
      } else {
        // Si NO se envía archivo Y existe una imagen actual en esta posición, marcarla como histórica
        const hasCurrentImage = currentImagesByPosition.get(position.key);
        if (hasCurrentImage) {
          await this.imageRepository.markAsHistoricalByPosition(
            subScenarioId,
            position.isFeature,
            position.displayOrder,
          );
        }
        // Si no hay imagen actual en esta posición, no hacer nada
      }
    }

    return results;
  }

  async deleteImage(imageId: number): Promise<void> {
    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      throw new NotFoundException(`Imagen con ID ${imageId} no encontrada`);
    }

    // Mark image as historical (current: false)
    const updatedImage = SubScenarioImageDomainEntity.builder()
      .withId(image.id!)
      .withPath(image.path)
      .withIsFeature(image.isFeature)
      .withDisplayOrder(image.displayOrder)
      .withSubScenarioId(image.subScenarioId)
      .withCurrent(false) // Mark as historical
      .withCreatedAt(image.createdAt ?? new Date())
      .build();

    await this.imageRepository.save(updatedImage);
  }
}
