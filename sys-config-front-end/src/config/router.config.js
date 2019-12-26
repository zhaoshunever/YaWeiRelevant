import {
  UserLayout,
  TabLayout,
  BlankLayout,
  RouteView
} from '@/components/layouts'

/**
 * 走菜单，走权限控制
 * @type {[null,null]}
 */
export const asyncRouterMap = [

  {
    path: '/',
    name: 'dashboard',
    component: TabLayout,
    meta: {
      title: '首页'
    },
    redirect: 'dashboard/analysis',
    // /
    children: []
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [{
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [{
        path: 'login',
        name: 'login',
        component: () => import( /* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import( /* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import( /* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'alteration',
        name: 'alteration',
        component: () => import( /* webpackChunkName: "user" */ '@/views/user/Alteration')
      },
    ]
  },
  {
    path: '/test',
    component: BlankLayout,
    redirect: '/test/home',
    children: [{
      path: 'home',
      name: 'TestHome',
      component: () => import('@/views/Home')
    }]
  },
  {
    path: '/404',
    component: () => import( /* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '/issue',
    name: 'issue',
    component: TabLayout,
    redirect: '/issue/index',
    children: [{
      path: 'index',
      name: 'index',
      component: () => import( /* webpackChunkName: "index" */ '@/views/issue/issue-index.vue')
    }]
  },
  {
    path: '/enumerate',
    name: 'enumerate',
    component: TabLayout,
    children: [{
      path: 'enumerate-code-index',
      name: 'enumerate-code-index',
      component: () => import( /* webpackChunkName: "index" */ '@/views/enumerate/enumerate-code-index.vue')
    }]
  },

]