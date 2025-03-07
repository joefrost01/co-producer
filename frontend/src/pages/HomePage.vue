<template>
  <q-page class="flex flex-center column q-pa-md">
    <div class="text-center q-mb-lg">
      <h1 class="text-h3 q-mb-md">Co-Producer</h1>
      <p class="text-subtitle1 q-mb-lg">AI-powered collaborative music production assistant</p>

      <q-btn
        color="primary"
        label="Create New Project"
        to="/projects/new"
        unelevated
        size="lg"
        class="q-mb-md"
      />

      <q-btn
        outline
        color="secondary"
        label="Browse Projects"
        to="/projects"
        class="q-ml-sm"
      />
    </div>

    <div class="row q-col-gutter-md justify-center full-width q-mt-lg">
      <div v-for="feature in features" :key="feature.title" class="col-xs-12 col-sm-6 col-md-4">
        <q-card class="feature-card q-pa-md">
          <q-card-section>
            <div class="text-h6">{{ feature.title }}</div>
            <div class="text-subtitle2 q-mt-sm">{{ feature.description }}</div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat color="primary" :to="feature.link.path" :label="feature.link.label" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div class="q-mt-xl">
      <h2 class="text-h5 q-mb-md text-center">How It Works</h2>
      <div class="row q-col-gutter-md q-mt-md justify-center">
        <div v-for="(step, index) in steps" :key="index" class="col-xs-12 col-sm-6 col-md-3">
          <q-card flat bordered class="step-card q-pa-md">
            <q-card-section class="text-center">
              <div class="text-h6 q-mb-xs">Step {{ index + 1 }}</div>
              <div class="text-subtitle1 q-mb-sm">{{ step.title }}</div>
              <div class="text-body2">{{ step.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const features = ref([
  {
    title: 'AI-Powered Collaboration',
    description: 'Generate production ideas, refine arrangements, and experiment with different styles',
    link: { label: 'Learn More', path: '/projects' }
  },
  {
    title: 'Learning Integration',
    description: 'Get tailored learning resources for instruments, techniques, and production styles',
    link: { label: 'Explore', path: '/techniques' }
  },
  {
    title: 'Track Development',
    description: 'Follow structured workflows to build a song from initial concept to completion',
    link: { label: 'Get Started', path: '/projects/new' }
  },
  {
    title: 'Equipment Awareness',
    description: 'AI understands your available gear, plugins, and instruments for practical suggestions',
    link: { label: 'Manage Gear', path: '/gear' }
  },
  {
    title: 'Artist Inspiration',
    description: 'Draw inspiration from various artists and their unique techniques',
    link: { label: 'View Artists', path: '/artists' }
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your improvement in different techniques and skills',
    link: { label: 'Track Progress', path: '/progress' }
  }
]);

const steps = ref([
  {
    title: 'Define Your Project',
    description: 'Choose a track concept, style, and inspirations. Define your learning objectives and gear.'
  },
  {
    title: 'Generate Briefing',
    description: 'The system compiles an AI-ready briefing pack containing all your project details.'
  },
  {
    title: 'Collaborate with AI',
    description: 'Engage in dynamic idea exchanges. Receive production and arrangement suggestions.'
  },
  {
    title: 'Develop & Finalize',
    description: 'Apply learned techniques to your music. Iterate based on AI and personal insights.'
  }
]);
</script>

<style lang="scss" scoped>
.feature-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.step-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
