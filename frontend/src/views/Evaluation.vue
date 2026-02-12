<template>
  <div class="debug-container">
    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" class="evaluation-tabs">
      <!-- 手动评估标签页 -->
      <el-tab-pane label="手动评估" name="manual">
        <el-card class="debug-card">
          <template #header>
            <div class="card-header">
              <span>样本调试</span>
              <el-button type="primary" @click="handleEvaluate" :loading="loading">
                <el-icon><DataAnalysis /></el-icon>
                执行评估
              </el-button>
            </div>
          </template>

          <el-form :model="debugForm" label-width="120px" class="debug-form">
            <!-- 用户问题 -->
            <el-form-item label="用户问题" required>
              <el-input
                v-model="debugForm.question"
                type="textarea"
                :rows="3"
                placeholder="请输入用户问题"
              />
            </el-form-item>

            <!-- 检索上下文 -->
            <el-form-item label="检索上下文" required>
              <div class="contexts-container">
                <div v-for="(_, index) in debugForm.contexts" :key="index" class="context-item">
                  <el-input
                    v-model="debugForm.contexts[index]"
                    type="textarea"
                    :rows="2"
                    :placeholder="`上下文 ${index + 1}`"
                  />
                  <el-button
                    type="danger"
                    text
                    @click="removeContext(index)"
                    v-if="debugForm.contexts.length > 1"
                  >
                    删除
                  </el-button>
                </div>
                <el-button @click="addContext" text>
                  <el-icon><Plus /></el-icon>
                  添加上下文
                </el-button>
              </div>
            </el-form-item>

            <!-- 模型回答 -->
            <el-form-item label="模型回答" required>
              <el-input
                v-model="debugForm.response"
                type="textarea"
                :rows="4"
                placeholder="请输入模型回答"
              />
            </el-form-item>

            <!-- 标准答案 -->
            <el-form-item label="标准答案" required>
              <el-input
                v-model="debugForm.reference"
                type="textarea"
                :rows="3"
                placeholder="请输入标准答案"
              />
            </el-form-item>

            <!-- 指标开关 -->
            <el-form-item label="评估指标">
              <div class="metrics-switches">
                <div
                  class="metric-switch"
                  :class="{ active: metricsConfig.faithfulness }"
                  @click="metricsConfig.faithfulness = !metricsConfig.faithfulness"
                >
                  <el-icon><Check v-if="metricsConfig.faithfulness" /></el-icon>
                  <span>忠实度</span>
                </div>
                <div
                  class="metric-switch"
                  :class="{ active: metricsConfig.context_precision }"
                  @click="metricsConfig.context_precision = !metricsConfig.context_precision"
                >
                  <el-icon><Check v-if="metricsConfig.context_precision" /></el-icon>
                  <span>上下文精确</span>
                </div>
                <div
                  class="metric-switch"
                  :class="{ active: metricsConfig.context_recall }"
                  @click="metricsConfig.context_recall = !metricsConfig.context_recall"
                >
                  <el-icon><Check v-if="metricsConfig.context_recall" /></el-icon>
                  <span>上下文召回</span>
                </div>
                <div
                  class="metric-switch"
                  :class="{ active: metricsConfig.noise_sensitivity }"
                  @click="metricsConfig.noise_sensitivity = !metricsConfig.noise_sensitivity"
                >
                  <el-icon><Check v-if="metricsConfig.noise_sensitivity" /></el-icon>
                  <span>噪声敏感度</span>
                </div>
                <div
                  class="metric-switch"
                  :class="{ active: metricsConfig.answer_relevancy }"
                  @click="metricsConfig.answer_relevancy = !metricsConfig.answer_relevancy"
                >
                  <el-icon><Check v-if="metricsConfig.answer_relevancy" /></el-icon>
                  <span>回答相关性</span>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 自动评估标签页 -->
      <el-tab-pane label="自动评估" name="auto">
        <div class="auto-evaluation-container">
          <!-- 问题库管理 -->
          <el-card class="questions-card">
            <template #header>
              <div class="card-header">
                <span>问题库管理</span>
                <el-button type="primary" @click="dialogVisible = true">
                  <el-icon><Plus /></el-icon>
                  新增问题
                </el-button>
              </div>
            </template>

            <el-table :data="questionStore.questions" style="width: 100%">
              <el-table-column prop="query" label="问题" min-width="300">
                <template #default="scope">
                  <div class="question-text">{{ scope.row.query }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="reference" label="标准回答" min-width="200">
                <template #default="scope">
                  <div class="reference-text">{{ scope.row.reference }}</div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button size="small" @click="editQuestion(scope.row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button size="small" type="danger" @click="deleteQuestion(scope.row.id)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 自动评估配置 -->
          <el-card class="auto-config-card">
            <template #header>
              <div class="card-header">
                <span>自动评估配置</span>
                <el-button type="primary" @click="handleAutoEvaluate" :loading="autoLoading">
                  <el-icon><DataAnalysis /></el-icon>
                  执行自动评估
                </el-button>
              </div>
            </template>

            <el-form :model="autoForm" label-width="120px" class="auto-form">
              <!-- 选择问题 -->
              <el-form-item label="选择问题" required>
                <el-select
                  v-model="autoForm.questionId"
                  placeholder="请选择问题"
                  style="width: 100%"
                >
                  <el-option
                    v-for="question in questionStore.questions"
                    :key="question.id"
                    :label="question.query"
                    :value="question.id"
                  />
                </el-select>
              </el-form-item>

              <!-- 自定义标准回答 -->
              <el-form-item label="标准回答">
                <el-input
                  v-model="autoForm.reference"
                  type="textarea"
                  :rows="3"
                  placeholder="可自定义标准回答，留空使用问题库中的标准回答"
                />
              </el-form-item>

              <!-- 指标开关 -->
              <el-form-item label="评估指标">
                <div class="metrics-switches">
                  <div
                    class="metric-switch"
                    :class="{ active: metricsConfig.faithfulness }"
                    @click="metricsConfig.faithfulness = !metricsConfig.faithfulness"
                  >
                    <el-icon><Check v-if="metricsConfig.faithfulness" /></el-icon>
                    <span>忠实度</span>
                  </div>
                  <div
                    class="metric-switch"
                    :class="{ active: metricsConfig.context_precision }"
                    @click="metricsConfig.context_precision = !metricsConfig.context_precision"
                  >
                    <el-icon><Check v-if="metricsConfig.context_precision" /></el-icon>
                    <span>上下文精确</span>
                  </div>
                  <div
                    class="metric-switch"
                    :class="{ active: metricsConfig.context_recall }"
                    @click="metricsConfig.context_recall = !metricsConfig.context_recall"
                  >
                    <el-icon><Check v-if="metricsConfig.context_recall" /></el-icon>
                    <span>上下文召回</span>
                  </div>
                  <div
                    class="metric-switch"
                    :class="{ active: metricsConfig.noise_sensitivity }"
                    @click="metricsConfig.noise_sensitivity = !metricsConfig.noise_sensitivity"
                  >
                    <el-icon><Check v-if="metricsConfig.noise_sensitivity" /></el-icon>
                    <span>噪声敏感度</span>
                  </div>
                  <div
                    class="metric-switch"
                    :class="{ active: metricsConfig.answer_relevancy }"
                    @click="metricsConfig.answer_relevancy = !metricsConfig.answer_relevancy"
                  >
                    <el-icon><Check v-if="metricsConfig.answer_relevancy" /></el-icon>
                    <span>回答相关性</span>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 评估结果 -->
    <el-card v-if="scores" class="result-card">
      <template #header>
        <span>评估结果</span>
      </template>

      <div class="result-metrics">
        <div class="result-item" v-if="metricsConfig.faithfulness">
          <div class="result-label">忠实度 (Faithfulness)</div>
          <el-progress
            :percentage="(scores.faithfulness ?? 0) * 100"
            :color="getProgressColor(scores.faithfulness ?? 0)"
          />
          <div class="result-value">{{ ((scores.faithfulness ?? 0) * 100).toFixed(2) }}%</div>
          <div class="result-desc">衡量模型回答与检索上下文的一致性，值越高说明回答越基于事实</div>
        </div>

        <div class="result-item" v-if="metricsConfig.context_recall">
          <div class="result-label">上下文召回 (Context Recall)</div>
          <el-progress
            :percentage="(scores.context_recall ?? 0) * 100"
            :color="getProgressColor(scores.context_recall ?? 0)"
          />
          <div class="result-value">{{ ((scores.context_recall ?? 0) * 100).toFixed(2) }}%</div>
          <div class="result-desc">衡量检索到的上下文包含标准答案的程度，值越高说明召回越完整</div>
        </div>

        <div class="result-item" v-if="metricsConfig.context_precision">
          <div class="result-label">上下文精确 (Context Precision)</div>
          <el-progress
            :percentage="(scores.context_precision ?? 0) * 100"
            :color="getProgressColor(scores.context_precision ?? 0)"
          />
          <div class="result-value">{{ ((scores.context_precision ?? 0) * 100).toFixed(2) }}%</div>
          <div class="result-desc">衡量检索到的上下文与问题的相关性，值越高说明检索越精准</div>
        </div>

        <div class="result-item" v-if="metricsConfig.noise_sensitivity">
          <div class="result-label">噪声敏感度 (Noise Sensitivity)</div>
          <el-progress
            :percentage="(scores['noise_sensitivity(mode=relevant)'] ?? 0) * 100"
            :color="getProgressColor(scores['noise_sensitivity(mode=relevant)'] ?? 0)"
          />
          <div class="result-value">
            {{ ((scores['noise_sensitivity(mode=relevant)'] ?? 0) * 100).toFixed(2) }}%
          </div>
          <div class="result-desc">衡量模型对无关信息的抗干扰能力，值越低说明抗干扰越强</div>
        </div>

        <div class="result-item" v-if="metricsConfig.answer_relevancy">
          <div class="result-label">回答相关性 (Answer Relevancy)</div>
          <el-progress
            :percentage="(scores.answer_relevancy ?? 0) * 100"
            :color="getProgressColor(scores.answer_relevancy ?? 0)"
          />
          <div class="result-value">{{ ((scores.answer_relevancy ?? 0) * 100).toFixed(2) }}%</div>
          <div class="result-desc">衡量模型回答与用户问题的相关程度，值越高说明回答越切题</div>
        </div>
      </div>

      <!-- 评分解释 -->
      <el-divider />

      <div class="explanation-section">
        <h4>💡 评分说明</h4>
        <el-alert title="提示" type="info" :closable="false" show-icon>
          <template #default>
            <ul class="tips-list">
              <li><strong>优秀</strong>: 85% 以上</li>
              <li><strong>良好</strong>: 70% - 85%</li>
              <li><strong>一般</strong>: 50% - 70%</li>
              <li><strong>较差</strong>: 50% 以下</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </el-card>

    <!-- 新增/编辑问题对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="dialogForm" label-width="80px">
        <el-form-item label="问题" required>
          <el-input v-model="dialogForm.query" type="textarea" :rows="3" placeholder="请输入问题" />
        </el-form-item>
        <el-form-item label="标准回答" required>
          <el-input
            v-model="dialogForm.reference"
            type="textarea"
            :rows="2"
            placeholder="请输入标准回答"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveQuestion">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { evaluationApi } from '@/api/evaluation'
import { qaApi } from '@/api/qa'
import { useTaskStore } from '@/stores/task'
import { useQuestionStore } from '@/stores/question'
import type { EvaluationResult, ScoreItem, QAQuestion } from '@/types'

const route = useRoute()
const taskStore = useTaskStore()
const questionStore = useQuestionStore()

// 当前激活的标签页
const activeTab = ref('manual')

// 调试表单
const debugForm = ref({
  question: '',
  contexts: [''],
  response: '',
  reference: ''
})

// 自动评估表单
const autoForm = ref({
  questionId: '',
  reference: ''
})

// 指标开关配置
const metricsConfig = ref({
  faithfulness: true,
  context_precision: true,
  context_recall: true,
  noise_sensitivity: true,
  answer_relevancy: true
})

// 加载状态
const loading = ref(false)
const autoLoading = ref(false)

// 评估结果
const result = ref<EvaluationResult | null>(null)

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增问题')
const dialogForm = ref({
  id: '',
  query: '',
  reference: ''
})

// 计算属性：获取第一条评分
const scores = computed<ScoreItem | null>(() => {
  return result.value?.scores?.[0] || null
})

/**
 * 添加上下文
 */
const addContext = () => {
  debugForm.value.contexts.push('')
}

/**
 * 移除上下文
 */
const removeContext = (index: number) => {
  debugForm.value.contexts.splice(index, 1)
}

/**
 * 执行评估（手动）
 */
const handleEvaluate = async () => {
  // 表单验证
  if (!debugForm.value.question) {
    ElMessage.warning('请输入用户问题')
    return
  }
  if (!debugForm.value.contexts.some((c: string) => c.trim())) {
    ElMessage.warning('请至少输入一个上下文')
    return
  }
  if (!debugForm.value.response) {
    ElMessage.warning('请输入模型回答')
    return
  }
  if (!debugForm.value.reference) {
    ElMessage.warning('请输入标准答案')
    return
  }

  loading.value = true
  try {
    // 调用评估 API
    const response = await evaluationApi.evaluate({
      user_input: [debugForm.value.question],
      response: [debugForm.value.response],
      retrieved_contexts: [debugForm.value.contexts.filter((c: string) => c.trim())],
      reference: [debugForm.value.reference],
      metrics_config: metricsConfig.value
    })

    result.value = response as unknown as EvaluationResult

    // 评估成功后保存任务
    const scoreData = (response as unknown as EvaluationResult).scores?.[0]
    if (scoreData) {
      const inputData = {
        user_input: debugForm.value.question,
        response: debugForm.value.response,
        retrieved_contexts: debugForm.value.contexts.filter((c: string) => c.trim()),
        reference: debugForm.value.reference
      }
      await taskStore.createTask({
        name: `评估任务 - ${new Date().toLocaleString()}`,
        description: debugForm.value.question.slice(0, 50),
        dataset: '单条评估',
        status: 'completed',
        metrics: {
          faithfulness: scoreData.faithfulness,
          context_precision: scoreData.context_precision,
          context_recall: scoreData.context_recall,
          noise_sensitivity: scoreData['noise_sensitivity(mode=relevant)'],
          answer_relevancy: scoreData.answer_relevancy
        },
        input: inputData
      })
    }

    ElMessage.success('评估完成，已保存到任务列表')
  } catch (error) {
    ElMessage.error('评估失败，请检查输入')
  } finally {
    loading.value = false
  }
}

/**
 * 执行自动评估
 */
const handleAutoEvaluate = async () => {
  // 表单验证
  if (!autoForm.value.questionId) {
    ElMessage.warning('请选择问题')
    return
  }

  autoLoading.value = true
  try {
    // 获取选中的问题
    const question = questionStore.questions.find(q => q.id === autoForm.value.questionId)
    if (!question) {
      ElMessage.error('问题不存在')
      return
    }

    ElMessage.info(`开始评估问题：${question.query}`)

    // 调用问答接口获取回答和检索文档
    ElMessage.info('正在调用问答接口...')
    const qaResponse = (await qaApi.getAnswer(question.query)) as any

    // 验证问答接口返回数据
    if (!qaResponse) {
      throw new Error('问答接口无返回数据')
    }

    const chatResult = qaResponse.chatResult
    const retrievedDocuments = qaResponse.retrievedDocuments

    if (!chatResult) {
      throw new Error('问答接口未返回回答内容')
    }

    if (!retrievedDocuments || !Array.isArray(retrievedDocuments)) {
      throw new Error('问答接口未返回有效的检索文档')
    }

    ElMessage.success('问答接口调用成功')
    console.log('问答接口返回：', { chatResult, retrievedDocuments })

    // 确定标准回答
    const reference = autoForm.value.reference || question.reference
    if (!reference) {
      throw new Error('标准回答不能为空')
    }

    // 组装评估数据
    ElMessage.info('正在组装评估数据...')
    const evaluationData = {
      user_input: [question.query],
      response: [chatResult],
      retrieved_contexts: [retrievedDocuments],
      reference: [reference],
      metrics_config: metricsConfig.value
    }

    console.log('评估数据：', evaluationData)

    // 调用评估 API
    ElMessage.info('正在调用评估接口...')
    const evalResponse = await evaluationApi.evaluate(evaluationData)

    if (!evalResponse) {
      throw new Error('评估接口无返回数据')
    }

    result.value = evalResponse as unknown as EvaluationResult
    ElMessage.success('评估接口调用成功')

    // 评估成功后保存任务
    const scoreData = (evalResponse as unknown as EvaluationResult).scores?.[0]
    if (scoreData) {
      const inputData = {
        user_input: question.query,
        response: chatResult,
        retrieved_contexts: retrievedDocuments,
        reference: reference
      }
      await taskStore.createTask({
        name: `自动评估任务 - ${new Date().toLocaleString()}`,
        description: question.query.slice(0, 50),
        dataset: '自动评估',
        status: 'completed',
        metrics: {
          faithfulness: scoreData.faithfulness,
          context_precision: scoreData.context_precision,
          context_recall: scoreData.context_recall,
          noise_sensitivity: scoreData['noise_sensitivity(mode=relevant)'],
          answer_relevancy: scoreData.answer_relevancy
        },
        input: inputData
      })
      ElMessage.success('任务保存成功')
    }

    ElMessage.success('自动评估完成，已保存到任务列表')
  } catch (error: any) {
    console.error('自动评估失败：', error)
    ElMessage.error(`自动评估失败：${error.message || '未知错误'}`)
  } finally {
    autoLoading.value = false
  }
}

/**
 * 编辑问题
 */
const editQuestion = (question: QAQuestion) => {
  dialogTitle.value = '编辑问题'
  dialogForm.value = {
    id: question.id,
    query: question.query,
    reference: question.reference
  }
  dialogVisible.value = true
}

/**
 * 删除问题
 */
const deleteQuestion = async (id: string) => {
  try {
    await questionStore.deleteQuestion(id)
    ElMessage.success('问题删除成功')
  } catch (error) {
    ElMessage.error('问题删除失败')
  }
}

/**
 * 保存问题
 */
const saveQuestion = async () => {
  // 表单验证
  if (!dialogForm.value.query) {
    ElMessage.warning('请输入问题')
    return
  }
  if (!dialogForm.value.reference) {
    ElMessage.warning('请输入标准回答')
    return
  }

  try {
    if (dialogForm.value.id) {
      // 编辑现有问题
      await questionStore.updateQuestion(dialogForm.value.id, {
        query: dialogForm.value.query,
        reference: dialogForm.value.reference
      })
      ElMessage.success('问题更新成功')
    } else {
      // 新增问题
      await questionStore.createQuestion({
        query: dialogForm.value.query,
        reference: dialogForm.value.reference
      })
      ElMessage.success('问题新增成功')
    }
    dialogVisible.value = false
    // 重置表单
    dialogForm.value = {
      id: '',
      query: '',
      reference: ''
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

/**
 * 获取进度条颜色
 */
const getProgressColor = (value: number) => {
  if (value >= 0.85) return '#67c23a'
  if (value >= 0.7) return '#409eff'
  if (value >= 0.5) return '#e6a23c'
  return '#f56c6c'
}

// 组件挂载时检查是否有传入的样本数据
onMounted(async () => {
  // 加载问题列表
  await questionStore.fetchQuestions()

  // 检查是否有传入的样本数据
  const sampleStr = route.query.sample as string
  if (sampleStr) {
    try {
      const sample = JSON.parse(sampleStr)
      debugForm.value = {
        question: sample.user_input || '',
        contexts: sample.retrieved_contexts || [''],
        response: sample.response || '',
        reference: sample.reference || ''
      }
    } catch (error) {
      // 解析失败，忽略
    }
  }
})
</script>

<style scoped>
.debug-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 标签页 */
.evaluation-tabs {
  margin-bottom: 16px;
}

.debug-card,
.result-card,
.questions-card,
.auto-config-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
}

.debug-form,
.auto-form {
  margin-top: 20px;
}

.contexts-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.context-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.context-item .el-input {
  flex: 1;
}

/* 自动评估容器 */
.auto-evaluation-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.questions-card {
  margin-bottom: 16px;
}

.questions-card :deep(.el-table) {
  margin-top: 16px;
}

.question-text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.reference-text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.metrics-switches {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.metric-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #6b7280;
  background: #ffffff;
  user-select: none;
}

.metric-switch:hover {
  border-color: #93c5fd;
  color: #3b82f6;
}

.metric-switch.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
}

.metric-switch .el-icon {
  font-size: 14px;
}

/* 评估结果 */
.result-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.result-item {
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.result-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.result-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e40af;
  margin-top: 8px;
}

.result-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
  line-height: 1.5;
}

.explanation-section {
  margin-top: 20px;
}

.explanation-section h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #1f2937;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}

.tips-list li {
  padding: 4px 0;
  font-size: 14px;
}

/* 对话框 */
.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
