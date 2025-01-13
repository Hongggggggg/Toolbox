import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  Upload,
  Button,
  Progress,
  message,
  Typography,
} from 'antd';
import { InboxOutlined, DeleteOutlined, FileImageOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { ImageFile } from '@/types/imageToPdf';
import { ImageToPDFProcessor } from '@/components/document/pdf/ImageToPDFProcessor';
import { useFileValidation } from '@/hooks/useFileValidation';
import { saveAs } from 'file-saver';
import styles from './ImageToPDF.module.css';

const { Dragger } = Upload;
const { Title } = Typography;

// 主题色常量
const PRIMARY_COLOR = 'rgb(79, 70, 228)';

// 上传限制
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_FILE_COUNT = 30;

const ImageToPDF: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [progress, setProgress] = useState<{ processed: number; total: number; status: string } | null>(null);
  const [converting, setConverting] = useState(false);
  
  const { validateFile } = useFileValidation();

  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  const handleFileChange = useCallback(async (info: { file: UploadFile, fileList: UploadFile[] }) => {
    const { file } = info;
    
    if (file.status === 'uploading') return;

    if (file.status === 'done') {
      try {
        // 检查图片数量限制
        if (images.length >= MAX_FILE_COUNT) {
          message.warning(`最多只能上传${MAX_FILE_COUNT}张图片`);
          return;
        }

        const isValid = await validateFile(file.originFileObj as File, {
          type: ['image/jpeg', 'image/png', 'image/webp'],
          maxSize: MAX_FILE_SIZE,
        });

        if (!isValid) {
          message.error('请上传有效的图片文件，大小不超过1MB');
          return;
        }

        const newImage: ImageFile = {
          file: file.originFileObj as File,
          id: file.uid,
          preview: URL.createObjectURL(file.originFileObj as File),
          name: file.name,
          size: (file.originFileObj as File).size,
        };

        setImages(prev => [...prev, newImage]);
      } catch (error) {
        message.error('图片加载失败，请重试');
      }
    }
  }, [validateFile, images.length]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const handleConvert = useCallback(async () => {
    if (images.length === 0) {
      message.warning('请先上传图片');
      return;
    }

    try {
      setConverting(true);
      const processor = new ImageToPDFProcessor();
      
      const pdfBytes = await processor.createPDF(images, {}, (progress) => {
        setProgress(progress);
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, '合成文档.pdf');
      message.success('转换完成！');
    } catch (error) {
      message.error('转换失败，请重试');
    } finally {
      setConverting(false);
      setProgress(null);
    }
  }, [images]);

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title level={4} style={{ marginBottom: 24, color: '#1f2937' }}>图片转PDF</Title>
        
        <div className={styles.uploadArea}>
          <Dragger
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess?.({}, new XMLHttpRequest());
              }, 0);
            }}
            onChange={handleFileChange}
          >
            <p className="ant-upload-drag-icon">
              <FileImageOutlined style={{ color: PRIMARY_COLOR }} />
            </p>
            <p className="ant-upload-text">点击或拖拽图片文件到此区域</p>
            <p className="ant-upload-hint">
              支持JPG、PNG、WebP格式，单个文件不超过1MB，最多上传30张
            </p>
          </Dragger>
        </div>

        {images.length > 0 && (
          <>
            <div className={styles.imageList}>
              {images.map((image, index) => (
                <div key={image.id} className={styles.imageItem}>
                  <div className={styles.imageNumber}>{index + 1}</div>
                  <img src={image.preview} alt={image.name} />
                  <div className={styles.imageOverlay}>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveImage(image.id)}
                    />
                  </div>
                  <div className={styles.imageName}>{image.name}</div>
                </div>
              ))}
            </div>

            <Button
              type="primary"
              onClick={handleConvert}
              loading={converting}
              className={styles.convertButton}
            >
              合成PDF
            </Button>

            {progress && (
              <Progress
                className={styles.progress}
                percent={Math.round((progress.processed / progress.total) * 100)}
                status={progress.status === 'error' ? 'exception' : 'active'}
                strokeColor={PRIMARY_COLOR}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ImageToPDF; 