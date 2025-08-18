export interface IHomeSlideSeed {
  title: string;
  description: string | null;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  slideType: 'banner' | 'placeholder';
  moduleName?: string; // Para banners
  entityType?: string; // Para placeholders
}