import request from '@/utils/request'
import type { QAResponse } from '@/types'

/** 问答接口 API */
export const qaApi = {
  /**
   * 获取问题回答和检索文档
   * @param query 用户问题
   * @returns 包含回答和检索文档的响应
   */
  getAnswer(query: string) {
    return request.get<QAResponse>('http://localhost:8123/api/mine/chat/test', {
      params: {
        query
      }
    })
  }
}
