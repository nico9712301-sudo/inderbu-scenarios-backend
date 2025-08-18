export interface IDataLoader {
  load<T>(fileName: string): T[];
}
