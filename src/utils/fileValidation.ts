/**
 * 文件大小限制（5MB）
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * 允许的图片类型
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * 验证图片文件
 * @param file 要验证的文件
 * @returns 错误信息，如果没有错误则返回null
 */
export const validateImageFile = (file: File): string | null => {
  // 检查文件类型
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return '不支持的文件类型，请上传 JPG、PNG 或 WebP 格式的图片';
  }

  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    return `图片大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }

  return null;
}; 