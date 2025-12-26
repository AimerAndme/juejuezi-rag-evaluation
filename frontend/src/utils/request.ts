import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage, ElLoading } from 'element-plus'

// 加载实例计数器
let loadingInstance: any = null
let requestCount = 0

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    // 显示全局 loading（请求计数 +1）
    requestCount++
    if (requestCount === 1) {
      loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    return config
  },
  error => {
    requestCount--
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 隐藏 loading（请求计数 -1）
    requestCount--
    if (requestCount === 0 && loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }

    const { data } = response
    return data
  },
  error => {
    // 隐藏 loading
    requestCount--
    if (requestCount === 0 && loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }

    // 错误处理
    const message = error.response?.data?.message || error.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
