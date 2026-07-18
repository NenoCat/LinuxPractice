import { createRouter, createWebHistory } from 'vue-router'
import PracticeView from '../views/PracticeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: PracticeView
  },
  {
    path: '/reference',
    name: 'Reference',
    component: () => import('../views/ReferenceView.vue')
  },
  {
    path: '/command/:command',
    name: 'CommandDetail',
    component: () => import('../views/CommandDetailView.vue')
  },
  {
    path: '/wrong',
    name: 'WrongBook',
    component: () => import('../views/WrongBookView.vue')
  },
  {
    path: '/import',
    name: 'Import',
    component: () => import('../views/ImportView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
