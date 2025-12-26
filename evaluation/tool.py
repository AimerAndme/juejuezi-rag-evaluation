import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from ragas import evaluate
from ragas.llms import LangchainLLMWrapper
from ragas.metrics import faithfulness, context_recall, context_precision
from datasets import Dataset

load_dotenv()
llm = ChatOpenAI(
    model=os.getenv("LLM_MODEL_ID"),  # 模型名称
    api_key=os.getenv("LLM_API_KEY"),
    base_url=os.getenv("LLM_BASE_URL"),
)
evaluator_llm = LangchainLLMWrapper(llm)


def evaluate_ragas(dataset):  # 执行评估（指定需要计算的指标）
    try:
        print(f"✅ 评估数据集构建完成，样本数量：{len(dataset)}")
        evaluation_result = evaluate(
            dataset=dataset,
            metrics=[context_precision, context_recall, faithfulness],
            llm=evaluator_llm,
        )
        return evaluation_result
    except Exception as e:
        raise RuntimeError(f"RAGAS评估失败：{str(e)}")
