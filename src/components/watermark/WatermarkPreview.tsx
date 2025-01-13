import React from 'react';
import { useDrag } from 'react-dnd';
import { WatermarkConfig } from '../../pages/tools/image/Watermark';

interface WatermarkPreviewProps {
  config: WatermarkConfig;
  isActive: boolean;
  onClick: () => void;
}

/**
 * 水印预览组件
 * 用于在画布上显示和拖拽水印
 */
const WatermarkPreview: React.FC<WatermarkPreviewProps> = ({
  config,
  isActive,
  onClick,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'watermark',
    item: config,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${config.position.x}px`,
    top: `${config.position.y}px`,
    transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
    opacity: config.opacity,
    cursor: 'move',
    userSelect: 'none',
    border: isActive ? '2px solid rgb(79,70,228)' : 'none',
    padding: '4px',
    borderRadius: '4px',
    backgroundColor: isActive ? 'rgba(79,70,228,0.1)' : 'transparent',
  };

  return (
    <div
      ref={drag}
      style={style}
      onClick={onClick}
      className={`transition-all duration-200 ${isDragging ? 'opacity-50' : ''}`}
    >
      {config.type === 'text' ? (
        <div
          style={{
            color: config.color,
            fontSize: `${config.fontSize}px`,
            fontFamily: config.fontFamily,
          }}
        >
          {config.content}
        </div>
      ) : (
        <img
          src={config.content}
          alt="水印"
          style={{
            maxWidth: '200px',
            maxHeight: '200px',
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  );
};

export default WatermarkPreview; 