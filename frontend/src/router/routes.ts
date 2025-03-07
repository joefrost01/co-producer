import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Home page and dashboard
      {
        path: '',
        component: () => import('pages/HomePage.vue')
      },
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue')
      },

      // Projects
      {
        path: 'projects',
        component: () => import('pages/ProjectList.vue')
      },
      {
        path: 'projects/new',
        component: () => import('pages/ProjectForm.vue')
      },
      {
        path: 'projects/:id',
        component: () => import('pages/ProjectDetail.vue')
      },
      {
        path: 'projects/:id/edit',
        component: () => import('pages/ProjectForm.vue'),
        props: route => ({ id: route.params.id })
      },
      {
        path: 'projects/:id/briefing',
        component: () => import('pages/ProjectDetail.vue'),
        props: route => ({ id: route.params.id, showBriefing: true })
      },

      // Artists
      {
        path: 'artists',
        component: () => import('pages/ArtistList.vue')
      },
      {
        path: 'artists/:id',
        component: () => import('pages/ArtistDetail.vue')
      },

      // Techniques
      {
        path: 'techniques',
        component: () => import('pages/TechniqueList.vue')
      },
      {
        path: 'techniques/:id',
        component: () => import('pages/TechniqueDetail.vue')
      },

      // Gear
      {
        path: 'gear',
        component: () => import('pages/GearList.vue')
      },

      // Progress
      {
        path: 'progress',
        component: () => import('pages/ProgressPage.vue')
      },

      // Tags
      {
        path: 'tags',
        component: () => import('pages/TagManagement.vue')
      },

      // Settings
      {
        path: 'settings',
        component: () => import('pages/SettingsPage.vue')
      },
      {
        path: 'backup',
        component: () => import('pages/SettingsPage.vue'),
        props: { section: 'backup' }
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
