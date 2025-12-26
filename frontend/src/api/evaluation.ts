import request from '@/utils/request'
import type { EvaluationRequest, EvaluationResult } from '@/types'

/** RAG 评估 API */
export const evaluationApi = {
  // 执行评估
  evaluate(data: EvaluationRequest) {
    return request.post<EvaluationResult>('/rag/evaluation', data)
  }
}
