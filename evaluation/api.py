from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datasets import Dataset
from typing import List
from evaluation.tool import evaluate_ragas
from fastapi.openapi.docs import get_swagger_ui_html
# 有时会这样使用
from fastapi import applications
import uvicorn
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

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MetricsConfig(BaseModel):
    """ 指标开关配置 """
    faithfulness: bool = Field(True, description="是否评估忠实度")
    context_precision: bool = Field(True, description="是否评估上下文精确度")
    context_recall: bool = Field(True, description="是否评估上下文召回率")
    noise_sensitivity: bool = Field(True, description="是否评估噪声敏感度")
    answer_relevancy: bool = Field(True, description="是否评估回答相关性")


class EvaluationData(BaseModel):
    user_input: List[str] = Field(..., description="用户问题列表")
    response: List[str] = Field(..., description="RAG生成的回答列表")
    retrieved_contexts: List[List[str]] = Field(..., description="检索到的上下文列表（二维数组）")
    reference: List[str] = Field(..., description="标准答案列表")
    metrics_config: MetricsConfig = Field(default_factory=MetricsConfig, description="指标开关配置")

    class ConfigDict:
        json_schema_extra = {
            "example": {
                "user_input": ["Who is the most popular singer in China?"],
                "response": ["周杰伦"],
                "retrieved_contexts": [["周杰伦是华语流行音乐歌手"]],
                "reference": ["周杰伦"]
            }
        }


@app.post("/rag/evaluation")
def evaluate(data: EvaluationData):
    """
    RAG评估接口
    
    接收评估数据，返回 faithfulness、context_precision、context_recall 等指标
    """
    data_dict = data.model_dump()
    ragas_data = {
        "question": data_dict["user_input"],
        "answer": data_dict["response"],
        "contexts": data_dict["retrieved_contexts"],
        "ground_truth": data_dict["reference"]
    }
    dataset = Dataset.from_dict(ragas_data)

    # 传递指标配置
    metrics_config = data.metrics_config.model_dump()
    result = evaluate_ragas(dataset, metrics_config)

    return result

# 仅当直接运行此文件时才启动服务器
if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)