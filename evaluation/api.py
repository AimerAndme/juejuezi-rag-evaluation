from fastapi import FastAPI
from pydantic import BaseModel, Field
from datasets import Dataset
from typing import List
from evaluation.tool import evaluate_ragas
from fastapi.openapi.docs import get_swagger_ui_html
# 有时会这样使用
from fastapi import applications


def swagger_monkey_patch(*args, **kwargs):
    """
    覆盖生成 /docs 端点 HTML 时的默认值，
    将 Swagger UI 的 JS 和 CSS 替换为 CDN 链接。
    """
    return get_swagger_ui_html(
        *args,
        **kwargs,
        swagger_js_url="https://cdn.bootcdn.net/ajax/libs/swagger-ui/5.6.2/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.bootcdn.net/ajax/libs/swagger-ui/5.6.2/swagger-ui.min.css"
    )


# Actual monkey patch
applications.get_swagger_ui_html = swagger_monkey_patch
app = FastAPI()


class EvaluationData(BaseModel):
    user_input: List[str] = Field(..., description="用户问题列表")
    response: List[str] = Field(..., description="RAG生成的回答列表")
    retrieved_contexts: List[List[str]] = Field(..., description="检索到的上下文列表（二维数组）")
    reference: List[str] = Field(..., description="标准答案列表")

    class Config:
        json_schema_extra = {
            "example": {
                "user_input": ["Who is the most popular singer in China?"],
                "response": ["周杰伦"],
                "retrieved_contexts": [["周杰伦是华语流行音乐歌手"]],
                "reference": ["周杰伦"]
            }
        }


@app.post("/rag/evaluation")
async def evaluate(data: EvaluationData):
    """
    RAG评估接口
    
    接收评估数据，返回 faithfulness、context_precision、context_recall 等指标
    """
    # 将 Pydantic 模型转换为字典，再转换为 Dataset
    dataset = Dataset.from_dict(data.model_dump())

    # 执行评估
    result = evaluate_ragas(dataset)

    return result
