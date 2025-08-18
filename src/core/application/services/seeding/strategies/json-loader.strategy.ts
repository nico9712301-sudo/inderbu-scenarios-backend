import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

import { IDataLoader } from '../interfaces/data-loader.interface';

@Injectable()
export class JsonLoaderStrategy implements IDataLoader {
  load<T>(fileName: string): T[] {
    const filePath = path.join(__dirname, '../data', fileName);
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[];
  }
}
