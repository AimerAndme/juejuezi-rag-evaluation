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
          path: '/evaluation',
          name: 'Evaluation',
          component: () => import('@/views/Evaluation.vue'),
          meta: { title: '单条评估' }
        },
        {
          path: '/compare',
          name: 'Compare',
          component: () => import('@/views/Compare.vue'),
          meta: { title: '版本对比' }
        },
        {
          path: '/debug',
          redirect: '/evaluation'
        }
      ]
    }
  ]
})

export default router
