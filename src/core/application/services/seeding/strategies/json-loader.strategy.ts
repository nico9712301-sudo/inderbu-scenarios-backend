import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

import { IDataLoader } from '../interfaces/data-loader.interface';

@Injectable()
export class JsonLoaderStrategy implements IDataLoader {
  load<T>(fileName: string): T[] {
    // Try to find the file in the compiled dist directory first
    let filePath = path.join(__dirname, '../data', fileName);
    
    // If file doesn't exist in dist, try the source directory
    if (!fs.existsSync(filePath)) {
      // Calculate path relative to project root
      const projectRoot = process.cwd();
      const sourcePath = path.join(projectRoot, 'src', 'core', 'application', 'services', 'seeding', 'data', fileName);
      
      if (fs.existsSync(sourcePath)) {
        filePath = sourcePath;
      } else {
        throw new Error(`File not found: ${fileName}. Tried paths: ${filePath}, ${sourcePath}`);
      }
    }
    
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[];
  }
}
