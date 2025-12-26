<template>
  <div class="debug-container">
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
            <div
              v-for="(context, index) in debugForm.contexts"
              :key="index"
              class="context-item"
            >
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
      </el-form>
    </el-card>

    <!-- 评估结果 -->
    <el-card v-if="result" class="result-card">
      <template #header>
        <span>评估结果</span>
      </template>

      <div class="result-metrics">
        <div class="result-item">
          <div class="result-label">忠实度 (Faithfulness)</div>
          <el-progress
            :percentage="result.faithfulness * 100"
            :color="getProgressColor(result.faithfulness)"
          />
          <div class="result-value">{{ (result.faithfulness * 100).toFixed(2) }}%</div>
          <div class="result-desc">衡量模型回答与检索上下文的一致性，值越高说明回答越基于事实</div>
        </div>

        <div class="result-item">
          <div class="result-label">上下文召回 (Context Recall)</div>
          <el-progress
            :percentage="result.context_recall * 100"
            :color="getProgressColor(result.context_recall)"
          />
          <div class="result-value">{{ (result.context_recall * 100).toFixed(2) }}%</div>
          <div class="result-desc">衡量检索到的上下文包含标准答案的程度，值越高说明召回越完整</div>
        </div>

        <div class="result-item">
          <div class="result-label">上下文精确 (Context Precision)</div>
          <el-progress
            :percentage="result.context_precision * 100"
            :color="getProgressColor(result.context_precision)"
          />
          <div class="result-value">{{ (result.context_precision * 100).toFixed(2) }}%</div>
          <div class="result-desc">衡量检索到的上下文与问题的相关性，值越高说明检索越精准</div>
        </div>

        <div class="result-item" v-if="result.answer_relevancy !== undefined">
          <div class="result-label">回答相关性 (Answer Relevancy)</div>
          <el-progress
            :percentage="result.answer_relevancy * 100"
            :color="getProgressColor(result.answer_relevancy)"
          />
          <div class="result-value">{{ (result.answer_relevancy * 100).toFixed(2) }}%</div>
          <div class="result-desc">衡量模型回答与用户问题的相关性，值越高说明回答越切题</div>
        </div>
      </div>

      <!-- 评分解释 -->
      <el-divider />
      
      <div class="explanation-section">
        <h4>💡 评分说明</h4>
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { evaluationApi } from '@/api/evaluation'
import type { EvaluationResult } from '@/types'

const route = useRoute()

// 调试表单
const debugForm = ref({
  question: '',
  contexts: [''],
  response: '',
  reference: ''
})

// 加载状态
const loading = ref(false)

// 评估结果
const result = ref<EvaluationResult | null>(null)

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
 * 执行评估
 */
const handleEvaluate = async () => {
  // 表单验证
  if (!debugForm.value.question) {
    ElMessage.warning('请输入用户问题')
    return
  }
  if (!debugForm.value.contexts.some(c => c.trim())) {
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
      retrieved_contexts: [debugForm.value.contexts.filter(c => c.trim())],
      reference: [debugForm.value.reference]
    })

    result.value = response as any
    ElMessage.success('评估完成')
  } catch (error) {
    ElMessage.error('评估失败，请检查输入')
  } finally {
    loading.value = false
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
onMounted(() => {
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

.debug-card,
.result-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
}

.debug-form {
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
</style>
