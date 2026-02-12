# juejuezi-rag-evaluation

绝绝子的 RAG 评估平台 - 专业的检索增强生成系统评估工具

## 项目简介

本项目是一个基于 FastAPI 和 Vue 3 的 RAG (Retrieval-Augmented Generation) 系统评估平台，使用 RAGAS 框架对 RAG 系统进行多维度评估。平台提供了直观的 Web 界面，支持单条样本实时评估、批量任务管理、版本对比等功能。

## 功能特性

- **多维度评估指标** - 支持 5 种核心评估指标，可灵活配置开关
- **实时样本调试** - 单条样本快速评估，即时查看结果
- **任务管理** - 评估任务的创建、查看、删除，数据持久化
- **版本对比** - 不同版本 RAG 系统的性能对比分析
- **可视化展示** - 仪表盘统计、雷达图、柱状图等多种图表
- **RESTful API** - 完整的 API 接口，支持集成调用

## 技术栈

### 后端

- **FastAPI** - 高性能 Web 框架
- **RAGAS** - RAG 评估框架
- **LangChain** - LLM 和 Embeddings 封装
- **DashScope** - 阿里云大模型 API
- **Pydantic** - 数据验证

### 前端

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Element Plus** - Vue 3 组件库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **ECharts** - 数据可视化
- **Axios** - HTTP 客户端

## 评估指标

平台支持以下 5 个评估指标：

| 指标                                 | 说明                                                       | 评分标准                                           |
| ------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------- |
| **忠实度** (Faithfulness)            | 衡量模型回答与检索上下文的一致性，值越高说明回答越基于事实 | 优秀: >85%, 良好: 70-85%, 一般: 50-70%, 较差: <50% |
| **上下文精确度** (Context Precision) | 衡量检索到的上下文与问题的相关性，值越高说明检索越精准     | 优秀: >85%, 良好: 70-85%, 一般: 50-70%, 较差: <50% |
| **上下文召回率** (Context Recall)    | 衡量检索到的上下文包含标准答案的程度，值越高说明召回越完整 | 优秀: >85%, 良好: 70-85%, 一般: 50-70%, 较差: <50% |
| **噪声敏感度** (Noise Sensitivity)   | 衡量模型对无关信息的抗干扰能力，值越低说明抗干扰越强       | 值越低越好                                         |
| **回答相关性** (Answer Relevancy)    | 衡量模型回答与用户问题的相关程度，值越高说明回答越切题     | 优秀: >85%, 良好: 70-85%, 一般: 50-70%, 较差: <50% |

## 项目结构

```
juejuezi-rag-evaluation/
├── evaluation/              # 后端代码
│   ├── __init__.py
│   ├── api.py             # FastAPI 应用和评估接口
│   ├── tool.py            # RAGAS 评估工具
│   ├── class.py           # 数据模型定义
│   └── main.py            # 测试入口
├── frontend/              # 前端代码
│   ├── src/
│   │   ├── api/
│   │   │   └── evaluation.ts  # API 接口封装
│   │   ├── layouts/
│   │   │   └── MainLayout.vue # 主布局
│   │   ├── router/
│   │   │   └── index.ts       # 路由配置
│   │   ├── stores/
│   │   │   ├── index.ts       # Pinia 入口
│   │   │   └── task.ts        # 任务状态管理
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript 类型定义
│   │   ├── utils/
│   │   │   └── request.ts     # Axios 封装
│   │   ├── views/
│   │   │   ├── Dashboard.vue  # 仪表盘
│   │   │   ├── TaskList.vue   # 任务列表
│   │   │   ├── TaskDetail.vue # 任务详情
│   │   │   ├── Evaluation.vue # 单条评估
│   │   │   └── Compare.vue    # 版本对比
│   │   ├── App.vue
│   │   └── main.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .env                    # 环境变量配置
├── README.md              # 项目说明
└── 启动指南.md            # 详细启动指南
```

## 快速开始

### 环境要求

- Python >= 3.8
- Node.js >= 16
- npm 或 yarn

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd juejuezi-rag-evaluation
```

2. **配置环境变量**
   复制 `.env` 文件并填入你的 API 密钥：

```env
LLM_API_KEY="your-llm-api-key"
LLM_MODEL_ID="qwen3-max"
LLM_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
```

3. **安装后端依赖**

```bash
pip install fastapi uvicorn ragas langchain langchain-openai langchain-community datasets python-dotenv
```

4. **安装前端依赖**

```bash
cd frontend
npm install
```

### 启动服务

1. **启动后端服务**

```bash
cd evaluation
python main.py
```

后端将在 http://localhost:8000 启动

2. **启动前端服务**

```bash
cd frontend
npm run dev
```

前端将在 http://localhost:3000 启动

3. **访问平台**
   打开浏览器访问 http://localhost:3000

## API 文档

启动后端服务后，访问 http://localhost:8000/docs 查看 Swagger UI 自动生成的 API 文档。

### 核心接口

**执行评估**

```
POST /api/rag/evaluation
```

请求体示例：

```json
{
  "user_input": ["谁是中国最受欢迎的歌手？"],
  "response": ["周杰伦"],
  "retrieved_contexts": [["周杰伦是华语流行音乐歌手"]],
  "reference": ["周杰伦"],
  "metrics_config": {
    "faithfulness": true,
    "context_precision": true,
    "context_recall": true,
    "noise_sensitivity": true,
    "answer_relevancy": true
  }
}
```

响应示例：

```json
{
  "scores": [
    {
      "faithfulness": 0.85,
      "context_precision": 0.78,
      "context_recall": 0.82,
      "noise_sensitivity(mode=relevant)": 0.15,
      "answer_relevancy": 0.9
    }
  ]
}
```

## 使用指南

### 1. 单条样本评估

1. 访问 "单条评估" 页面
2. 填写表单信息：
   - 用户问题
   - 检索上下文（可添加多个）
   - 模型回答
   - 标准答案
3. 选择需要评估的指标
4. 点击 "执行评估" 按钮
5. 查看评估结果和详细说明

### 2. 任务管理

1. 访问 "评估任务" 页面查看所有任务
2. 点击任务名称查看详情
3. 任务详情页面展示：
   - 雷达图：多维度指标对比
   - 柱状图：各指标得分
   - 样本列表：每个样本的详细数据

### 3. 版本对比

1. 访问 "版本对比" 页面
2. 选择两个不同的任务版本
3. 查看对比表格和雷达图
4. 分析两个版本的性能差异

## 常见问题

### Q1: 前端无法连接后端

**A**:

- 确认后端已启动在 8000 端口
- 检查 `.env` 文件配置是否正确
- 查看浏览器开发者工具 Network 面板

### Q2: 评估失败

**A**:

- 检查 API 密钥是否有效
- 确认网络连接正常
- 查看后端日志获取详细错误信息

### Q3: 图表不显示

**A**:

- 确保有评估数据
- 尝试刷新页面
- 检查浏览器控制台错误

## 生产环境部署

### 构建前端

```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist/` 目录

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

## 开发建议

1. **代码风格**: 遵循 TypeScript + ESLint + Prettier
2. **组件化**: 优先使用 Composition API
3. **状态管理**: 复杂状态使用 Pinia store
4. **性能优化**: 使用 `v-if` 而非 `v-show` 减少渲染
5. **类型安全**: 充分利用 TypeScript 类型检查

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。
