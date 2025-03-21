<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Personal Settings</h2>
      <button class="btn btn-primary" @click="showAddModal = true">Add New Setting</button>
    </div>

    <!-- Settings List -->
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Setting Name</th>
            <th>Value</th>
            <th>Last Modified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="setting in settings" :key="setting.id">
            <td>{{ setting.name }}</td>
            <td>{{ setting.value }}</td>
            <td>{{ formatDate(setting.lastModified) }}</td>
            <td>
              <button 
                class="btn btn-sm btn-outline-primary me-2"
                @click="editSetting(setting)"
              >
                Edit
              </button>
              <button 
                class="btn btn-sm btn-outline-danger"
                @click="deleteSetting(setting.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal || showEditModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showEditModal ? 'Edit Setting' : 'Add New Setting' }}</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Setting Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="currentSetting.name"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Value</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="currentSetting.value"
                  required
                />
              </div>
              <div class="modal-footer">
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  @click="closeModals"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                >
                  {{ showEditModal ? 'Save Changes' : 'Add Setting' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Backdrop -->
    <div 
      class="modal-backdrop fade show" 
      v-if="showAddModal || showEditModal"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Setting {
  id: number;
  name: string;
  value: string;
  lastModified: string;
}

const settings = ref<Setting[]>([
  {
    id: 1,
    name: 'Theme',
    value: 'Light',
    lastModified: '2024-03-14T10:00:00Z'
  },
  {
    id: 2,
    name: 'Language',
    value: 'English',
    lastModified: '2024-03-14T10:00:00Z'
  }
]);

const showAddModal = ref(false);
const showEditModal = ref(false);
const currentSetting = ref<Partial<Setting>>({});

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  currentSetting.value = {};
};

const editSetting = (setting: Setting) => {
  currentSetting.value = { ...setting };
  showEditModal.value = true;
};

const deleteSetting = (id: number) => {
  if (confirm('Are you sure you want to delete this setting?')) {
    settings.value = settings.value.filter(setting => setting.id !== id);
  }
};

const handleSubmit = () => {
  if (showEditModal.value) {
    const index = settings.value.findIndex(s => s.id === currentSetting.value.id);
    if (index !== -1) {
      settings.value[index] = {
        ...currentSetting.value as Setting,
        lastModified: new Date().toISOString()
      };
    }
  } else {
    settings.value.push({
      id: Math.max(0, ...settings.value.map(s => s.id)) + 1,
      name: currentSetting.value.name!,
      value: currentSetting.value.value!,
      lastModified: new Date().toISOString()
    });
  }
  closeModals();
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>