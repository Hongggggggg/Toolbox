/**
 * OCR识别结果中的单个文本块
 */
export interface OCRTextBlock {
  text: string;
  confidence: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * OCR识别结果
 */
export interface OCRResult {
  blocks: OCRTextBlock[];
  fullText: string;
  processingTime: number;
}

/**
 * OCR处理器组件的属性
 */
export interface OCRProcessorProps {
  file: File;
  preview: string;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  ocrResult: OCRResult | null;
  setOcrResult: (result: OCRResult | null) => void;
  setError: (error: string | null) => void;
} 