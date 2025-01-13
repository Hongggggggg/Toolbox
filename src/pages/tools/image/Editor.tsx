import React, { useState, useRef, useCallback } from 'react';
import { Button, Slider, message, Upload, Space, Card, Row, Col, Tooltip, Radio, Spin } from 'antd';
import { UploadOutlined, RotateLeftOutlined, RotateRightOutlined, SwapOutlined, SaveOutlined, UndoOutlined, CloseCircleFilled } from '@ant-design/icons';
import type { UploadFile, RcFile, UploadProps } from 'antd/es/upload/interface';
import { editImage, type ImageEditOptions, downloadImage } from '../../../utils/imageProcessing';
import BasePage from '../../../components/layout/BasePage';

interface EditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  highlights: number;
  shadows: number;
  temperature: number;
  vignette: number;
  sharpness: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

interface ImageInfo {
  width: number;
  height: number;
  size: string;
}

const initialState: EditorState = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  highlights: 0,
  shadows: 0,
  temperature: 6500,
  vignette: 0,
  sharpness: 0,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
};

const filterOptions = [
  { label: '无滤镜', value: 'none' },
  { label: '日系', value: 'japanese' },
  { label: '复古', value: 'vintage' },
  { label: '冷色', value: 'cold' },
  { label: '暖色', value: 'warm' },
  { label: '电影感', value: 'cinema' },
  { label: '青橙', value: 'cyan-orange' },
  { label: '日落', value: 'sunset' },
  { label: '森林', value: 'forest' },
  { label: '戏剧', value: 'dramatic' },
  { label: '褪色', value: 'fade' },
  { label: '黑白', value: 'noir' },
  { label: '鲜艳', value: 'vivid' },
  { label: '怀旧', value: 'retro' },
  { label: '优雅', value: 'elegant' },
];

const ImageEditor: React.FC = () => {
  const [state, setState] = useState<EditorState>(initialState);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 更新图片信息
  const updateImageInfo = (file: File, img: HTMLImageElement) => {
    setImageInfo({
      width: img.naturalWidth,
      height: img.naturalHeight,
      size: formatFileSize(file.size),
    });
  };

  // 检查文件类型和大小
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }
    
    return true;
  };

  // 处理图片上传
  const handleUpload: UploadProps['onChange'] = ({ file }) => {
    if (file.status === 'error') {
      message.error('图片上传失败，请重试');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (imageUrl) {
        const img = new Image();
        img.onload = () => {
          if (file.originFileObj) {
            updateImageInfo(file.originFileObj, img);
          }
        };
        img.src = imageUrl;
        
        setState({
          ...initialState,
          imageUrl,
          history: [imageUrl],
          historyIndex: 0,
        });
        setFileList([file as UploadFile]);
      }
    };

    if (file.originFileObj) {
      reader.readAsDataURL(file.originFileObj);
    }
  };

  // 应用编辑效果
  const applyEdit = useCallback(async (newState: EditorState) => {
    if (!newState.imageUrl) return;

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsProcessing(true);

    // 设置新的定时器
    timeoutRef.current = setTimeout(async () => {
      try {
        const editedImage = await editImage(newState.imageUrl, {
          brightness: newState.brightness,
          contrast: newState.contrast,
          saturation: newState.saturation,
          highlights: newState.highlights,
          shadows: newState.shadows,
          temperature: newState.temperature,
          vignette: newState.vignette,
          sharpness: newState.sharpness,
          rotation: newState.rotation,
          flipHorizontal: newState.flipHorizontal,
          flipVertical: newState.flipVertical,
          filter: newState.filter,
        });

        // 更新历史记录
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), editedImage];
        setState({
          ...newState,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      } catch (error) {
        message.error('图片处理失败');
      } finally {
        setIsProcessing(false);
      }
    }, 500);
  }, [state.history]);

  // 处理撤销/重做
  const handleUndo = () => {
    if (state.historyIndex > 0) {
      setState({
        ...state,
        historyIndex: state.historyIndex - 1,
      });
    }
  };

  // 处理保存
  const handleSave = () => {
    if (state.history[state.historyIndex]) {
      downloadImage(state.history[state.historyIndex], 'edited-image.jpg');
      message.success('图片已保存');
    }
  };

  // 重置编辑
  const handleReset = () => {
    setState({
      ...initialState,
      imageUrl: state.history[0],
      history: [state.history[0]],
      historyIndex: 0,
    });
  };

  // 处理删除图片
  const handleDelete = () => {
    setState(initialState);
    setFileList([]);
    setImageInfo(null);
  };

  return (
    <BasePage>
      <div className="p-6">
        <Card title="图片编辑器" className="mb-6">
          <Row gutter={24}>
            <Col span={16}>
              <div className="bg-gray-100 p-4 rounded-lg min-h-[500px] flex flex-col items-center justify-center relative">
                {!state.imageUrl ? (
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleUpload}
                    maxCount={1}
                    disabled={isProcessing}
                    customRequest={({ onSuccess }) => {
                      if (onSuccess) {
                        onSuccess("ok");
                      }
                    }}
                  >
                    <div className="text-center cursor-pointer p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-main transition-colors">
                      <UploadOutlined className="text-2xl mb-2" />
                      <div className="mt-2">
                        <p className="text-base">点击或拖拽图片到此处</p>
                        <p className="text-sm text-gray-500">支持 JPG、PNG、GIF 等格式，大小不超过 5MB</p>
                      </div>
                    </div>
                  </Upload>
                ) : (
                  <>
                    <div className="relative group">
                      <Spin spinning={isProcessing} tip="图片处理中...">
                        <img
                          src={state.history[state.historyIndex]}
                          alt="编辑预览"
                          style={{ maxHeight: '500px' }}
                        />
                      </Spin>
                      <div 
                        className="absolute top-2 right-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleDelete}
                      >
                        <CloseCircleFilled className="text-2xl text-white hover:text-red-500 drop-shadow-lg" />
                      </div>
                    </div>
                    {imageInfo && (
                      <div className="mt-2 text-sm text-gray-500 text-center">
                        <Space>
                          <span>分辨率：{imageInfo.width} × {imageInfo.height}</span>
                          <span className="mx-2">|</span>
                          <span>大小：{imageInfo.size}</span>
                        </Space>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Space className="mb-3">
                  <Tooltip title="撤销">
                    <Button
                      icon={<UndoOutlined />}
                      onClick={handleUndo}
                      disabled={!state.imageUrl || state.historyIndex <= 0 || isProcessing}
                    />
                  </Tooltip>
                  <Tooltip title="重置">
                    <Button 
                      onClick={handleReset} 
                      disabled={!state.imageUrl || isProcessing}
                    >
                      重置
                    </Button>
                  </Tooltip>
                  <Tooltip title="保存">
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      disabled={!state.imageUrl || isProcessing}
                    >
                      保存
                    </Button>
                  </Tooltip>
                </Space>

                <div className="grid grid-cols-1 gap-2">
                  <div className="mb-4">
                    <div className="text-sm mb-2">滤镜</div>
                    <div className="grid grid-cols-4 gap-2">
                      {filterOptions.map(option => (
                        <div
                          key={option.value}
                          className={`
                            cursor-pointer text-center py-2 px-1 rounded-md transition-all
                            ${state.filter === option.value 
                              ? 'bg-blue-500 text-white shadow-md' 
                              : 'bg-gray-50 hover:bg-gray-100'
                            }
                            ${!state.imageUrl || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          onClick={() => {
                            if (!state.imageUrl || isProcessing) return;
                            const newState = { ...state, filter: option.value as FilterType };
                            setState(newState);
                            applyEdit(newState);
                          }}
                        >
                          <div className="text-xs">{option.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">亮度</span>
                      <span className="text-sm text-gray-500">{state.brightness}</span>
                    </div>
                    <Slider
                      min={-100}
                      max={100}
                      value={state.brightness}
                      disabled={!state.imageUrl || isProcessing}
                      onChange={(value) => {
                        const newState = { ...state, brightness: value };
                        setState(newState);
                        applyEdit(newState);
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">对比度</span>
                      <span className="text-sm text-gray-500">{state.contrast}</span>
                    </div>
                    <Slider
                      min={-100}
                      max={100}
                      value={state.contrast}
                      disabled={!state.imageUrl || isProcessing}
                      onChange={(value) => {
                        const newState = { ...state, contrast: value };
                        setState(newState);
                        applyEdit(newState);
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">饱和度</span>
                      <span className="text-sm text-gray-500">{state.saturation}</span>
                    </div>
                    <Slider
                      min={-100}
                      max={100}
                      value={state.saturation}
                      disabled={!state.imageUrl || isProcessing}
                      onChange={(value) => {
                        const newState = { ...state, saturation: value };
                        setState(newState);
                        applyEdit(newState);
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">高光</span>
                      <span className="text-sm text-gray-500">{state.highlights}</span>
                    </div>
                    <Slider
                      min={-100}
                      max={100}
                      value={state.highlights}
                      disabled={!state.imageUrl || isProcessing}
                      onChange={(value) => {
                        const newState = { ...state, highlights: value };
                        setState(newState);
                        applyEdit(newState);
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">阴影</span>
                      <span className="text-sm text-gray-500">{state.shadows}</span>
                    </div>
                    <Slider
                      min={-100}
                      max={100}
                      value={state.shadows}
                      disabled={!state.imageUrl || isProcessing}
                      onChange={(value) => {
                        const newState = { ...state, shadows: value };
                        setState(newState);
                        applyEdit(newState);
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">色温</span>
                      <span className="text-sm text-gray-500">{2000 + Math.round(state.temperature / 100 * 7000)}K</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      value={state.temperature}
                      disabled={!state.imageUrl || isProcessing}
                      onChange={(value) => {
                        const newState = { ...state, temperature: value };
                        setState(newState);
                        applyEdit(newState);
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">锐化</span>
                      <span className="text-sm text-gray-500">{state.sharpness}</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      value={state.sharpness}
                      disabled={!state.imageUrl || isProcessing}
                      onChange={(value) => {
                        const newState = { ...state, sharpness: value };
                        setState(newState);
                        applyEdit(newState);
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">晕影</span>
                      <span className="text-sm text-gray-500">{state.vignette}</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      value={state.vignette}
                      disabled={!state.imageUrl || isProcessing}
                      onChange={(value) => {
                        const newState = { ...state, vignette: value };
                        setState(newState);
                        applyEdit(newState);
                      }}
                    />
                  </div>

                  <div className="pt-1">
                    <Space>
                      <Tooltip title="向左旋转">
                        <Button
                          icon={<RotateLeftOutlined />}
                          disabled={!state.imageUrl || isProcessing}
                          onClick={() => {
                            const newState = {
                              ...state,
                              rotation: (state.rotation - 90) % 360,
                            };
                            setState(newState);
                            applyEdit(newState);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="向右旋转">
                        <Button
                          icon={<RotateRightOutlined />}
                          disabled={!state.imageUrl || isProcessing}
                          onClick={() => {
                            const newState = {
                              ...state,
                              rotation: (state.rotation + 90) % 360,
                            };
                            setState(newState);
                            applyEdit(newState);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="水平翻转">
                        <Button
                          icon={<SwapOutlined />}
                          disabled={!state.imageUrl || isProcessing}
                          onClick={() => {
                            const newState = {
                              ...state,
                              flipHorizontal: !state.flipHorizontal,
                            };
                            setState(newState);
                            applyEdit(newState);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="垂直翻转">
                        <Button
                          icon={<SwapOutlined rotate={90} />}
                          disabled={!state.imageUrl || isProcessing}
                          onClick={() => {
                            const newState = {
                              ...state,
                              flipVertical: !state.flipVertical,
                            };
                            setState(newState);
                            applyEdit(newState);
                          }}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </BasePage>
  );
};

export default ImageEditor; 