import { PDFDocument, PDFToImageOptions, PDFPageInfo, ConversionProgress } from '@/types/pdf';
import * as pdfjs from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// 确保PDF.js worker正确加载
pdfjs.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs';

export class PDFProcessor {
  private async validatePDFHeader(file: File): Promise<boolean> {
    try {
      const buffer = await file.slice(0, 5).arrayBuffer();
      const header = new Uint8Array(buffer);
      const pdfHeader = '%PDF-';
      
      // 检查文件头是否为 PDF 格式
      const headerString = String.fromCharCode.apply(null, Array.from(header));
      return headerString === pdfHeader;
    } catch (error) {
      console.error('验证PDF头部失败:', error);
      return false;
    }
  }

  private async loadPDFDocument(file: File): Promise<any> {
    try {
      // 读取文件内容
      const arrayBuffer = await file.arrayBuffer();
      
      // 检查文件大小
      if (arrayBuffer.byteLength === 0) {
        throw new Error('PDF文件为空');
      }

      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        cMapUrl: '/node_modules/pdfjs-dist/cmaps/',
        cMapPacked: true,
      });
      
      // 添加加载进度回调
      loadingTask.onProgress = function (progressData: { loaded: number; total: number }) {
        const percent = (progressData.loaded / progressData.total) * 100;
        console.log(`Loading: ${Math.round(percent)}%`);
      };

      const pdf = await loadingTask.promise;
      
      // 验证页数
      if (pdf.numPages === 0) {
        throw new Error('PDF文件没有任何页面');
      }

      return pdf;
    } catch (error) {
      console.error('PDF加载失败:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('PDF文件加载失败，请确保文件完整且未损坏');
    }
  }

  public async loadDocument(file: File): Promise<PDFDocument> {
    try {
      const pdf = await this.loadPDFDocument(file);
      const pages: PDFPageInfo[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          
          // 生成预览图
          const previewScale = 0.2; // 缩小到 20%
          const previewViewport = page.getViewport({ scale: previewScale });
          const canvas = this.createCanvas(previewViewport.width, previewViewport.height);
          const context = canvas.getContext('2d', {
            alpha: false,
            willReadFrequently: true,
          });

          if (!context) {
            throw new Error('无法创建Canvas上下文');
          }

          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport: previewViewport,
            background: 'white',
          }).promise;

          // 转换为预览图 URL，使用较低的质量以减小内存占用
          const previewUrl = canvas.toDataURL('image/jpeg', 0.5);

          pages.push({
            pageNumber: i,
            width: viewport.width,
            height: viewport.height,
            aspectRatio: viewport.width / viewport.height,
            previewUrl,
            selected: false,  // 默认不选中
          });
        } catch (pageError) {
          console.error(`加载第${i}页失败:`, pageError);
          throw new Error(`加载第${i}页失败，PDF可能已损坏`);
        }
      }

      return {
        file,
        name: file.name,
        totalPages: pdf.numPages,
        pages,
      };
    } catch (error) {
      console.error('加载PDF文档失败:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('PDF文档加载失败，请确保文件格式正确');
    }
  }

  private createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
    return canvas;
  }

  private async renderPageToCanvas(
    page: any,
    options: PDFToImageOptions
  ): Promise<HTMLCanvasElement> {
    try {
      // 使用固定的 DPI 和缩放值
      const scale = 1 * (300 / 72); // 固定 300 DPI
      const viewport = page.getViewport({ scale });
      const canvas = this.createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d', {
        alpha: false,
        willReadFrequently: true,
      });

      if (!context) {
        throw new Error('无法创建Canvas上下文');
      }

      // 设置白色背景
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport,
        background: 'white',
      };

      await page.render(renderContext).promise;
      return canvas;
    } catch (error) {
      console.error('渲染PDF页面失败:', error);
      throw new Error('PDF页面渲染失败');
    }
  }

  private async canvasToBlob(
    canvas: HTMLCanvasElement,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('转换为图片失败'));
            }
          },
          'image/jpeg',  // 固定使用 jpeg 格式
          0.9  // 固定质量为 90%
        );
      } catch (error) {
        console.error('转换为Blob失败:', error);
        reject(new Error('图片转换失败'));
      }
    });
  }

  public async convertToImages(
    document: PDFDocument,
    options: PDFToImageOptions,
    onProgress?: (progress: ConversionProgress) => void
  ): Promise<void> {
    try {
      const pdf = await this.loadPDFDocument(document.file);
      const zip = new JSZip();
      const imageFolder = zip.folder('images');

      if (!imageFolder) {
        throw new Error('创建ZIP文件夹失败');
      }

      // 只处理选中的页面
      const selectedPages = document.pages.filter(page => page.selected);
      const totalPages = selectedPages.length;

      for (let i = 0; i < totalPages; i++) {
        const pageInfo = selectedPages[i];
        
        if (onProgress) {
          onProgress({
            currentPage: i + 1,
            totalPages,
            status: 'processing',
          });
        }

        const page = await pdf.getPage(pageInfo.pageNumber);
        const canvas = await this.renderPageToCanvas(page, options);
        const blob = await this.canvasToBlob(canvas);
        
        imageFolder.file(
          `page-${pageInfo.pageNumber.toString().padStart(3, '0')}.jpg`,  // 使用原始页码
          blob,
          { binary: true }
        );
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fileName = document.name.replace('.pdf', '');
      saveAs(zipBlob, `${fileName}-images.zip`);

      if (onProgress) {
        onProgress({
          currentPage: totalPages,
          totalPages,
          status: 'completed',
        });
      }
    } catch (error) {
      console.error('转换失败:', error);
      if (onProgress) {
        onProgress({
          currentPage: 0,
          totalPages: document.pages.length,
          status: 'error',
          error: '转换过程中发生错误',
        });
      }
      throw error;
    }
  }
} 