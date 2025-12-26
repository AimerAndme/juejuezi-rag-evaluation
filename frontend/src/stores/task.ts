import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EvaluationTask, EvaluationSample } from '@/types'

/**
 * 评估任务状态管理（Mock 数据）
 * 使用本地数据模拟任务管理功能
 */
export const useTaskStore = defineStore('task', () => {
  // Mock 任务列表
  const tasks = ref<EvaluationTask[]>([
    {
      id: '1',
      name: '示例任务 1',
      description: 'RAG 系统基础评估',
      dataset: 'dataset_v1.json',
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:30:00Z',
      status: 'completed',
      metrics: {
        faithfulness: 0.85,
        context_precision: 0.78,
        context_recall: 0.82,
        answer_relevancy: 0.88
      }
    },
    {
      id: '2',
      name: '示例任务 2',
      description: 'RAG 系统优化后评估',
      dataset: 'dataset_v2.json',
      createdAt: '2024-12-21T14:00:00Z',
      updatedAt: '2024-12-21T14:45:00Z',
      status: 'completed',
      metrics: {
        faithfulness: 0.91,
        context_precision: 0.84,
        context_recall: 0.87,
        answer_relevancy: 0.92
      }
    },
    {
      id: '3',
      name: '示例任务 3',
      description: '进行中的评估任务',
      dataset: 'dataset_v3.json',
      createdAt: '2024-12-26T09:00:00Z',
      updatedAt: '2024-12-26T09:00:00Z',
      status: 'running'
    }
  ])

  // 当前选中的任务
  const currentTask = ref<EvaluationTask | null>(null)

  // Mock 样本列表
  const currentSamples = ref<EvaluationSample[]>([
    {
      id: '1',
      user_input: '谁是中国最受欢迎的歌手？',
      response: '周杰伦是中国最受欢迎的歌手之一',
      retrieved_contexts: ['周杰伦是华语流行音乐歌手', '他的歌曲深受年轻人喜爱'],
      reference: '周杰伦',
      metrics: {
        faithfulness: 0.92,
        context_precision: 0.88,
        context_recall: 0.85,
        answer_relevancy: 0.9
      }
    },
    {
      id: '2',
      user_input: 'Python 是什么？',
      response: 'Python 是一种高级编程语言',
      retrieved_contexts: ['Python 是一种解释型、面向对象的编程语言'],
      reference: 'Python 是一种编程语言',
      metrics: {
        faithfulness: 0.95,
        context_precision: 0.92,
        context_recall: 0.88,
        answer_relevancy: 0.94
      }
    }
  ])

  // 加载状态
  const loading = ref(false)

  /**
   * 获取任务列表（Mock）
   */
  const fetchTasks = async () => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    loading.value = false
  }

  /**
   * 获取任务详情（Mock）
   */
  const fetchTaskDetail = async (id: string) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    currentTask.value = tasks.value.find(t => t.id === id) || null
    loading.value = false
  }

  /**
   * 获取任务样本（Mock）
   */
  const fetchTaskSamples = async (taskId: string) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    loading.value = false
  }

  /**
   * 创建任务（Mock）
   */
  const createTask = async (data: Partial<EvaluationTask>) => {
    const newTask: EvaluationTask = {
      id: Date.now().toString(),
      name: data.name || '新任务',
      description: data.description || '',
      dataset: data.dataset || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    }
    tasks.value.unshift(newTask)
    return newTask
  }

  /**
   * 更新任务（Mock）
   */
  const updateTask = async (id: string, data: Partial<EvaluationTask>) => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...data }
      if (currentTask.value?.id === id) {
        currentTask.value = tasks.value[index]
      }
      return tasks.value[index]
    }
    throw new Error('Task not found')
  }

  /**
   * 删除任务（Mock）
   */
  const deleteTask = async (id: string) => {
    tasks.value = tasks.value.filter(t => t.id !== id)
    if (currentTask.value?.id === id) {
      currentTask.value = null
    }
  }

  return {
    tasks,
    currentTask,
    currentSamples,
    loading,
    fetchTasks,
    fetchTaskDetail,
    fetchTaskSamples,
    createTask,
    updateTask,
    deleteTask
  }
})
