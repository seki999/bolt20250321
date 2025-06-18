import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import MyPage from '../views/MyPage.vue';
import PersonalSettings from '../views/modules/PersonalSettings.vue';
import ResourceManagement from '../views/modules/ResourceManagement.vue';
import AdministrationSettings from '../views/modules/AdministrationSettings.vue';
//import AppCreate from '../views/modules/AppCreate.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'app',
        name: 'App',
        component: () => import('../views/modules/App.vue')
      },
      {
        path: 'app-create',
        name: 'AppCreate',
        component: () => import('../views/modules/AppCreate.vue')
      },
      {
        path: 'table',
        name: 'Table',
        component: () => import('../views/modules/Table.vue')
      },
      {
        path: 'endpoint',
        name: 'Endpoint',
        component: () => import('../views/modules/Endpoint.vue')
      },
      {
        path: 'message-blocker',
        name: 'MessageBlocker',
        component: () => import('../views/modules/MessageBlocker.vue')
      },
      {
        path: 'api-key',
        name: 'ApiKey',
        component: () => import('../views/modules/ApiKey.vue')
      },
      {
        path: 'file-management',
        name: 'FileManagement',
        component: () => import('../views/modules/FileManagement.vue')
      },
      {
        path: 'migration',
        name: 'Migration',
        component: () => import('../views/modules/Migration.vue')
      },
      {
        path: 'personal-settings',
        name: 'PersonalSettings',
        component: PersonalSettings
      },
      {
        path: 'resource-management',
        name: 'ResourceManagement',
        component: ResourceManagement
      },
      {
        path: 'administration-settings',
        name: 'AdministrationSettings',
        component: AdministrationSettings
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('user');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;