<template>
  <div class="main-layout">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <div class="logo">
        <h2>RAG 评估平台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#1E40AF"
        text-color="#ffffff"
        active-text-color="#60A5FA"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>评估任务</span>
        </el-menu-item>
        <el-menu-item index="/debug">
          <el-icon><Tools /></el-icon>
          <span>样本调试</span>
        </el-menu-item>
        <el-menu-item index="/compare">
          <el-icon><TrendCharts /></el-icon>
          <span>版本对比</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 右侧内容区 -->
    <div class="main-content">
      <!-- 顶部操作栏 -->
      <header class="header">
        <div class="header-left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleCreateTask">
            <el-icon><Plus /></el-icon>
            新建任务
          </el-button>
        </div>
      </header>

      <!-- 内容区域 -->
      <main class="content">
        <router-view />
      </main>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建评估任务" width="600px">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务名称" required>
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="数据集">
          <el-upload
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".json,.csv"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 JSON / CSV 格式</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitTask">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTaskStore } from '@/stores/task'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 页面标题
const pageTitle = computed(() => {
  return route.meta.title || 'RAG 评估平台'
})

// 创建任务对话框
const createDialogVisible = ref(false)
const taskForm = ref({
  name: '',
  description: '',
  dataset: ''
})
const uploadFile = ref<File | null>(null)

/**
 * 打开创建任务对话框
 */
const handleCreateTask = () => {
  createDialogVisible.value = true
  taskForm.value = {
    name: '',
    description: '',
    dataset: ''
  }
  uploadFile.value = null
}

/**
 * 处理文件选择
 */
const handleFileChange = (file: any) => {
  uploadFile.value = file.raw
  taskForm.value.dataset = file.name
}

/**
 * 提交创建任务
 */
const handleSubmitTask = async () => {
  if (!taskForm.value.name) {
    ElMessage.warning('请输入任务名称')
    return
  }

  try {
    const newTask = await taskStore.createTask({
      name: taskForm.value.name,
      description: taskForm.value.description,
      dataset: taskForm.value.dataset,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    ElMessage.success('任务创建成功')
    createDialogVisible.value = false
    
    // 跳转到任务详情页
    router.push(`/tasks/${newTask.id}`)
  } catch (error) {
    ElMessage.error('任务创建失败')
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

/* 左侧导航栏 */
.sidebar {
  width: 240px;
  background-color: #1e40af;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu .el-menu-item {
  height: 56px;
  line-height: 56px;
}

/* 右侧内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部操作栏 */
.header {
  height: 64px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.header-left .page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

/* 内容区域 */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 上传组件样式 */
.upload-demo {
  width: 100%;
}
</style>
