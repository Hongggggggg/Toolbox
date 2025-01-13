import { ImageFile, PDFProgress } from '@/types/imageToPdf';
import { PDFDocument } from 'pdf-lib';

export class ImageToPDFProcessor {
  async createPDF(
    images: ImageFile[],
    options = {},
    onProgress?: (progress: PDFProgress) => void
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let processed = 0;

    try {
      for (const image of images) {
        const page = pdfDoc.addPage();
        const imageBytes = await this.readFileAsArrayBuffer(image.file);
        let pdfImage;

        if (image.file.type === 'image/jpeg') {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        } else if (image.file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else {
          throw new Error('不支持的图片格式');
        }

        const { width, height } = pdfImage.scale(1);
        page.setSize(width, height);
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width,
          height,
        });

        processed++;
        onProgress?.({
          processed,
          total: images.length,
          status: 'processing'
        });
      }

      return await pdfDoc.save();
    } catch (error) {
      onProgress?.({
        processed,
        total: images.length,
        status: 'error'
      });
      throw error;
    }
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
} 