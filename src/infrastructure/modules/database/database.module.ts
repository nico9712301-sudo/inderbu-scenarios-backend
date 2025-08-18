import { Module } from '@nestjs/common';

import { databaseProviders } from '../../providers/database/database.providers';
import { FulltextIndexProvider } from './fulltext.provider';

@Module({
  providers: [
    ...databaseProviders,
    FulltextIndexProvider, // <‑‑ el que crea índices al iniciar
  ],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
