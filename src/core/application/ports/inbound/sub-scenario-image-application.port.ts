import { SubScenarioImageResponseDto } from '../../../../infrastructure/adapters/inbound/http/dtos/images/image-response.dto';
import { UpdateImageDto } from '../../../../infrastructure/adapters/inbound/http/dtos/images/update-image.dto';

export interface ISubScenarioImageApplicationPort {
  uploadImage(
    subScenarioId: number,
    file: Express.Multer.File,
    isFeature?: boolean,
    displayOrder?: number,
  ): Promise<SubScenarioImageResponseDto>;

  getImagesBySubScenarioId(
    subScenarioId: number,
    includeHistorical?: boolean,
  ): Promise<SubScenarioImageResponseDto[]>;

  updateImage(
    imageId: number,
    updateDto: UpdateImageDto,
  ): Promise<SubScenarioImageResponseDto>;

  manageImages(
    subScenarioId: number,
    imageUpdates: {
      featured?: Express.Multer.File;
      additional1?: Express.Multer.File;
      additional2?: Express.Multer.File;
    },
  ): Promise<SubScenarioImageResponseDto[]>;

  deleteImage(imageId: number): Promise<void>;
}
