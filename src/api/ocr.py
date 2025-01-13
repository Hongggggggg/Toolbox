from fastapi import FastAPI, UploadFile, HTTPException
from paddleocr import PaddleOCR
import numpy as np
import cv2
import io
from PIL import Image
import time
import logging
from typing import List, Dict, Any
import traceback

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# 初始化PaddleOCR
try:
    ocr = PaddleOCR(use_angle_cls=True, lang="ch", use_gpu=False)
    logger.info("PaddleOCR初始化成功")
except Exception as e:
    logger.error(f"PaddleOCR初始化失败: {str(e)}\n{traceback.format_exc()}")
    raise

@app.post("/api/ocr")
async def process_ocr(image: UploadFile) -> Dict[str, Any]:
    """
    处理OCR请求
    :param image: 上传的图片文件
    :return: OCR识别结果
    """
    try:
        # 验证文件类型
        if not image.content_type:
            raise HTTPException(status_code=400, detail="无法识别文件类型")
            
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="只支持图片文件")

        # 读取图片
        try:
            image_data = await image.read()
            if not image_data:
                raise HTTPException(status_code=400, detail="图片数据为空")
                
            image_array = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

            if img is None:
                raise HTTPException(status_code=400, detail="无法解析图片数据")
                
            if img.size == 0:
                raise HTTPException(status_code=400, detail="图片内容为空")
        except Exception as e:
            logger.error(f"图片读取失败: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=400, detail="图片读取失败")

        # 记录开始时间
        start_time = time.time()

        try:
            # 执行OCR识别
            result = ocr.ocr(img, cls=True)
            
            if result is None:
                raise HTTPException(status_code=500, detail="OCR识别失败")
        except Exception as e:
            logger.error(f"OCR识别失败: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="OCR识别过程出错")

        # 处理识别结果
        blocks = []
        try:
            for line in result:
                for item in line:
                    box = item[0]  # 文本框坐标
                    text = item[1][0]  # 识别的文本
                    confidence = float(item[1][1])  # 置信度

                    # 验证数据
                    if not isinstance(text, str) or not text.strip():
                        continue
                        
                    if not isinstance(confidence, (int, float)) or confidence < 0:
                        continue
                        
                    if not box or len(box) != 4:
                        continue

                    blocks.append({
                        "box": [
                            int(box[0][0]),  # x1
                            int(box[0][1]),  # y1
                            int(box[2][0]),  # x2
                            int(box[2][1])   # y2
                        ],
                        "text": text.strip(),
                        "confidence": min(1.0, max(0.0, confidence))  # 确保置信度在0-1之间
                    })
        except Exception as e:
            logger.error(f"结果处理失败: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="识别结果处理失败")

        if not blocks:
            raise HTTPException(status_code=404, detail="未能识别出任何文字")

        # 计算处理时间
        processing_time = int((time.time() - start_time) * 1000)  # 转换为毫秒

        return {
            "blocks": blocks,
            "processing_time": processing_time
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"未预期的错误: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="服务器内部错误")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 