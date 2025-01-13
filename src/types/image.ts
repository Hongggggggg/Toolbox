// 图片工具类型
export type ImageTool = 'basic' | 'grid' | 'ocr' | 'merge';

// 图片调整参数
export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
}