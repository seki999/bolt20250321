<template>
  <div class="container">
    <h2>Endpoints</h2>
    
    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'http' }"
          href="#"
          @click.prevent="activeTab = 'http'"
        >
          Data Input (HTTP)
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'table' }"
          href="#"
          @click.prevent="activeTab = 'table'"
        >
          Table API
        </a>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Data Input (HTTP) Tab -->
      <div v-if="activeTab === 'http'" class="tab-pane active">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h5 mb-0">HTTP Endpoints</h3>
          <button class="btn btn-primary" @click="showAddModal = true">
            Add New Endpoint
          </button>
        </div>
        
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Endpoint Name</th>
                <th>Setting Destination</th>
                <th>API Key</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="endpoint in httpEndpoints" :key="endpoint.id">
                <td>{{ endpoint.name }}</td>
                <td>{{ endpoint.destination }}</td>
                <td>
                  <code>{{ endpoint.apiKey }}</code>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="editEndpoint(endpoint)"
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteEndpoint(endpoint.id)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Table API Tab -->
      <div v-if="activeTab === 'table'" class="tab-pane active">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h5 mb-0">Table API Endpoints</h3>
          <button class="btn btn-primary" @click="showAddModal = true">
            Add New Endpoint
          </button>
        </div>
        
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Endpoint Name</th>
                <th>Setting Destination</th>
                <th>API Key</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="endpoint in tableEndpoints" :key="endpoint.id">
                <td>{{ endpoint.name }}</td>
                <td>{{ endpoint.destination }}</td>
                <td>
                  <code>{{ endpoint.apiKey }}</code>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="editEndpoint(endpoint)"
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteEndpoint(endpoint.id)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal || showEditModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showEditModal ? 'Edit Endpoint' : 'Add New Endpoint' }}</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Endpoint Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="currentEndpoint.name"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Setting Destination</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="currentEndpoint.destination"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">API Key</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="currentEndpoint.apiKey"
                    readonly
                  />
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="generateApiKey"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Type</label>
                <select 
                  class="form-select"
                  v-model="currentEndpoint.type"
                  required
                >
                  <option value="http">Data Input (HTTP)</option>
                  <option value="table">Table API</option>
                </select>
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
                  {{ showEditModal ? 'Save Changes' : 'Add Endpoint' }}
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

interface Endpoint {
  id: number;
  name: string;
  destination: string;
  apiKey: string;
  type: 'http' | 'table';
}

const activeTab = ref<'http' | 'table'>('http');
const endpoints = ref<Endpoint[]>([
  {
    id: 1,
    name: 'User Data API',
    destination: '/api/users',
    apiKey: 'uk_1234567890',
    type: 'http'
  },
  {
    id: 2,
    name: 'Products Table',
    destination: '/api/products',
    apiKey: 'tk_0987654321',
    type: 'table'
  }
]);

const httpEndpoints = computed(() => 
  endpoints.value.filter(endpoint => endpoint.type === 'http')
);

const tableEndpoints = computed(() => 
  endpoints.value.filter(endpoint => endpoint.type === 'table')
);

const showAddModal = ref(false);
const showEditModal = ref(false);
const currentEndpoint = ref<Partial<Endpoint>>({
  type: 'http'
});

const generateApiKey = () => {
  const prefix = currentEndpoint.value.type === 'http' ? 'uk_' : 'tk_';
  const randomString = Math.random().toString(36).substring(2, 15);
  currentEndpoint.value.apiKey = `${prefix}${randomString}`;
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  currentEndpoint.value = { type: activeTab.value };
};

const editEndpoint = (endpoint: Endpoint) => {
  currentEndpoint.value = { ...endpoint };
  showEditModal.value = true;
};

const deleteEndpoint = (id: number) => {
  if (confirm('Are you sure you want to delete this endpoint?')) {
    endpoints.value = endpoints.value.filter(endpoint => endpoint.id !== id);
  }
};

const handleSubmit = () => {
  if (showEditModal.value) {
    const index = endpoints.value.findIndex(e => e.id === currentEndpoint.value.id);
    if (index !== -1) {
      endpoints.value[index] = {
        ...currentEndpoint.value as Endpoint
      };
    }
  } else {
    if (!currentEndpoint.value.apiKey) {
      generateApiKey();
    }
    endpoints.value.push({
      id: Math.max(0, ...endpoints.value.map(e => e.id)) + 1,
      name: currentEndpoint.value.name!,
      destination: currentEndpoint.value.destination!,
      apiKey: currentEndpoint.value.apiKey!,
      type: currentEndpoint.value.type as 'http' | 'table'
    });
  }
  closeModals();
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.nav-tabs .nav-link {
  cursor: pointer;
}

code {
  font-size: 0.875em;
  color: #d63384;
  background-color: #f8f9fa;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
}
</style>