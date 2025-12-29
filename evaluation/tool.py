import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_community.embeddings import DashScopeEmbeddings
from ragas import evaluate
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.metrics import faithfulness, context_recall, context_precision, NoiseSensitivity, answer_relevancy
from datasets import Dataset

load_dotenv()
llm = ChatOpenAI(
    model="qwen-flash",
    api_key=os.getenv("LLM_API_KEY"),
    base_url=os.getenv("LLM_BASE_URL"),
)
evaluator_llm = LangchainLLMWrapper(llm)

embeddings = DashScopeEmbeddings(
    model="text-embedding-v3",
    dashscope_api_key=os.getenv("LLM_API_KEY"),
)
evaluator_embeddings = LangchainEmbeddingsWrapper(embeddings)


def evaluate_ragas(dataset, metrics_config=None):
    """
    执行 RAGAS 评估
    
    Args:
        dataset: 评估数据集
        metrics_config: 指标开关配置
    """
    if metrics_config is None:
        metrics_config = {
            'faithfulness': True,
            'context_precision': True,
            'context_recall': True,
            'noise_sensitivity': True,
            'answer_relevancy': True
        }
    
    try:
        print(f"✅ 评估数据集构建完成，样本数量：{len(dataset)}")
        print(f"✅ 指标配置：{metrics_config}")
        
        # 根据配置动态选择指标
        selected_metrics = []
        if metrics_config.get('faithfulness', True):
            selected_metrics.append(faithfulness)
        if metrics_config.get('context_precision', True):
            selected_metrics.append(context_precision)
        if metrics_config.get('context_recall', True):
            selected_metrics.append(context_recall)
        if metrics_config.get('noise_sensitivity', True):
            selected_metrics.append(NoiseSensitivity())
        if metrics_config.get('answer_relevancy', True):
            selected_metrics.append(answer_relevancy)
        
        if not selected_metrics:
            raise ValueError("至少需要选择一个评估指标")
        
        print(f"✅ 已选择指标：{[m.__class__.__name__ if hasattr(m, '__class__') else str(m) for m in selected_metrics]}")
        
        evaluation_result = evaluate(
            dataset=dataset,
            metrics=selected_metrics,
            llm=evaluator_llm,
            embeddings=evaluator_embeddings,
        )
        print(f"✅ 评估完成，结果：{evaluation_result}")
        return evaluation_result
    except Exception as e:
        raise RuntimeError(f"RAGAS评估失败：{str(e)}")
