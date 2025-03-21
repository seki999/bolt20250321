<template>
  <div class="container">
    <h2>App Management</h2>
    <div class="mb-4">
      <button class="btn btn-primary">New App</button>
    </div>
    <div class="list-group">
      <div v-for="app in apps" :key="app.id" class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-1">{{ app.name }}</h5>
          <span :class="['badge', app.status === 'Running' ? 'bg-success' : 'bg-danger']">
            {{ app.status }}
          </span>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary me-2">Edit</button>
          <button class="btn btn-sm btn-outline-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const apps = ref([
  { id: 1, name: 'Sample App', status: 'Running' },
  { id: 2, name: 'Test App', status: 'Stopped' }
]);
</script>