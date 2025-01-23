import React, { useState } from 'react';
import { Card, Upload, Button, List, message, Spin } from 'antd';
import { InboxOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile, UploadProps } from 'antd/es/upload/interface';
import styles from './AudioMerge.module.css';

const { Dragger } = Upload;

interface AudioFile extends Omit<UploadFile, 'originFileObj'> {
  originFileObj: RcFile;
  status: 'uploading' | 'done' | 'error' | 'removed';
}

const AudioMerge: React.FC = () => {
  const [fileList, setFileList] = useState<AudioFile[]>([]);
  const [merging, setMerging] = useState(false);

  // 处理文件上传
  const handleUpload: UploadProps['onChange'] = async (info) => {
    const { file, fileList: newFileList } = info;
    
    // 处理新上传的文件
    if (file.status === 'uploading') {
      const updatedFiles = newFileList.map(f => ({
        ...f,
        status: 'done' as const
      })) as AudioFile[];
      setFileList(updatedFiles);
      return;
    }

    // 处理删除的文件
    if (file.status === 'removed') {
      const filteredFiles = newFileList.map(f => ({
        ...f,
        status: f.status as AudioFile['status']
      })) as AudioFile[];
      setFileList(filteredFiles);
      return;
    }

    // 处理其他状态
    const processedFiles = newFileList.map(f => ({
      ...f,
      status: f.status as AudioFile['status']
    })) as AudioFile[];
    setFileList(processedFiles);
  };

  // 文件上传前的校验
  const beforeUpload = (file: RcFile): boolean => {
    const isAudio = file.type.startsWith('audio/');
    if (!isAudio) {
      message.error('只能上传音频文件！');
      return false;
    }

    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error('音频文件不能超过 20MB！');
      return false;
    }

    return true;
  };

  // 移动文件位置
  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFileList = [...fileList];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFileList[index], newFileList[newIndex]] = [newFileList[newIndex], newFileList[index]];
    setFileList(newFileList);
  };

  // 删除文件
  const removeFile = (uid: string) => {
    setFileList(fileList.filter(file => file.uid !== uid));
  };

  // 合并音频
  const mergeAudios = async () => {
    if (fileList.length < 2) {
      message.warning('请至少上传两个音频文件');
      return;
    }

    setMerging(true);
    try {
      const audioContext = new AudioContext();
      const audioBuffers = await Promise.all(
        fileList.map(async (file) => {
          const arrayBuffer = await file.originFileObj?.arrayBuffer();
          if (!arrayBuffer) throw new Error('文件读取失败');
          return await audioContext.decodeAudioData(arrayBuffer);
        })
      );

      // 计算总长度
      const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
      const outputBuffer = audioContext.createBuffer(
        audioBuffers[0].numberOfChannels,
        totalLength,
        audioBuffers[0].sampleRate
      );

      // 合并音频数据
      let offset = 0;
      for (const buffer of audioBuffers) {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const outputData = outputBuffer.getChannelData(channel);
          const inputData = buffer.getChannelData(channel);
          for (let i = 0; i < buffer.length; i++) {
            outputData[offset + i] = inputData[i];
          }
        }
        offset += buffer.length;
      }

      // 导出为WAV文件
      const wavBlob = await audioBufferToWav(outputBuffer);
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '合并后的音频.wav';
      link.click();
      URL.revokeObjectURL(url);
      
      message.success('音频合并成功');
    } catch (error) {
      console.error('音频合并失败:', error);
      message.error('音频合并失败，请重试');
    } finally {
      setMerging(false);
    }
  };

  // 将AudioBuffer转换为WAV格式
  const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2;
    const view = new DataView(new ArrayBuffer(44 + length));

    // WAV文件头
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // 写入音频数据
    const offset = 44;
    const channels = [];
    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChan; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + (i * numOfChan + channel) * 2, int16, true);
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  // 写入字符串到DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return (
    <div className={styles.container}>
      <Card title="音频合并工具">
        <Dragger
          multiple
          accept="audio/*"
          fileList={fileList}
          onChange={handleUpload}
          beforeUpload={beforeUpload}
          customRequest={({ file, onSuccess }) => {
            setTimeout(() => {
              onSuccess?.("ok");
            }, 0);
          }}
          className={styles.uploader}
          showUploadList={false}
          maxCount={5}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽音频文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传音频文件（最大20MB），最多可上传5个文件
          </p>
        </Dragger>

        {fileList.length > 0 && (
          <List
            className={styles.fileList}
            dataSource={fileList}
            renderItem={(file, index) => (
              <List.Item
                className={styles.fileItem}
                actions={[
                  index > 0 && (
                    <Button
                      type="text"
                      icon={<ArrowUpOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveFile(index, 'up');
                      }}
                    />
                  ),
                  index < fileList.length - 1 && (
                    <Button
                      type="text"
                      icon={<ArrowDownOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveFile(index, 'down');
                      }}
                    />
                  ),
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.uid);
                    }}
                  />
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={file.name}
                />
              </List.Item>
            )}
          />
        )}

        <div className={styles.actions}>
          <Button
            type="primary"
            onClick={mergeAudios}
            disabled={fileList.length < 2 || merging}
          >
            {merging ? <Spin size="small" /> : '合并音频'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AudioMerge; 