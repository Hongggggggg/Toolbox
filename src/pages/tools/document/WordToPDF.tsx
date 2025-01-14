import React, { useState, useCallback } from 'react';
import { Card, Upload, Button, Progress, message, Space, Typography, Select } from 'antd';
import { InboxOutlined, DownloadOutlined, SettingOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useFileValidation } from '@/hooks/useFileValidation';
import styles from './WordToPDF.module.css';
import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';

const { Dragger } = Upload;
const { Title } = Typography;

interface ConversionOptions {
  quality: 'high' | 'medium' | 'low';
  preserveLinks: boolean;
  embedFonts: boolean;
}

const DEFAULT_OPTIONS: ConversionOptions = {
  quality: 'high',
  preserveLinks: true,
  embedFonts: true,
};

export const WordToPDF: React.FC = () => {
  const [file, setFile] = useState<UploadFile | null>(null);
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);
  const [progress, setProgress] = useState<number>(0);
  const [converting, setConverting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { validateFile } = useFileValidation();

  const handleFileChange = useCallback(async (info: { file: UploadFile }) => {
    const { file } = info;
    
    try {
      setLoading(true);

      if (!file) {
        throw new Error('文件加载失败，请重试');
      }

      // 如果是删除文件的操作
      if (info.file.status === 'removed') {
        setFile(null);
        return;
      }

      const fileType = file.type?.toLowerCase();
      const validTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(fileType || '')) {
        throw new Error('请上传Word格式的文件（.doc或.docx）');
      }

      // 检查文件大小
      if (file.size && file.size > 20 * 1024 * 1024) {
        throw new Error('文件大小不能超过20MB');
      }

      setFile(file);
      message.success('文件上传成功');
    } catch (error) {
      console.error('Word文件处理失败:', error);
      message.error(error instanceof Error ? error.message : 'Word文件处理失败，请重试');
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) {
      message.error('请先上传Word文件');
      return;
    }

    try {
      setConverting(true);
      setProgress(0);

      // 创建进度更新器
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 99) {
            clearInterval(progressTimer);
            return 99;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      try {
        // 读取文件内容
        const reader = new FileReader();
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(new Error('文件读取失败'));
          reader.readAsArrayBuffer(file.originFileObj as Blob);
        });
        
        // 使用mammoth转换Word为HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;

        // 创建一个临时容器来存放HTML内容
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.padding = '40px';
        
        // 添加样式以确保正确的层级关系
        const style = document.createElement('style');
        style.textContent = `
          p { position: relative; z-index: 2; }
          img { display: block; margin: 10px 0; max-width: 100%; height: auto; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td, th { border: 1px solid #ddd; padding: 8px; }
        `;
        container.appendChild(style);
        document.body.appendChild(container);

        // 配置转换选项
        const opt = {
          margin: 10,
          filename: file.name?.replace(/\.(doc|docx)$/i, '') + '.pdf',
          image: { 
            type: 'jpeg', 
            quality: options.quality === 'high' ? 1 : options.quality === 'medium' ? 0.75 : 0.5 
          },
          html2canvas: { 
            scale: options.quality === 'high' ? 2 : options.quality === 'medium' ? 1.5 : 1,
            useCORS: true,
            logging: false,
            removeContainer: true,
            letterRendering: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          }
        };

        // 转换为PDF
        await html2pdf().set(opt).from(container).save();

        // 清理临时元素
        document.body.removeChild(container);

        clearInterval(progressTimer);
        setProgress(100);
        message.success('转换成功，正在下载PDF文件');
      } catch (conversionError) {
        throw new Error('文件转换失败：' + (conversionError instanceof Error ? conversionError.message : '未知错误'));
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '转换失败，请重试');
      console.error('转换失败:', error);
    } finally {
      setConverting(false);
    }
  }, [file, options]);

  const handleOptionChange = useCallback((key: keyof ConversionOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return (
    <div className={styles.container}>
      <Card>
        <Title level={4}>Word转PDF</Title>
        <div className={styles.uploadArea}>
          <Dragger
            name="file"
            multiple={false}
            maxCount={1}
            showUploadList={{
              showRemoveIcon: true,
              showDownloadIcon: false
            }}
            accept=".doc,.docx"
            onChange={handleFileChange}
            disabled={converting}
            beforeUpload={() => {
              return false;
            }}
            fileList={file ? [file] : []}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽Word文件到此区域</p>
            <p className="ant-upload-hint">
              支持.doc和.docx格式，单个文件最大20MB
            </p>
          </Dragger>
        </div>

        <div className={styles.options}>
          <Title level={5}>
            <SettingOutlined /> 转换设置
          </Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className={styles.option}>
              <span>输出质量：</span>
              <Select
                value={options.quality}
                onChange={value => handleOptionChange('quality', value)}
                style={{ width: 160 }}
                popupMatchSelectWidth={false}
                options={[
                  { value: 'high', label: '高质量' },
                  { value: 'medium', label: '中等质量' },
                  { value: 'low', label: '低质量（文件更小）' }
                ]}
              />
            </div>
            <div className={styles.option}>
              <span>保留超链接：</span>
              <Select
                value={options.preserveLinks}
                onChange={value => handleOptionChange('preserveLinks', value)}
                style={{ width: 160 }}
                popupMatchSelectWidth={false}
                options={[
                  { value: true, label: '是' },
                  { value: false, label: '否' }
                ]}
              />
            </div>
            <div className={styles.option}>
              <span>嵌入字体：</span>
              <Select
                value={options.embedFonts}
                onChange={value => handleOptionChange('embedFonts', value)}
                style={{ width: 160 }}
                popupMatchSelectWidth={false}
                options={[
                  { value: true, label: '是' },
                  { value: false, label: '否' }
                ]}
              />
            </div>
          </Space>
        </div>

        {progress > 0 && (
          <div className={styles.progress}>
            <Progress percent={Math.round(progress)} status={converting ? 'active' : 'success'} />
          </div>
        )}

        <div className={styles.actions}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleConvert}
            loading={converting}
            disabled={!file || loading}
            size="large"
          >
            开始转换
          </Button>
        </div>
      </Card>
    </div>
  );
}; 