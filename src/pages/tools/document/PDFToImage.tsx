import React, { useState, useCallback } from 'react';
import { Card, Upload, Button, Progress, message, Space, Checkbox, Typography } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { PDFDocument, PDFToImageOptions, ConversionProgress } from '@/types/pdf';
import { PDFProcessor } from '@/components/document/pdf/PDFProcessor';
import { useFileValidation } from '@/hooks/useFileValidation';
import styles from './PDFToImage.module.css';

const { Dragger } = Upload;
const { Title } = Typography;

const DEFAULT_OPTIONS: PDFToImageOptions = {};

export const PDFToImage: React.FC = () => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [options] = useState<PDFToImageOptions>(DEFAULT_OPTIONS);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [converting, setConverting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { validateFile } = useFileValidation();

  const handleFileChange = useCallback(async (info: { file: UploadFile }) => {
    const { file } = info;
    if (file.status === 'done') {
      try {
        setLoading(true);
        setPdfDoc(null);

        if (!file.originFileObj) {
          throw new Error('文件加载失败，请重试');
        }

        const fileType = file.originFileObj.type.toLowerCase();
        if (fileType !== 'application/pdf') {
          throw new Error('请上传PDF格式的文件');
        }

        const isValid = await validateFile(file.originFileObj, {
          type: ['application/pdf'],
          maxSize: 100 * 1024 * 1024, // 100MB
        });

        if (!isValid) {
          throw new Error('请上传有效的PDF文件，大小不超过100MB');
        }

        message.loading({ content: '正在加载PDF文件...', key: 'pdfLoading', duration: 0 });
        const processor = new PDFProcessor();
        
        try {
          const doc = await processor.loadDocument(file.originFileObj);
          if (doc.totalPages === 0) {
            throw new Error('PDF文件没有任何页面');
          }
          setPdfDoc(doc);
          message.success({ 
            content: `PDF加载成功，共 ${doc.totalPages} 页${doc.totalPages > 50 ? '，页数较多可能需要较长处理时间' : ''}`, 
            key: 'pdfLoading' 
          });
        } catch (loadError) {
          throw new Error(loadError instanceof Error ? loadError.message : 'PDF文件加载失败，请确保文件格式正确');
        }
      } catch (error) {
        console.error('PDF处理失败:', error);
        message.error({
          content: error instanceof Error ? error.message : 'PDF文件处理失败，请重试',
          key: 'pdfLoading',
          duration: 3
        });
        setPdfDoc(null);
      } finally {
        setLoading(false);
      }
    }
  }, [validateFile]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!pdfDoc) return;
    setPdfDoc(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(page => ({
          ...page,
          selected: checked,
        })),
      };
    });
  }, []);

  const handleSelectPage = useCallback((pageNumber: number, checked: boolean) => {
    if (!pdfDoc) return;
    setPdfDoc(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(page => 
          page.pageNumber === pageNumber ? { ...page, selected: checked } : page
        ),
      };
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!pdfDoc) return;

    const selectedPages = pdfDoc.pages.filter(page => page.selected);
    if (selectedPages.length === 0) {
      message.warning('请至少选择一页进行下载');
      return;
    }

    try {
      setConverting(true);
      message.loading({ content: '正在转换...', key: 'converting', duration: 0 });
      const processor = new PDFProcessor();
      
      await processor.convertToImages(
        {
          ...pdfDoc,
          pages: selectedPages,
        },
        options,
        (progress: ConversionProgress) => {
          setProgress(progress);
          if (progress.status === 'error' && progress.error) {
            throw new Error(progress.error);
          }
        }
      );

      message.success({ content: '转换完成！', key: 'converting' });
    } catch (error) {
      console.error('转换失败:', error);
      message.error({
        content: error instanceof Error ? error.message : '转换失败，请重试',
        key: 'converting',
        duration: 3
      });
    } finally {
      setConverting(false);
      setProgress(null);
    }
  }, [pdfDoc, options]);

  const isAllSelected = pdfDoc?.pages.every(page => page.selected);
  const isAnySelected = pdfDoc?.pages.some(page => page.selected);

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title level={4} style={{ marginBottom: 24, color: '#1f2937' }}>PDF转图片</Title>
        
        <Dragger
          accept=".pdf"
          multiple={false}
          showUploadList={false}
          disabled={loading || converting}
          customRequest={({ file, onSuccess }) => {
            setTimeout(() => {
              onSuccess?.({}, new XMLHttpRequest());
            }, 0);
          }}
          onChange={handleFileChange}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: loading ? '#d9d9d9' : 'rgb(79, 70, 228)' }} />
          </p>
          {pdfDoc ? (
            <>
              <p className="ant-upload-text">
                {pdfDoc.name}
              </p>
              <p className="ant-upload-hint">
                共 {pdfDoc.totalPages} 页，点击或拖拽新的PDF文件以替换
              </p>
            </>
          ) : (
            <>
              <p className="ant-upload-text">
                {loading ? '正在加载PDF...' : '点击或拖拽PDF文件到此区域'}
              </p>
              <p className="ant-upload-hint">
                支持单个PDF文件，大小不超过100MB
              </p>
            </>
          )}
        </Dragger>

        {pdfDoc && (
          <div className={styles.options}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className={styles.previewInfo}>
                <div>
                  共 {pdfDoc.totalPages} 页
                  {pdfDoc.pages.filter(p => p.selected).length > 0 && (
                    <span style={{ marginLeft: 8 }}>
                      已选择 {pdfDoc.pages.filter(p => p.selected).length} 页
                    </span>
                  )}
                </div>
                <div className={styles.previewActions}>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={!isAllSelected && isAnySelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    全选
                  </Checkbox>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    loading={converting}
                    disabled={!isAnySelected}
                  >
                    下载选中页面
                  </Button>
                </div>
              </div>

              <div className={styles.previewList}>
                {pdfDoc.pages.map((page) => (
                  <div 
                    key={page.pageNumber} 
                    className={`${styles.previewItem} ${page.selected ? styles.selected : ''}`}
                    onClick={() => {
                      handleSelectPage(page.pageNumber, !page.selected);
                      message.destroy();
                      if (!page.selected) {
                        message.success(`已选择第 ${page.pageNumber} 页`);
                      }
                    }}
                  >
                    <div className={styles.previewNumber}>{page.pageNumber}</div>
                    <img src={page.previewUrl} alt={`第 ${page.pageNumber} 页`} />
                  </div>
                ))}
              </div>

              {progress && (
                <Progress
                  percent={Math.round((progress.currentPage / progress.totalPages) * 100)}
                  status={progress.status === 'error' ? 'exception' : 'active'}
                  format={(percent) => 
                    `${progress.currentPage} / ${progress.totalPages} 页 (${percent}%)`
                  }
                />
              )}
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PDFToImage; 