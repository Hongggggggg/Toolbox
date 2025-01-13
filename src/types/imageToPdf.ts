export interface ImageFile {
  file: File;
  id: string;
  preview: string;
  name: string;
  size: number;
}

export interface PDFProgress {
  processed: number;
  total: number;
  status: 'processing' | 'error';
} 