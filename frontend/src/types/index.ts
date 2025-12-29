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
  /** 评估输入数据（用于复现） */
  input?: EvaluationInput
}

/** 评估输入数据 */
export interface EvaluationInput {
  user_input: string
  response: string
  retrieved_contexts: string[]
  reference: string
}

/** 任务指标 */
export interface TaskMetrics {
  faithfulness: number
  context_precision: number
  context_recall: number
  noise_sensitivity?: number
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
  /** 指标开关配置 */
  metrics_config?: MetricsConfig
}

/** 指标开关配置 */
export interface MetricsConfig {
  faithfulness?: boolean
  context_precision?: boolean
  context_recall?: boolean
  noise_sensitivity?: boolean
  answer_relevancy?: boolean
}

/** 评估结果（API 返回） */
export interface EvaluationResult {
  scores: ScoreItem[]
  dataset?: any
  traces?: any[]
  ragas_traces?: Record<string, any>
}

/** 单条评分 */
export interface ScoreItem {
  faithfulness: number
  context_precision: number
  context_recall: number
  'noise_sensitivity(mode=relevant)'?: number
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
