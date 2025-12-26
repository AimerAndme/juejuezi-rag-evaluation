<template>
  <div class="compare-container">
    <!-- 版本选择 -->
    <el-card class="selector-card">
      <el-form :inline="true">
        <el-form-item label="版本 1">
          <el-select v-model="version1" placeholder="选择版本" style="width: 250px">
            <el-option
              v-for="task in taskStore.tasks"
              :key="task.id"
              :label="task.name"
              :value="task.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="版本 2">
          <el-select v-model="version2" placeholder="选择版本" style="width: 250px">
            <el-option
              v-for="task in taskStore.tasks"
              :key="task.id"
              :label="task.name"
              :value="task.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleCompare" :disabled="!version1 || !version2">
            开始对比
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 对比结果 -->
    <el-card v-if="showResult" class="result-card">
      <template #header>
        <span>对比结果</span>
      </template>

      <!-- 指标对比表格 -->
      <el-table :data="comparisonData" border style="width: 100%">
        <el-table-column prop="metric" label="指标" width="200" />
        <el-table-column :label="task1?.name || '版本 1'" align="center">
          <template #default="{ row }">
            <span :class="{ 'better-value': row.v1Better }">
              {{ row.value1 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="task2?.name || '版本 2'" align="center">
          <template #default="{ row }">
            <span :class="{ 'better-value': row.v2Better }">
              {{ row.value2 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="差异" align="center">
          <template #default="{ row }">
            <el-tag :type="row.diff > 0 ? 'success' : row.diff < 0 ? 'danger' : 'info'">
              {{ row.diff > 0 ? '+' : '' }}{{ row.diff }}%
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 对比图表 -->
      <div class="chart-section">
        <div ref="compareChartRef" class="compare-chart"></div>
      </div>

      <!-- 结论 -->
      <el-divider />
      <div class="conclusion-section">
        <h4>📊 对比结论</h4>
        <el-alert
          :title="conclusionTitle"
          :type="conclusionType"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>{{ conclusionText }}</p>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTaskStore } from '@/stores/task'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { EvaluationTask } from '@/types'

const taskStore = useTaskStore()

// 选中的版本
const version1 = ref('')
const version2 = ref('')

// 是否显示结果
const showResult = ref(false)

// 对比的任务
const task1 = ref<EvaluationTask | null>(null)
const task2 = ref<EvaluationTask | null>(null)

// ECharts 实例
const compareChartRef = ref<HTMLElement>()
let compareChart: ECharts | null = null

/**
 * 对比数据
 */
const comparisonData = computed(() => {
  if (!task1.value?.metrics || !task2.value?.metrics) return []

  const m1 = task1.value.metrics
  const m2 = task2.value.metrics

  return [
    {
      metric: '忠实度 (Faithfulness)',
      value1: `${(m1.faithfulness * 100).toFixed(1)}%`,
      value2: `${(m2.faithfulness * 100).toFixed(1)}%`,
      diff: parseFloat(((m2.faithfulness - m1.faithfulness) * 100).toFixed(1)),
      v1Better: m1.faithfulness > m2.faithfulness,
      v2Better: m2.faithfulness > m1.faithfulness
    },
    {
      metric: '上下文召回 (Context Recall)',
      value1: `${(m1.context_recall * 100).toFixed(1)}%`,
      value2: `${(m2.context_recall * 100).toFixed(1)}%`,
      diff: parseFloat(((m2.context_recall - m1.context_recall) * 100).toFixed(1)),
      v1Better: m1.context_recall > m2.context_recall,
      v2Better: m2.context_recall > m1.context_recall
    },
    {
      metric: '上下文精确 (Context Precision)',
      value1: `${(m1.context_precision * 100).toFixed(1)}%`,
      value2: `${(m2.context_precision * 100).toFixed(1)}%`,
      diff: parseFloat(((m2.context_precision - m1.context_precision) * 100).toFixed(1)),
      v1Better: m1.context_precision > m2.context_precision,
      v2Better: m2.context_precision > m1.context_precision
    },
    {
      metric: '回答相关性 (Answer Relevancy)',
      value1: `${((m1.answer_relevancy || 0) * 100).toFixed(1)}%`,
      value2: `${((m2.answer_relevancy || 0) * 100).toFixed(1)}%`,
      diff: parseFloat((((m2.answer_relevancy || 0) - (m1.answer_relevancy || 0)) * 100).toFixed(1)),
      v1Better: (m1.answer_relevancy || 0) > (m2.answer_relevancy || 0),
      v2Better: (m2.answer_relevancy || 0) > (m1.answer_relevancy || 0)
    }
  ]
})

/**
 * 结论标题
 */
const conclusionTitle = computed(() => {
  const avgDiff = comparisonData.value.reduce((sum, item) => sum + item.diff, 0) / comparisonData.value.length
  if (avgDiff > 5) return `版本 2 (${task2.value?.name}) 表现更优`
  if (avgDiff < -5) return `版本 1 (${task1.value?.name}) 表现更优`
  return '两个版本表现相当'
})

/**
 * 结论类型
 */
const conclusionType = computed(() => {
  const avgDiff = comparisonData.value.reduce((sum, item) => sum + item.diff, 0) / comparisonData.value.length
  if (Math.abs(avgDiff) > 5) return 'success'
  return 'info'
})

/**
 * 结论文本
 */
const conclusionText = computed(() => {
  const winCount2 = comparisonData.value.filter(item => item.v2Better).length
  const winCount1 = comparisonData.value.filter(item => item.v1Better).length
  
  return `在 ${comparisonData.value.length} 个评估指标中，版本 1 在 ${winCount1} 个指标上更优，版本 2 在 ${winCount2} 个指标上更优。`
})

/**
 * 开始对比
 */
const handleCompare = async () => {
  task1.value = taskStore.tasks.find(t => t.id === version1.value) || null
  task2.value = taskStore.tasks.find(t => t.id === version2.value) || null
  
  showResult.value = true
  
  nextTick(() => {
    initCompareChart()
  })
}

/**
 * 初始化对比图表
 */
const initCompareChart = () => {
  if (!compareChartRef.value || !task1.value?.metrics || !task2.value?.metrics) return

  compareChart = echarts.init(compareChartRef.value)
  
  const m1 = task1.value.metrics
  const m2 = task2.value.metrics

  const option = {
    title: {
      text: '版本对比雷达图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: 'bottom',
      data: [task1.value.name, task2.value.name]
    },
    radar: {
      indicator: [
        { name: '忠实度', max: 1 },
        { name: '上下文召回', max: 1 },
        { name: '上下文精确', max: 1 },
        { name: '回答相关性', max: 1 }
      ],
      radius: '60%'
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              m1.faithfulness,
              m1.context_recall,
              m1.context_precision,
              m1.answer_relevancy || 0
            ],
            name: task1.value.name,
            areaStyle: {
              color: 'rgba(30, 64, 175, 0.3)'
            },
            lineStyle: {
              color: '#1E40AF'
            },
            itemStyle: {
              color: '#1E40AF'
            }
          },
          {
            value: [
              m2.faithfulness,
              m2.context_recall,
              m2.context_precision,
              m2.answer_relevancy || 0
            ],
            name: task2.value.name,
            areaStyle: {
              color: 'rgba(239, 68, 68, 0.3)'
            },
            lineStyle: {
              color: '#EF4444'
            },
            itemStyle: {
              color: '#EF4444'
            }
          }
        ]
      }
    ]
  }
  
  compareChart.setOption(option)
}

// 组件挂载时获取任务列表
onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<style scoped>
.compare-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selector-card,
.result-card {
  border-radius: 8px;
}

.better-value {
  font-weight: 700;
  color: #10b981;
}

.chart-section {
  margin-top: 24px;
}

.compare-chart {
  width: 100%;
  height: 500px;
}

.conclusion-section {
  margin-top: 20px;
}

.conclusion-section h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #1f2937;
}

.conclusion-section p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}
</style>
