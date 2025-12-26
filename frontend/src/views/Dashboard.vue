<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <el-icon :size="32"><List /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ taskStore.tasks.length }}</div>
          <div class="stat-label">总任务数</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <el-icon :size="32"><Loading /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ runningCount }}</div>
          <div class="stat-label">运行中</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
          <el-icon :size="32"><SuccessFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
          <el-icon :size="32"><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ avgScore }}</div>
          <div class="stat-label">平均得分</div>
        </div>
      </el-card>
    </div>

    <!-- 最近任务 -->
    <el-card class="recent-tasks-card">
      <template #header>
        <div class="card-header">
          <span>最近任务</span>
          <el-button text type="primary" @click="$router.push('/tasks')">
            查看全部 →
          </el-button>
        </div>
      </template>

      <el-table :data="recentTasks" style="width: 100%">
        <el-table-column prop="name" label="任务名称" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评估指标" width="300">
          <template #default="{ row }">
            <div v-if="row.metrics" class="metrics-preview">
              <el-tag size="small">F: {{ (row.metrics.faithfulness * 100).toFixed(0) }}%</el-tag>
              <el-tag size="small">R: {{ (row.metrics.context_recall * 100).toFixed(0) }}%</el-tag>
              <el-tag size="small">P: {{ (row.metrics.context_precision * 100).toFixed(0) }}%</el-tag>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 快捷入口 -->
    <el-card class="quick-actions-card">
      <template #header>
        <span>快捷操作</span>
      </template>

      <div class="quick-actions">
        <div class="action-item" @click="$router.push('/tasks')">
          <el-icon :size="40" color="#1E40AF"><List /></el-icon>
          <span>查看任务</span>
        </div>
        <div class="action-item" @click="$router.push('/debug')">
          <el-icon :size="40" color="#1E40AF"><Tools /></el-icon>
          <span>样本调试</span>
        </div>
        <div class="action-item" @click="$router.push('/compare')">
          <el-icon :size="40" color="#1E40AF"><TrendCharts /></el-icon>
          <span>版本对比</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import dayjs from 'dayjs'

const taskStore = useTaskStore()

// 运行中任务数
const runningCount = computed(() => {
  return taskStore.tasks.filter(t => t.status === 'running').length
})

// 已完成任务数
const completedCount = computed(() => {
  return taskStore.tasks.filter(t => t.status === 'completed').length
})

// 平均得分
const avgScore = computed(() => {
  const completedTasks = taskStore.tasks.filter(t => t.status === 'completed' && t.metrics)
  if (completedTasks.length === 0) return '-'
  
  const sum = completedTasks.reduce((acc, task) => {
    const metrics = task.metrics!
    return acc + (metrics.faithfulness + metrics.context_recall + metrics.context_precision) / 3
  }, 0)
  
  return `${((sum / completedTasks.length) * 100).toFixed(0)}%`
})

// 最近任务（取前 5 个）
const recentTasks = computed(() => {
  return taskStore.tasks.slice(0, 5)
})

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    running: '运行中',
    completed: '已完成',
    failed: '失败'
  }
  return textMap[status] || status
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 组件挂载时获取数据
onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 统计卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  border-radius: 8px;
  overflow: hidden;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* 最近任务 */
.recent-tasks-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metrics-preview {
  display: flex;
  gap: 8px;
}

/* 快捷操作 */
.quick-actions-card {
  border-radius: 8px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-item span {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
</style>
