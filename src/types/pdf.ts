export interface PDFToImageOptions {
  // 固定使用 jpeg 格式，不需要配置项
}

export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  aspectRatio: number;
  previewUrl?: string;
  selected?: boolean;
}

export interface PDFDocument {
  file: File;
  name: string;
  totalPages: number;
  pages: PDFPageInfo[];
}

export interface ConversionProgress {
  currentPage: number;
  totalPages: number;
  status: 'processing' | 'completed' | 'error';
  error?: string;
} 