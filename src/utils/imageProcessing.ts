/**
 * 将图片转换为黑白效果
 */
export const convertToGrayscale = async (
  imageUrl: string,
  mode: 'classic' | 'high-contrast' | 'soft',
  brightness: number,
  contrast: number
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // 创建 canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置 canvas 尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 应用亮度和对比度
      const brightnessRatio = brightness / 100;
      const contrastRatio = contrast / 100;

      // 处理每个像素
      for (let i = 0; i < data.length; i += 4) {
        // 获取 RGB 值
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // 根据不同模式计算灰度值
        let gray;
        switch (mode) {
          case 'classic':
            // 使用标准灰度转换公式
            gray = 0.299 * r + 0.587 * g + 0.114 * b;
            break;
          case 'high-contrast':
            // 使用最大值和最小值的平均值
            gray = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
            break;
          case 'soft':
            // 使用加权平均值，增加绿色通道的权重
            gray = 0.25 * r + 0.65 * g + 0.1 * b;
            break;
        }

        // 应用亮度
        gray *= brightnessRatio;

        // 应用对比度
        gray = ((gray - 128) * contrastRatio) + 128;

        // 确保值在 0-255 范围内
        gray = Math.min(255, Math.max(0, gray));

        // 设置 RGB 值为相同的灰度值
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      // 将处理后的数据放回 canvas
      ctx.putImageData(imageData, 0, 0);

      // 转换为 base64 并返回
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.src = imageUrl;
  });
};

/**
 * 从图片中提取线稿
 */
export const extractSketch = async (
  imageUrl: string,
  threshold: number,
  thickness: number,
  smoothing: number
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // 创建 canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置 canvas 尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 应用高斯模糊以减少噪点
      const blurRadius = Math.max(1, Math.floor(smoothing / 10));
      applyGaussianBlur(data, canvas.width, canvas.height, blurRadius);

      // 使用Sobel算子检测边缘
      const edges = detectEdges(data, canvas.width, canvas.height, threshold / 100);

      // 应用线条粗细调整
      adjustLineThickness(edges, canvas.width, canvas.height, thickness / 100);

      // 将处理后的数据放回canvas
      for (let i = 0; i < data.length; i += 4) {
        const value = edges[i / 4];
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 255;   // A
      }

      ctx.putImageData(imageData, 0, 0);

      // 转换为base64并返回
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.src = imageUrl;
  });
};

// 高斯模糊
function applyGaussianBlur(data: Uint8ClampedArray, width: number, height: number, radius: number) {
  const kernel = generateGaussianKernel(radius);
  const temp = new Uint8ClampedArray(data.length);

  // 水平方向模糊
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, weight = 0;
      
      for (let i = -radius; i <= radius; i++) {
        const px = Math.min(Math.max(x + i, 0), width - 1);
        const idx = (y * width + px) * 4;
        const w = kernel[i + radius];
        
        r += data[idx] * w;
        g += data[idx + 1] * w;
        b += data[idx + 2] * w;
        weight += w;
      }

      const idx = (y * width + x) * 4;
      temp[idx] = r / weight;
      temp[idx + 1] = g / weight;
      temp[idx + 2] = b / weight;
      temp[idx + 3] = data[idx + 3];
    }
  }

  // 垂直方向模糊
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let r = 0, g = 0, b = 0, weight = 0;
      
      for (let i = -radius; i <= radius; i++) {
        const py = Math.min(Math.max(y + i, 0), height - 1);
        const idx = (py * width + x) * 4;
        const w = kernel[i + radius];
        
        r += temp[idx] * w;
        g += temp[idx + 1] * w;
        b += temp[idx + 2] * w;
        weight += w;
      }

      const idx = (y * width + x) * 4;
      data[idx] = r / weight;
      data[idx + 1] = g / weight;
      data[idx + 2] = b / weight;
      data[idx + 3] = temp[idx + 3];
    }
  }
}

// 生成高斯核
function generateGaussianKernel(radius: number): number[] {
  const kernel = new Array(radius * 2 + 1);
  const sigma = radius / 3;
  let sum = 0;

  for (let i = -radius; i <= radius; i++) {
    const exp = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel[i + radius] = exp;
    sum += exp;
  }

  // 归一化
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= sum;
  }

  return kernel;
}

// 边缘检测
function detectEdges(data: Uint8ClampedArray, width: number, height: number, threshold: number): Uint8ClampedArray {
  const edges = new Uint8ClampedArray(width * height);
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      // 计算Sobel算子
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const ki = (ky + 1) * 3 + (kx + 1);
          
          gx += gray * sobelX[ki];
          gy += gray * sobelY[ki];
        }
      }

      // 计算梯度强度
      const g = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = g > (threshold * 255) ? 255 : 0;
    }
  }

  return edges;
}

// 调整线条粗细
function adjustLineThickness(edges: Uint8ClampedArray, width: number, height: number, thickness: number) {
  const radius = Math.max(1, Math.floor(thickness * 3));
  const temp = new Uint8ClampedArray(edges.length);

  // 膨胀操作
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxValue = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const py = Math.min(Math.max(y + ky, 0), height - 1);
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          maxValue = Math.max(maxValue, edges[py * width + px]);
        }
      }

      temp[y * width + x] = maxValue;
    }
  }

  // 复制结果
  for (let i = 0; i < edges.length; i++) {
    edges[i] = temp[i];
  }
}

/**
 * 下载图片
 */
export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 将图片切割成九宫格或四宫格
 */
export const splitIntoGrid = async (
  imageUrl: string,
  gap: number = 0,
  padding: number = 0,
  backgroundColor: string = '#FFFFFF',
  gridSize: number = 3 // 3 表示九宫格，2 表示四宫格
): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // 计算每个格子的大小（正方形）
      const size = Math.min(img.width, img.height);
      const cellSize = Math.floor(size / gridSize);
      
      // 计算图片居中时的偏移量
      const offsetX = Math.floor((img.width - size) / 2);
      const offsetY = Math.floor((img.height - size) / 2);
      
      // 创建画布
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置单个格子的画布大小（包含间隙和内边距）
      const finalSize = cellSize + (padding * 2);
      canvas.width = finalSize;
      canvas.height = finalSize;

      // 存储每个格子的图片数据
      const gridImages: string[] = [];

      // 切割图片
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          // 清空画布
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, finalSize, finalSize);

          // 计算源图片的裁剪区域
          const sx = offsetX + (col * cellSize);
          const sy = offsetY + (row * cellSize);
          const sw = cellSize;
          const sh = cellSize;

          // 计算目标区域（考虑内边距）
          const dx = padding;
          const dy = padding;
          const dw = cellSize;
          const dh = cellSize;

          // 绘制图片
          ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

          // 转换为base64并保存
          gridImages.push(canvas.toDataURL('image/jpeg', 0.9));
        }
      }

      resolve(gridImages);
    };

    img.src = imageUrl;
  });
};

/**
 * 合并多张图片
 */
export const mergeImages = async (
  images: Array<{
    url: string;
    position: { x: number; y: number };
  }>,
  options: {
    gap: number;
    padding: number;
    backgroundColor: string;
    maxWidth?: number;
    maxHeight?: number;
    layout?: {
      gridSize?: number;      // 网格大小，用于自动布局
      autoArrange?: boolean;  // 是否自动排列
      direction?: 'horizontal' | 'vertical';  // 拼接方向
      fixedSize?: {          // 固定每个图片的大小
        width: number;
        height: number;
      };
      containerStyle?: {     // 容器样式
        borderRadius?: number;
        borderWidth?: number;
        borderColor?: string;
        borderStyle?: 'solid' | 'dashed';
        shadowColor?: string;
        shadowBlur?: number;
        shadowOffsetX?: number;
        shadowOffsetY?: number;
      };
    };
  }
): Promise<string> => {
  return new Promise((resolve) => {
    // 加载所有图片
    const loadImages = images.map(item => {
      return new Promise<{ img: HTMLImageElement; position: { x: number; y: number } }>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ img, position: item.position });
        img.src = item.url;
      });
    });

    Promise.all(loadImages).then(loadedImages => {
      // 如果启用自动排列，重新计算位置
      if (options.layout?.autoArrange) {
        const gridSize = options.layout.gridSize || Math.ceil(Math.sqrt(loadedImages.length));
        const fixedSize = options.layout.fixedSize || {
          width: Math.max(...loadedImages.map(({ img }) => img.width)),
          height: Math.max(...loadedImages.map(({ img }) => img.height))
        };

        // 根据方向计算位置
        const direction = options.layout.direction || 'horizontal';
        loadedImages.forEach((item, index) => {
          if (direction === 'horizontal') {
            item.position = {
              x: index * (fixedSize.width + options.gap),
              y: 0
            };
          } else {
            item.position = {
              x: 0,
              y: index * (fixedSize.height + options.gap)
            };
          }
        });
      }

      // 计算画布大小
      let totalWidth = 0;
      let totalHeight = 0;

      loadedImages.forEach(({ img, position }) => {
        const width = options.layout?.fixedSize?.width || img.width;
        const height = options.layout?.fixedSize?.height || img.height;
        const right = position.x + width;
        const bottom = position.y + height;
        totalWidth = Math.max(totalWidth, right);
        totalHeight = Math.max(totalHeight, bottom);
      });

      // 创建画布
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置画布大小（包含内边距）
      canvas.width = Math.ceil(totalWidth + (options.padding * 2));
      canvas.height = Math.ceil(totalHeight + (options.padding * 2));

      // 填充背景
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制每张图片
      loadedImages.forEach(({ img, position }) => {
        const width = options.layout?.fixedSize?.width || img.width;
        const height = options.layout?.fixedSize?.height || img.height;
        const x = position.x + options.padding;
        const y = position.y + options.padding;

        // 直接绘制图片，不添加任何装饰效果
        ctx.drawImage(
          img,
          0, 0, img.width, img.height,
          x, y, width, height
        );
      });

      // 如果有间距，绘制分隔线
      if (options.gap > 0) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        loadedImages.forEach(({ img, position }) => {
          const width = options.layout?.fixedSize?.width || img.width;
          const height = options.layout?.fixedSize?.height || img.height;
          const x = position.x + options.padding;
          const y = position.y + options.padding;
          
          // 只在需要的地方绘制分隔线
          const nextX = x + width + options.gap;
          const nextY = y + height + options.gap;
          if (nextX < canvas.width - options.padding) {
            ctx.beginPath();
            ctx.moveTo(nextX - options.gap/2, y);
            ctx.lineTo(nextX - options.gap/2, y + height);
            ctx.stroke();
          }
          if (nextY < canvas.height - options.padding) {
            ctx.beginPath();
            ctx.moveTo(x, nextY - options.gap/2);
            ctx.lineTo(x + width, nextY - options.gap/2);
            ctx.stroke();
          }
        });
      }

      // 转换为base64并返回，使用最高质量
      resolve(canvas.toDataURL('image/jpeg', 1.0));
    });
  });
};

export interface ImageEditOptions {
  brightness: number;    // 亮度 (-100 到 100)
  contrast: number;     // 对比度 (-100 到 100)
  saturation: number;   // 饱和度 (-100 到 100)
  highlights: number;   // 高光 (-100 到 100)
  shadows: number;      // 阴影 (-100 到 100)
  temperature: number;  // 色温 (2000K 到 9000K)
  vignette: number;    // 晕影 (0 到 100)
  sharpness: number;   // 锐化 (0 到 100)
  rotation: number;     // 旋转角度 (0-360)
  flipHorizontal: boolean; // 水平翻转
  flipVertical: boolean;   // 垂直翻转
  crop?: {              // 裁剪区域
    x: number;
    y: number;
    width: number;
    height: number;
  };
  resize?: {            // 调整大小
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
}

// 滤镜预设
const filterPresets = {
  none: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 50,
    tint: 0,
    highlights: 0,
    shadows: 0,
    vignette: 0,
  },
  japanese: {
    brightness: 5,
    contrast: 10,
    saturation: -15,
    temperature: 45,
    tint: 5,
    highlights: -10,
    shadows: 10,
    vignette: 20,
  },
  vintage: {
    brightness: -5,
    contrast: 15,
    saturation: -20,
    temperature: 60,
    tint: 10,
    highlights: -15,
    shadows: 15,
    vignette: 30,
  },
  cold: {
    brightness: 0,
    contrast: 5,
    saturation: -5,
    temperature: 35,
    tint: -10,
    highlights: -5,
    shadows: 5,
    vignette: 10,
  },
  warm: {
    brightness: 5,
    contrast: 5,
    saturation: 10,
    temperature: 65,
    tint: 10,
    highlights: -5,
    shadows: 5,
    vignette: 10,
  },
  cinema: {
    brightness: -5,
    contrast: 20,
    saturation: -10,
    temperature: 55,
    tint: 0,
    highlights: -20,
    shadows: 20,
    vignette: 40,
  },
  'cyan-orange': {
    brightness: 0,
    contrast: 15,
    saturation: 20,
    temperature: 55,
    tint: -15,
    highlights: -10,
    shadows: 15,
    vignette: 25,
  },
  'sunset': {
    brightness: 5,
    contrast: 10,
    saturation: 25,
    temperature: 75,
    tint: 15,
    highlights: -5,
    shadows: 10,
    vignette: 15,
  },
  'forest': {
    brightness: -5,
    contrast: 15,
    saturation: 30,
    temperature: 40,
    tint: -20,
    highlights: -15,
    shadows: 15,
    vignette: 20,
  },
  'dramatic': {
    brightness: -10,
    contrast: 30,
    saturation: 15,
    temperature: 45,
    tint: 0,
    highlights: -25,
    shadows: 25,
    vignette: 45,
  },
  'fade': {
    brightness: 10,
    contrast: -10,
    saturation: -20,
    temperature: 55,
    tint: 5,
    highlights: 15,
    shadows: -15,
    vignette: 10,
  },
  'noir': {
    brightness: -15,
    contrast: 40,
    saturation: -80,
    temperature: 50,
    tint: 0,
    highlights: -20,
    shadows: 20,
    vignette: 50,
  },
  'vivid': {
    brightness: 10,
    contrast: 20,
    saturation: 40,
    temperature: 55,
    tint: 0,
    highlights: -10,
    shadows: 10,
    vignette: 0,
  },
  'retro': {
    brightness: 0,
    contrast: 10,
    saturation: -30,
    temperature: 65,
    tint: 20,
    highlights: -20,
    shadows: 10,
    vignette: 35,
  },
  'elegant': {
    brightness: 5,
    contrast: 15,
    saturation: -10,
    temperature: 48,
    tint: -5,
    highlights: -15,
    shadows: 15,
    vignette: 25,
  },
};

// 应用滤镜效果
const applyFilter = (rgb: number[], filter: FilterType): number[] => {
  if (filter === 'none') return rgb;

  const preset = filterPresets[filter];
  const [r, g, b] = rgb;

  // 转换为HSL以便调整
  const hsl = rgbToHsl(r, g, b);

  // 应用预设效果
  hsl[1] = Math.max(0, Math.min(1, hsl[1] * (1 + preset.saturation / 100))); // 饱和度
  hsl[2] = Math.max(0, Math.min(1, hsl[2] * (1 + preset.brightness / 100))); // 亮度

  // 转回RGB
  let [newR, newG, newB] = hslToRgb(hsl[0], hsl[1], hsl[2]);

  // 应用对比度
  const factor = (259 * (preset.contrast + 255)) / (255 * (259 - preset.contrast));
  newR = factor * (newR - 128) + 128;
  newG = factor * (newG - 128) + 128;
  newB = factor * (newB - 128) + 128;

  // 应用色温
  const tempFactor = (preset.temperature - 50) / 100;
  newR += tempFactor * 30;
  newB -= tempFactor * 30;

  // 应用色调
  const tintFactor = preset.tint / 100;
  newG += tintFactor * 20;
  newB -= tintFactor * 20;

  return [
    Math.max(0, Math.min(255, newR)),
    Math.max(0, Math.min(255, newG)),
    Math.max(0, Math.min(255, newB))
  ];
};

// 在editImage函数中修改色温处理部分
// 应用色温
const kelvinToRGB = (kelvin: number) => {
  // 将开尔文温度转换为RGB值的算法
  const temp = kelvin / 100;
  let red, green, blue;

  if (temp <= 66) {
    red = 255;
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
    if (temp <= 19) {
      blue = 0;
    } else {
      blue = temp - 10;
      blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    }
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
    blue = 255;
  }

  return {
    r: Math.min(255, Math.max(0, red)),
    g: Math.min(255, Math.max(0, green)),
    b: Math.min(255, Math.max(0, blue))
  };
};

/**
 * 编辑图片
 */
export const editImage = async (
  imageUrl: string,
  options: ImageEditOptions
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 处理调整大小
      let width = img.width;
      let height = img.height;
      if (options.resize) {
        if (options.resize.maintainAspectRatio) {
          const ratio = Math.min(
            options.resize.width / width,
            options.resize.height / height
          );
          width = width * ratio;
          height = height * ratio;
        } else {
          width = options.resize.width;
          height = options.resize.height;
        }
      }

      // 设置canvas尺寸
      canvas.width = width;
      canvas.height = height;

      // 应用变换
      ctx.save();

      // 处理旋转和翻转
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((options.rotation * Math.PI) / 180);
      ctx.scale(
        options.flipHorizontal ? -1 : 1,
        options.flipVertical ? -1 : 1
      );
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 应用基础调整
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // 1. 应用亮度（使用新的实现方式）
        if (options.brightness !== 0) {
          if (options.brightness > 0) {
            // 增加亮度时，将暗部提亮
            r = r + (255 - r) * (options.brightness / 100);
            g = g + (255 - g) * (options.brightness / 100);
            b = b + (255 - b) * (options.brightness / 100);
          } else {
            // 降低亮度时，将亮部压暗
            const factor = 1 + (options.brightness / 100);
            r *= factor;
            g *= factor;
            b *= factor;
          }
        }

        // 2. 应用对比度
        if (options.contrast !== 0) {
          const factor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
          r = factor * (r - 128) + 128;
          g = factor * (g - 128) + 128;
          b = factor * (b - 128) + 128;
        }

        // 3. 应用高光和阴影
        if (options.highlights !== 0 || options.shadows !== 0) {
          const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          if (luminance > 0.5 && options.highlights !== 0) {
            // 调整高光
            const factor = 1 + (options.highlights / 200);
            r = r + (255 - r) * factor;
            g = g + (255 - g) * factor;
            b = b + (255 - b) * factor;
          } else if (luminance <= 0.5 && options.shadows !== 0) {
            // 调整阴影
            const factor = 1 + (options.shadows / 200);
            r = r * factor;
            g = g * factor;
            b = b * factor;
          }
        }

        // 4. 应用饱和度
        if (options.saturation !== 0) {
          const hsl = rgbToHsl(r, g, b);
          if (options.saturation > 0) {
            hsl[1] = hsl[1] + (1 - hsl[1]) * (options.saturation / 100);
          } else {
            hsl[1] = hsl[1] * (1 + options.saturation / 100);
          }
          [r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2]);
        }

        // 5. 应用色温
        if (options.temperature !== 50) {
          const kelvin = 2000 + (options.temperature / 100 * 7000);
          const targetTemp = kelvinToRGB(kelvin);
          const currentTemp = kelvinToRGB(6500); // 标准色温

          r *= targetTemp.r / currentTemp.r;
          g *= targetTemp.g / currentTemp.g;
          b *= targetTemp.b / currentTemp.b;
        }

        // 6. 应用滤镜
        if (options.filter !== 'none') {
          [r, g, b] = applyFilter([r, g, b], options.filter);
        }

        // 7. 应用锐化
        if (options.sharpness > 0) {
          const x = Math.floor((i / 4) % canvas.width);
          const y = Math.floor((i / 4) / canvas.width);
          
          if (x > 0 && x < canvas.width - 1 && y > 0 && y < canvas.height - 1) {
            const sharpness = options.sharpness / 400;
            const kernel = [
              -sharpness, -sharpness, -sharpness,
              -sharpness, 1 + (8 * sharpness), -sharpness,
              -sharpness, -sharpness, -sharpness
            ];
            
            let sumR = 0, sumG = 0, sumB = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const idx = ((y + ky) * canvas.width + (x + kx)) * 4;
                const k = kernel[(ky + 1) * 3 + (kx + 1)];
                sumR += data[idx] * k;
                sumG += data[idx + 1] * k;
                sumB += data[idx + 2] * k;
              }
            }
            r = sumR;
            g = sumG;
            b = sumB;
          }
        }

        // 8. 应用晕影
        if (options.vignette > 0) {
          const x = Math.floor((i / 4) % canvas.width);
          const y = Math.floor((i / 4) / canvas.width);
          
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          
          const vignetteFactor = Math.cos((distance / maxDistance) * (options.vignette / 100) * Math.PI / 2);
          r *= vignetteFactor;
          g *= vignetteFactor;
          b *= vignetteFactor;
        }

        // 确保值在0-255范围内
        data[i] = Math.max(0, Math.min(255, Math.round(r)));
        data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
        data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
      }

      // 将处理后的数据放回canvas
      ctx.putImageData(imageData, 0, 0);

      // 处理裁剪
      if (options.crop) {
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        if (!croppedCtx) return;

        croppedCanvas.width = options.crop.width;
        croppedCanvas.height = options.crop.height;

        croppedCtx.drawImage(
          canvas,
          options.crop.x,
          options.crop.y,
          options.crop.width,
          options.crop.height,
          0,
          0,
          options.crop.width,
          options.crop.height
        );

        resolve(croppedCanvas.toDataURL('image/jpeg', 0.9));
      } else {
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      }
    };

    img.src = imageUrl;
  });
};

// RGB转HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, l];
}

// HSL转RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r * 255, g * 255, b * 255];
} 