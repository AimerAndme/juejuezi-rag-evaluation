import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '仪表盘' }
        },
        {
          path: '/tasks',
          name: 'TaskList',
          component: () => import('@/views/TaskList.vue'),
          meta: { title: '评估任务' }
        },
        {
          path: '/tasks/:id',
          name: 'TaskDetail',
          component: () => import('@/views/TaskDetail.vue'),
          meta: { title: '任务详情' }
        },
        {
          path: '/debug',
          name: 'Debug',
          component: () => import('@/views/Debug.vue'),
          meta: { title: '样本调试' }
        },
        {
          path: '/compare',
          name: 'Compare',
          component: () => import('@/views/Compare.vue'),
          meta: { title: '版本对比' }
        }
      ]
    }
  ]
})

export default router
