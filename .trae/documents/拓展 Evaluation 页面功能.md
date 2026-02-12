## 功能拓展方案

### 目标
- 支持自动调用问答接口获取回答和检索文档
- 支持管理问题库，按每条问题隔离
- 保持现有手动评估功能

### 问答接口信息
- **接口地址**: `localhost:8123/api/mine/chat/test`
- **请求参数**: `string query` (用户问题)
- **返回格式**:
  ```json
  {
    "chatResult": "模型回答内容",
    "retrievedDocuments": ["检索到的文档1", "检索到的文档2"]
  }
  ```

### 主要修改点

#### 1. 新增 API 接口封装
- 在 `src/api/` 目录新增 `qa.ts` 文件
- 封装问答接口调用方法：
  ```typescript
  export const qaApi = {
    getAnswer(query: string) {
      return request.post('/api/mine/chat/test', { query })
    }
  }
  ```

#### 2. 修改 Evaluation.vue 页面
- **新增标签页**：
  - 手动评估（保持现有功能）
  - 自动评估（新增功能）
- **自动评估区域**：
  - 问题库管理（新增/编辑/删除问题）
  - 问题选择器（下拉选择已保存问题）
  - 标准回答输入框
  - 执行按钮（调用问答接口 + 执行评估）
- **结果展示**：保持现有评估结果展示

#### 3. 新增数据结构
- 在 `src/types/index.ts` 中新增：
  ```typescript
  // 问题库数据结构
  export interface QAQuestion {
    id: string
    query: string
    reference: string
    createdAt: string
  }
  
  // 问答接口响应结构
  export interface QAResponse {
    chatResult: string
    retrievedDocuments: string[]
  }
  ```

#### 4. 状态管理优化
- 在 `src/stores/` 目录新增 `question.ts` 文件
- 实现问题库状态管理：
  - 问题列表 CRUD 操作
  - 本地存储持久化
  - 问题选择状态管理

#### 5. 工具配置修改
- 在 `src/utils/request.ts` 中新增问答接口基础配置：
  - 可配置的问答接口基础 URL

### 技术实现
- 使用 Pinia 管理问题库状态
- 使用 localStorage 持久化问题数据
- 新增问答 API 调用方法
- 保持与现有评估流程的兼容性

### 界面设计
- 采用标签页布局，区分手动和自动评估模式
- 问题库使用表格展示，支持快速选择
- 自动评估流程添加加载状态和错误处理
- 保持现有评估结果展示功能

### 向后兼容
- 保留所有现有手动评估功能
- 问题库数据与现有任务数据分离存储
- 评估结果格式保持一致