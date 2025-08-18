import { HomeSlideApplicationService } from 'src/core/application/services/home-slide-application.service';
import { GetHomeSlidesUseCase } from 'src/core/application/use-cases/home-slide/get-home-slides.use-case';
import { ManageHomeSlidesUseCase } from 'src/core/application/use-cases/home-slide/manage-home-slides.use-case';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.HOME_SLIDE,
    useClass: HomeSlideApplicationService,
  },
  GetHomeSlidesUseCase,
  ManageHomeSlidesUseCase,
];