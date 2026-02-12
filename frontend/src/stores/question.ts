import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { QAQuestion } from '@/types'

// localStorage key
const STORAGE_KEY = 'rag_evaluation_questions'

// 默认示例问题
const defaultQuestions: QAQuestion[] = [
  {
    id: '1',
    query: '谁是中国最受欢迎的歌手？',
    reference: '周杰伦',
    createdAt: '2024-12-20T10:00:00Z'
  },
  {
    id: '2',
    query: 'Python 是什么？',
    reference: 'Python 是一种高级编程语言',
    createdAt: '2024-12-20T10:30:00Z'
  },
  {
    id: '3',
    query: '如何学习前端开发？',
    reference: '学习 HTML、CSS、JavaScript 基础，然后学习框架如 Vue 或 React',
    createdAt: '2024-12-20T11:00:00Z'
  }
]

/**
 * 从 localStorage 加载问题
 */
const loadQuestionsFromStorage = (): QAQuestion[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : defaultQuestions
  } catch {
    return defaultQuestions
  }
}

/**
 * 保存问题到 localStorage
 */
const saveQuestionsToStorage = (questions: QAQuestion[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
}

/**
 * 问题库状态管理
 * 数据持久化到浏览器 localStorage
 */
export const useQuestionStore = defineStore('question', () => {
  // 问题列表（从 localStorage 加载）
  const questions = ref<QAQuestion[]>(loadQuestionsFromStorage())

  // 当前选中的问题
  const currentQuestion = ref<QAQuestion | null>(null)

  // 加载状态
  const loading = ref(false)

  /**
   * 获取问题列表（从 localStorage 重新加载）
   */
  const fetchQuestions = async () => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 100))
    // 重新从 localStorage 加载数据
    questions.value = loadQuestionsFromStorage()
    loading.value = false
  }

  /**
   * 获取问题详情
   */
  const fetchQuestionDetail = async (id: string) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 100))
    currentQuestion.value = questions.value.find(q => q.id === id) || null
    loading.value = false
  }

  /**
   * 创建问题
   */
  const createQuestion = async (data: Partial<QAQuestion>) => {
    const newQuestion: QAQuestion = {
      id: Date.now().toString(),
      query: data.query || '',
      reference: data.reference || '',
      createdAt: new Date().toISOString()
    }
    questions.value.unshift(newQuestion)
    return newQuestion
  }

  /**
   * 更新问题
   */
  const updateQuestion = async (id: string, data: Partial<QAQuestion>) => {
    const index = questions.value.findIndex(q => q.id === id)
    if (index !== -1) {
      questions.value[index] = { ...questions.value[index], ...data }
      if (currentQuestion.value?.id === id) {
        currentQuestion.value = questions.value[index]
      }
      return questions.value[index]
    }
    throw new Error('Question not found')
  }

  /**
   * 删除问题
   */
  const deleteQuestion = async (id: string) => {
    questions.value = questions.value.filter(q => q.id !== id)
    if (currentQuestion.value?.id === id) {
      currentQuestion.value = null
    }
  }

  /**
   * 清空问题列表
   */
  const clearQuestions = async () => {
    questions.value = []
    currentQuestion.value = null
  }

  // 监听问题变化，自动保存到 localStorage
  watch(
    questions,
    newQuestions => {
      saveQuestionsToStorage(newQuestions)
    },
    { deep: true }
  )

  return {
    questions,
    currentQuestion,
    loading,
    fetchQuestions,
    fetchQuestionDetail,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    clearQuestions
  }
})
