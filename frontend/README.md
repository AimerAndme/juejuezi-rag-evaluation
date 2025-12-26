# RAG 评估平台 - 前端

一个现代化的 RAG（检索增强生成）评估系统前端平台，提供多维度指标可视化、测试用例管理、结果对比与调试功能。

## 🎯 核心功能

- ✅ **评估任务管理**：创建、编辑、删除评估任务
- ✅ **多维指标仪表盘**：Faithfulness、Context Recall、Context Precision、Answer Relevancy
- ✅ **样本调试**：单条样本实时评估与分析
- ✅ **版本对比**：不同 RAG 版本横向对比
- ✅ **数据可视化**：ECharts 雷达图、柱状图等

## 🛠️ 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **图表库**: ECharts
- **构建工具**: Vite
- **语言**: TypeScript

## 📦 安装

### 前置要求

- Node.js >= 16.0.0
- npm 或 pnpm

### 步骤

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🚀 快速开始

### 1. 启动后端服务

确保后端 API 服务已启动（默认端口 8000）：

```bash
# 在项目根目录
cd evaluation
python main.py
```

### 2. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
frontend/
├── public/               # 静态资源
├── src/
│   ├── api/             # API 接口封装
│   │   └── evaluation.ts
│   ├── assets/          # 资源文件
│   ├── components/      # 公共组件
│   ├── layouts/         # 布局组件
│   │   └── MainLayout.vue
│   ├── router/          # 路由配置
│   │   └── index.ts
│   ├── stores/          # Pinia 状态管理
│   │   ├── index.ts
│   │   └── task.ts
│   ├── types/           # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/           # 工具函数
│   │   └── request.ts
│   ├── views/           # 页面组件
│   │   ├── Dashboard.vue      # 仪表盘
│   │   ├── TaskList.vue       # 任务列表
│   │   ├── TaskDetail.vue     # 任务详情
│   │   ├── Debug.vue          # 样本调试
│   │   └── Compare.vue        # 版本对比
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 UI 设计

### 配色方案

- **主色调**: 深蓝 (#1E40AF)
- **辅助色**: 浅灰 (#F5F7FA)
- **强调色**: 蓝色渐变
- **成功色**: #67C23A
- **警告色**: #E6A23C
- **危险色**: #F56C6C

### 设计规范

- **圆角**: 8px
- **阴影**: `0 2px 8px rgba(0, 0, 0, 0.08)`
- **字体**: 系统默认无衬线字体
- **响应式**: 适配 1280px+ 桌面端

## 📊 核心页面

### 1. 仪表盘 (/dashboard)

- 统计卡片：总任务数、运行中、已完成、平均得分
- 最近任务列表
- 快捷操作入口

### 2. 任务列表 (/tasks)

- 任务筛选与搜索
- 任务状态管理
- 指标预览

### 3. 任务详情 (/tasks/:id)

- 任务基本信息
- 指标总览（雷达图、柱状图）
- 样本列表
- 版本对比入口

### 4. 样本调试 (/debug)

- 表单输入：问题、上下文、回答、标准答案
- 实时评估
- 指标详细解释

### 5. 版本对比 (/compare)

- 双版本选择
- 指标对比表格
- 雷达图可视化
- 对比结论分析

## 🔌 API 集成

前端通过 Axios 与后端 FastAPI 服务通信：

```typescript
// 评估接口
POST /api/rag/evaluation
{
  "user_input": ["问题"],
  "response": ["回答"],
  "retrieved_contexts": [["上下文"]],
  "reference": ["标准答案"]
}
```

## 🔧 开发

### 代码规范

- TypeScript 严格模式
- ESLint + Prettier
- 组件采用 Composition API
- 使用 `<script setup>` 语法糖

### 状态管理

使用 Pinia store 管理全局状态：

```typescript
// 使用示例
import { useTaskStore } from '@/stores/task'

const taskStore = useTaskStore()
await taskStore.fetchTasks()
```

### 路由配置

```typescript
// 路由守卫、动态加载等在 router/index.ts 中配置
```

## 🎯 待优化

- [ ] 添加用户认证与权限管理
- [ ] 支持批量上传数据集
- [ ] 导出 PDF/CSV 报告
- [ ] 移动端适配
- [ ] 实时数据推送（WebSocket）
- [ ] 更多图表类型（趋势图、热力图）

## 📝 注意事项

1. **依赖安装错误**：TypeScript 类型错误是因为依赖未安装，运行 `npm install` 后会自动解决
2. **API 代理**：Vite 已配置代理，所有 `/api` 请求会转发到 `http://localhost:8000`
3. **图表自适应**：ECharts 图表会自动适应容器大小

## 📄 许可

MIT License
