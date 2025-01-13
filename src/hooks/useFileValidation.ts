interface ValidationOptions {
  type?: string[];
  maxSize?: number;
  minSize?: number;
}

export function useFileValidation() {
  const validateFile = async (
    file: File,
    options: ValidationOptions = {}
  ): Promise<boolean> => {
    const { type, maxSize, minSize } = options;

    // 验证文件类型
    if (type && type.length > 0) {
      const isValidType = type.includes(file.type);
      if (!isValidType) {
        return false;
      }
    }

    // 验证文件大小
    if (maxSize !== undefined && file.size > maxSize) {
      return false;
    }

    if (minSize !== undefined && file.size < minSize) {
      return false;
    }

    return true;
  };

  return { validateFile };
} 