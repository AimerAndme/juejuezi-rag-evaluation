<template>
  <div class="task-detail-container" v-loading="taskStore.loading">
    <!-- 任务信息卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>{{ taskStore.currentTask?.name }}</span>
          <el-tag :type="getStatusType(taskStore.currentTask?.status)">
            {{ getStatusText(taskStore.currentTask?.status) }}
          </el-tag>
        </div>
      </template>
      <div class="task-info">
        <div class="info-item">
          <span class="label">描述：</span>
          <span>{{ taskStore.currentTask?.description || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">数据集：</span>
          <span>{{ taskStore.currentTask?.dataset || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">创建时间：</span>
          <span>{{ formatDate(taskStore.currentTask?.createdAt) }}</span>
        </div>
      </div>
    </el-card>

    <!-- Tab 切换 -->
    <el-card class="tab-card">
      <!-- 数据来源提示 -->
      <el-alert
        title="数据存储说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        当前任务数据存储在浏览器 localStorage 中，清除浏览器数据后将重置。
      </el-alert>

      <el-tabs v-model="activeTab">
        <!-- 指标总览 -->
        <el-tab-pane label="指标总览" name="metrics">
          <div class="metrics-overview">
            <!-- 指标卡片 -->
            <div class="metric-cards">
              <div class="metric-card">
                <div class="metric-value">
                  {{ ((taskStore.currentTask?.metrics?.faithfulness ?? 0) * 100).toFixed(1) }}%
                </div>
                <div class="metric-label">忠实度 (Faithfulness)</div>
                <div class="metric-desc">模型回答与检索上下文的一致性</div>
              </div>

              <div class="metric-card">
                <div class="metric-value">
                  {{ ((taskStore.currentTask?.metrics?.context_recall ?? 0) * 100).toFixed(1) }}%
                </div>
                <div class="metric-label">上下文召回 (Context Recall)</div>
                <div class="metric-desc">检索到的上下文包含答案的程度</div>
              </div>

              <div class="metric-card">
                <div class="metric-value">
                  {{ ((taskStore.currentTask?.metrics?.context_precision ?? 0) * 100).toFixed(1) }}%
                </div>
                <div class="metric-label">上下文精确 (Context Precision)</div>
                <div class="metric-desc">检索到的上下文与问题的相关性</div>
              </div>

              <div class="metric-card">
                <div class="metric-value">
                  {{ ((taskStore.currentTask?.metrics?.noise_sensitivity ?? 0) * 100).toFixed(1) }}%
                </div>
                <div class="metric-label">噪声敏感度 (Noise Sensitivity)</div>
                <div class="metric-desc">模型对无关信息的抗干扰能力</div>
              </div>

              <div class="metric-card">
                <div class="metric-value">
                  {{ ((taskStore.currentTask?.metrics?.answer_relevancy ?? 0) * 100).toFixed(1) }}%
                </div>
                <div class="metric-label">回答相关性 (Answer Relevancy)</div>
                <div class="metric-desc">模型回答与用户问题的相关程度</div>
              </div>
            </div>

            <!-- 雷达图 -->
            <div class="chart-container">
              <div ref="radarChartRef" class="chart"></div>
            </div>

            <!-- 柱状图 -->
            <div class="chart-container">
              <div ref="barChartRef" class="chart"></div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 样本列表 -->
        <el-tab-pane label="样本列表" name="samples">
          <el-table :data="taskStore.currentSamples" style="width: 100%">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column
              prop="user_input"
              label="用户问题"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="response"
              label="模型回答"
              min-width="200"
              show-overflow-tooltip
            />

            <el-table-column label="指标" width="300">
              <template #default="{ row }">
                <div v-if="row.metrics" class="sample-metrics">
                  <el-progress
                    :percentage="row.metrics.faithfulness * 100"
                    :stroke-width="6"
                    :show-text="false"
                  />
                  <span class="metric-text">
                    F:{{ (row.metrics.faithfulness * 100).toFixed(0) }}%
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewSampleDetail(row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 版本对比 -->
        <el-tab-pane label="版本对比" name="compare">
          <div class="compare-placeholder">
            <el-empty description="请选择对比版本">
              <el-button type="primary" @click="$router.push('/compare')"> 前往对比页面 </el-button>
            </el-empty>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

// 当前 Tab
const activeTab = ref('metrics')

// ECharts 实例
const radarChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
let radarChart: ECharts | null = null
let barChart: ECharts | null = null

/**
 * 获取状态类型
 */
const getStatusType = (status: string | undefined) => {
  const typeMap: Record<string, any> = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return typeMap[status || ''] || 'info'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string | undefined) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    running: '运行中',
    completed: '已完成',
    failed: '失败'
  }
  return textMap[status || ''] || '-'
}

/**
 * 格式化日期
 */
const formatDate = (date: string | undefined) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

/**
 * 初始化雷达图
 */
const initRadarChart = () => {
  if (!radarChartRef.value) return

  radarChart = echarts.init(radarChartRef.value)

  const metrics = taskStore.currentTask?.metrics

  const option = {
    title: {
      text: '评估指标雷达图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600
      }
    },
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: [
        { name: '忠实度', max: 1 },
        { name: '上下文召回', max: 1 },
        { name: '上下文精确', max: 1 },
        { name: '噪声敏感度', max: 1 },
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
              metrics?.faithfulness || 0,
              metrics?.context_recall || 0,
              metrics?.context_precision || 0,
              metrics?.noise_sensitivity || 0,
              metrics?.answer_relevancy || 0
            ],
            name: '评估指标',
            areaStyle: {
              color: 'rgba(30, 64, 175, 0.3)'
            },
            lineStyle: {
              color: '#1E40AF'
            },
            itemStyle: {
              color: '#1E40AF'
            }
          }
        ]
      }
    ]
  }

  radarChart.setOption(option)
}

/**
 * 初始化柱状图
 */
const initBarChart = () => {
  if (!barChartRef.value) return

  barChart = echarts.init(barChartRef.value)

  const metrics = taskStore.currentTask?.metrics

  const option = {
    title: {
      text: '评估指标对比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const value = (params[0].value * 100).toFixed(1)
        return `${params[0].name}: ${value}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['忠实度', '上下文召回', '上下文精确', '噪声敏感度', '回答相关性'],
      axisLabel: {
        interval: 0,
        rotate: 15
      }
    },
    yAxis: {
      type: 'value',
      max: 1,
      axisLabel: {
        formatter: (value: number) => `${(value * 100).toFixed(0)}%`
      }
    },
    series: [
      {
        type: 'bar',
        data: [
          metrics?.faithfulness || 0,
          metrics?.context_recall || 0,
          metrics?.context_precision || 0,
          metrics?.noise_sensitivity || 0,
          metrics?.answer_relevancy || 0
        ],
        itemStyle: {
          color: '#1E40AF',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%'
      }
    ]
  }

  barChart.setOption(option)
}

/**
 * 查看样本详情
 */
const viewSampleDetail = (row: any) => {
  // 跳转到调试页面，携带样本数据
  router.push({
    path: '/evaluation',
    query: {
      sample: JSON.stringify(row)
    }
  })
}

/**
 * 监听任务变化，重新绘制图表
 */
watch(
  () => taskStore.currentTask?.metrics,
  () => {
    nextTick(() => {
      if (activeTab.value === 'metrics') {
        initRadarChart()
        initBarChart()
      }
    })
  }
)

/**
 * 监听 Tab 切换
 */
watch(activeTab, newTab => {
  if (newTab === 'metrics') {
    nextTick(() => {
      initRadarChart()
      initBarChart()
    })
  } else if (newTab === 'samples') {
    const taskId = route.params.id as string
    taskStore.fetchTaskSamples(taskId)
  }
})

// 组件挂载时获取任务详情
onMounted(async () => {
  const taskId = route.params.id as string
  await taskStore.fetchTaskDetail(taskId)

  // 默认加载指标图表
  nextTick(() => {
    initRadarChart()
    initBarChart()
  })
})

// 组件卸载时销毁图表
onBeforeUnmount(() => {
  radarChart?.dispose()
  barChart?.dispose()
})
</script>

<script lang="ts">
import { onBeforeUnmount } from 'vue'
export default {
  name: 'TaskDetail'
}
</script>

<style scoped>
.task-detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 600;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-item .label {
  font-weight: 600;
  color: #6b7280;
  width: 100px;
}

.tab-card {
  border-radius: 8px;
  flex: 1;
}

/* 指标总览 */
.metrics-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.metric-card {
  padding: 24px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 8px;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.metric-desc {
  font-size: 12px;
  opacity: 0.9;
}

.chart-container {
  width: 100%;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart {
  width: 100%;
  height: 400px;
}

/* 样本列表 */
.sample-metrics {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-text {
  font-size: 12px;
  color: #6b7280;
  min-width: 50px;
}

.compare-placeholder {
  padding: 60px 0;
}
</style>
