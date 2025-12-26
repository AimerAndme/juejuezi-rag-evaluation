<template>
  <div class="task-list-container">
    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :inline="true">
        <el-form-item label="任务状态">
          <el-select v-model="filterStatus" placeholder="全部" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="运行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索任务名称"
            style="width: 250px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card class="list-card" v-loading="taskStore.loading">
      <el-table :data="filteredTasks" style="width: 100%" @row-click="handleRowClick">
        <el-table-column prop="name" label="任务名称" min-width="200">
          <template #default="{ row }">
            <div class="task-name">{{ row.name }}</div>
            <div class="task-desc">{{ row.description }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="dataset" label="数据集" width="180" />
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="评估指标" width="300">
          <template #default="{ row }">
            <div v-if="row.metrics" class="metrics-preview">
              <el-tag>忠实度: {{ (row.metrics.faithfulness * 100).toFixed(1) }}%</el-tag>
              <el-tag>召回: {{ (row.metrics.context_recall * 100).toFixed(1) }}%</el-tag>
              <el-tag>精确: {{ (row.metrics.context_precision * 100).toFixed(1) }}%</el-tag>
            </div>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="handleView(row)">
              查看
            </el-button>
            <el-button link type="danger" size="small" @click.stop="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import type { EvaluationTask } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const taskStore = useTaskStore()

// 筛选条件
const filterStatus = ref('')
const searchKeyword = ref('')

// 过滤后的任务列表
const filteredTasks = computed(() => {
  let result = taskStore.tasks

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(task => task.status === filterStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      task =>
        task.name.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword)
    )
  }

  return result
})

/**
 * 获取状态类型（用于 Tag 颜色）
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

/**
 * 点击行查看详情
 */
const handleRowClick = (row: EvaluationTask) => {
  router.push(`/tasks/${row.id}`)
}

/**
 * 查看任务
 */
const handleView = (row: EvaluationTask) => {
  router.push(`/tasks/${row.id}`)
}

/**
 * 删除任务
 */
const handleDelete = async (row: EvaluationTask) => {
  try {
    await ElMessageBox.confirm(`确定要删除任务 "${row.name}" 吗？`, '提示', {
      type: 'warning'
    })

    await taskStore.deleteTask(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

// 组件挂载时获取任务列表
onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<style scoped>
.task-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  border-radius: 8px;
}

.list-card {
  border-radius: 8px;
  flex: 1;
}

.task-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.task-desc {
  font-size: 12px;
  color: #6b7280;
}

.metrics-preview {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.metrics-preview .el-tag {
  font-size: 12px;
}

.text-secondary {
  color: #9ca3af;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f9fafb;
}
</style>
