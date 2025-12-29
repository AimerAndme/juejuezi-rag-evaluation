import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { EvaluationTask, EvaluationSample } from '@/types'

// localStorage key
const STORAGE_KEY = 'rag_evaluation_tasks'

// 默认示例数据
const defaultTasks: EvaluationTask[] = [
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
      context_recall: 0.82
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
      context_recall: 0.87
    }
  }
]

/**
 * 从 localStorage 加载任务
 */
const loadTasksFromStorage = (): EvaluationTask[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : defaultTasks
  } catch {
    return defaultTasks
  }
}

/**
 * 保存任务到 localStorage
 */
const saveTasksToStorage = (tasks: EvaluationTask[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

/**
 * 评估任务状态管理
 * 数据持久化到浏览器 localStorage
 */
export const useTaskStore = defineStore('task', () => {
  // 任务列表（从 localStorage 加载）
  const tasks = ref<EvaluationTask[]>(loadTasksFromStorage())

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
        context_recall: 0.85
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
        context_recall: 0.88
      }
    }
  ])

  // 加载状态
  const loading = ref(false)

  /**
   * 获取任务列表（从 localStorage 重新加载）
   */
  const fetchTasks = async () => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 100))
    // 重新从 localStorage 加载数据
    tasks.value = loadTasksFromStorage()
    loading.value = false
  }

  /**
   * 获取任务详情
   */
  const fetchTaskDetail = async (id: string) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 100))
    currentTask.value = tasks.value.find(t => t.id === id) || null
    loading.value = false
  }

  /**
   * 获取任务样本
   */
  const fetchTaskSamples = async (_taskId: string) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 100))
    loading.value = false
  }

  /**
   * 创建任务
   */
  const createTask = async (data: Partial<EvaluationTask>) => {
    const newTask: EvaluationTask = {
      id: Date.now().toString(),
      name: data.name || '新任务',
      description: data.description || '',
      dataset: data.dataset || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: data.status || 'pending',
      metrics: data.metrics,
      input: data.input
    }
    tasks.value.unshift(newTask)
    return newTask
  }

  /**
   * 更新任务
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
   * 删除任务
   */
  const deleteTask = async (id: string) => {
    tasks.value = tasks.value.filter(t => t.id !== id)
    if (currentTask.value?.id === id) {
      currentTask.value = null
    }
  }

  // 监听任务变化，自动保存到 localStorage
  watch(
    tasks,
    newTasks => {
      saveTasksToStorage(newTasks)
    },
    { deep: true }
  )

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
