import { JsonLoaderStrategy } from '../../../core/application/services/seeding/strategies/json-loader.strategy';
import { DATA_LOADER } from '../../tokens/data-loader';

export const loaderStrategyProviders = [
  {
    provide: DATA_LOADER.JSON,
    useClass: JsonLoaderStrategy,
  },
];
