<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>API Key</h2>
      <button class="btn btn-primary" @click="showAddModal = true">Add New API Key</button>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>API Name</th>
            <th>Active Endpoints</th>
            <th>Expiration Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="apiKey in apiKeys" :key="apiKey.id">
            <td>{{ apiKey.name }}</td>
            <td>
              <span 
                v-for="endpoint in apiKey.endpoints" 
                :key="endpoint"
                class="badge bg-info me-1"
              >
                {{ endpoint }}
              </span>
            </td>
            <td>{{ formatDate(apiKey.expirationDate) }}</td>
            <td>
              <button 
                class="btn btn-sm btn-outline-primary me-2"
                @click="editApiKey(apiKey)"
              >
                Edit
              </button>
              <button 
                class="btn btn-sm btn-outline-danger"
                @click="deleteApiKey(apiKey.id)"
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
            <h5 class="modal-title">{{ showEditModal ? 'Edit API Key' : 'Add New API Key' }}</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">API Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="currentApiKey.name"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Active Endpoints</label>
                <div class="border rounded p-3">
                  <div class="form-check" v-for="endpoint in availableEndpoints" :key="endpoint">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'endpoint-' + endpoint"
                      :value="endpoint"
                      v-model="currentApiKey.endpoints"
                    />
                    <label class="form-check-label" :for="'endpoint-' + endpoint">
                      {{ endpoint }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Expiration Date</label>
                <input 
                  type="date" 
                  class="form-control"
                  v-model="currentApiKey.expirationDate"
                  :min="minDate"
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
                  {{ showEditModal ? 'Save Changes' : 'Add API Key' }}
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
import { ref, computed } from 'vue';

interface ApiKey {
  id: number;
  name: string;
  endpoints: string[];
  expirationDate: string;
}

const apiKeys = ref<ApiKey[]>([
  {
    id: 1,
    name: 'Production API Key',
    endpoints: ['/api/users', '/api/products'],
    expirationDate: '2024-12-31'
  },
  {
    id: 2,
    name: 'Development API Key',
    endpoints: ['/api/test'],
    expirationDate: '2024-06-30'
  }
]);

const availableEndpoints = [
  '/api/users',
  '/api/products',
  '/api/orders',
  '/api/test',
  '/api/metrics'
];

const showAddModal = ref(false);
const showEditModal = ref(false);
const currentApiKey = ref<Partial<ApiKey>>({
  endpoints: []
});

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  currentApiKey.value = { endpoints: [] };
};

const editApiKey = (apiKey: ApiKey) => {
  currentApiKey.value = { ...apiKey };
  showEditModal.value = true;
};

const deleteApiKey = (id: number) => {
  if (confirm('Are you sure you want to delete this API key?')) {
    apiKeys.value = apiKeys.value.filter(apiKey => apiKey.id !== id);
  }
};

const handleSubmit = () => {
  if (showEditModal.value) {
    const index = apiKeys.value.findIndex(key => key.id === currentApiKey.value.id);
    if (index !== -1) {
      apiKeys.value[index] = {
        ...currentApiKey.value as ApiKey
      };
    }
  } else {
    apiKeys.value.push({
      id: Math.max(0, ...apiKeys.value.map(key => key.id)) + 1,
      name: currentApiKey.value.name!,
      endpoints: currentApiKey.value.endpoints || [],
      expirationDate: currentApiKey.value.expirationDate!
    });
  }
  closeModals();
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.badge {
  font-size: 0.875em;
}
</style>