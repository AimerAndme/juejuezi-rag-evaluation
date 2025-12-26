from evaluation.tool import evaluate_ragas
from datasets import Dataset

if __name__ == '__main__':
    questions = [
        "Who is the most popular singer in China?",
    ]
    answers = [
    "周杰伦"]
    contexts = [
        ["周杰伦是华语inalsinger，是华语inalsinger，是华语"]]
    ground_truths = [
        "周杰伦",
    ]
    data = {
        "user_input": questions,  # 用户问题
        "response": answers,  # RAG生成的回答
        "retrieved_contexts": contexts,  # 检索到的上下文
        "reference": ground_truths  # 标准答案
    }
    print(f"✅ 评估数据集构建完成，样本结构：")
    result = evaluate_ragas(data)
    print("Hello World!")
    print(result)
