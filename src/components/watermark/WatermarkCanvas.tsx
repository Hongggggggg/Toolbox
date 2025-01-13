import React, { useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { WatermarkConfig } from '../../pages/tools/image/Watermark';
import WatermarkPreview from './WatermarkPreview';

interface WatermarkCanvasProps {
  image: string;
  watermarks: WatermarkConfig[];
  activeWatermark: number | null;
  onWatermarkClick: (index: number) => void;
  onWatermarkMove: (index: number, position: { x: number; y: number }) => void;
  onExport: (canvas: HTMLCanvasElement) => void;
}

/**
 * 水印画布组件
 * 用于显示原图和水印，处理水印的拖放
 */
const WatermarkCanvas: React.FC<WatermarkCanvasProps> = ({
  image,
  watermarks,
  activeWatermark,
  onWatermarkClick,
  onWatermarkMove,
  onExport,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop(() => ({
    accept: 'watermark',
    drop: (item: WatermarkConfig & { id: string }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const index = watermarks.findIndex(w => w.id === item.id);
        if (index !== -1) {
          onWatermarkMove(index, {
            x: item.position.x + delta.x,
            y: item.position.y + delta.y,
          });
        }
      }
    },
  }));

  // 渲染画布
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 加载原图
    const img = new Image();
    img.src = image;
    img.onload = () => {
      // 设置画布尺寸
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const scale = Math.min(
        containerWidth / img.width,
        containerHeight / img.height
      );

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // 绘制原图
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 绘制水印
      watermarks.forEach((watermark) => {
        if (watermark.type === 'text') {
          ctx.save();
          ctx.translate(watermark.position.x, watermark.position.y);
          ctx.rotate((watermark.rotation * Math.PI) / 180);
          ctx.scale(watermark.scale, watermark.scale);
          ctx.globalAlpha = watermark.opacity;
          ctx.font = `${watermark.fontSize}px ${watermark.fontFamily}`;
          ctx.fillStyle = watermark.color || '#000000';
          ctx.fillText(watermark.content, 0, 0);
          ctx.restore();
        } else if (watermark.type === 'image' && watermark.content) {
          const watermarkImg = new Image();
          watermarkImg.src = watermark.content;
          watermarkImg.onload = () => {
            ctx.save();
            ctx.translate(watermark.position.x, watermark.position.y);
            ctx.rotate((watermark.rotation * Math.PI) / 180);
            ctx.scale(watermark.scale, watermark.scale);
            ctx.globalAlpha = watermark.opacity;
            ctx.drawImage(
              watermarkImg,
              -watermarkImg.width / 2,
              -watermarkImg.height / 2
            );
            ctx.restore();
          };
        }
      });

      // 导出画布
      onExport(canvas);
    };
  }, [image, watermarks, onExport]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
      <div ref={drop} className="absolute inset-0">
        {watermarks.map((watermark, index) => (
          <WatermarkPreview
            key={watermark.id}
            config={watermark}
            isActive={index === activeWatermark}
            onClick={() => onWatermarkClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default WatermarkCanvas; 