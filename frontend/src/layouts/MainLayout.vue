<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <router-link to="/" class="flex items-center no-underline text-white">
            <q-icon name="music_note" size="md" class="q-mr-sm" />
            Co-Producer
          </router-link>
        </q-toolbar-title>

        <!-- User menu -->
        <q-btn round flat icon="settings">
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup to="/settings">
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Settings</q-item-section>
              </q-item>

              <q-item clickable v-close-popup to="/backup">
                <q-item-section avatar>
                  <q-icon name="backup" />
                </q-item-section>
                <q-item-section>Backup & Restore</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup href="https://github.com/yourusername/co-producer" target="_blank">
                <q-item-section avatar>
                  <q-icon name="help" />
                </q-item-section>
                <q-item-section>Help & Support</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="250"
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label header class="text-grey-8 q-my-sm">
          CO-PRODUCER
        </q-item-label>

        <q-separator />

        <NavigationItem
          v-for="item in navigationItems"
          :key="item.label"
          :icon="item.icon"
          :label="item.label"
          :to="item.to"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-grey-8">
      <q-toolbar>
        <q-toolbar-title class="text-body2 text-center">
          Co-Producer v1.0.0 | <a href="https://github.com/yourusername/co-producer" class="text-primary">GitHub</a>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NavigationItem from 'components/NavigationItem.vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const navigationItems = [
  {
    icon: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard'
  },
  {
    icon: 'folder',
    label: 'Projects',
    to: '/projects'
  },
  {
    icon: 'person',
    label: 'Artists',
    to: '/artists'
  },
  {
    icon: 'piano',
    label: 'Techniques',
    to: '/techniques'
  },
  {
    icon: 'hardware',
    label: 'Gear',
    to: '/gear'
  },
  {
    icon: 'trending_up',
    label: 'Progress',
    to: '/progress'
  },
  {
    icon: 'label',
    label: 'Tags',
    to: '/tags'
  }
];
</script>
