// TypeScript 类型定义

/** 评估任务 */
export interface EvaluationTask {
  id: string
  name: string
  description: string
  dataset: string
  createdAt: string
  updatedAt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  metrics?: TaskMetrics
}

/** 任务指标 */
export interface TaskMetrics {
  faithfulness: number
  context_precision: number
  context_recall: number
  answer_relevancy?: number
}

/** 评估样本 */
export interface EvaluationSample {
  id: string
  user_input: string
  response: string
  retrieved_contexts: string[]
  reference: string
  metrics?: SampleMetrics
}

/** 样本指标 */
export interface SampleMetrics {
  faithfulness: number
  context_precision: number
  context_recall: number
  answer_relevancy?: number
  explanation?: string
}

/** 评估请求数据 */
export interface EvaluationRequest {
  user_input: string[]
  response: string[]
  retrieved_contexts: string[][]
  reference: string[]
}

/** 评估结果 */
export interface EvaluationResult {
  faithfulness: number
  context_precision: number
  context_recall: number
  answer_relevancy?: number
}

/** 版本对比数据 */
export interface VersionCompare {
  version1: {
    name: string
    metrics: TaskMetrics
  }
  version2: {
    name: string
    metrics: TaskMetrics
  }
}
