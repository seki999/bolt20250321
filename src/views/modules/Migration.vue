<template>
  <div class="container">
    <h2>Migration</h2>
    
    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'export' }"
          href="#"
          @click.prevent="activeTab = 'export'"
        >
          Export
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'import' }"
          href="#"
          @click.prevent="activeTab = 'import'"
        >
          Import
        </a>
      </li>
    </ul>

    <!-- Export Tab Content -->
    <div v-if="activeTab === 'export'" class="tab-pane active">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>App Name</th>
              <th>Engine Version</th>
              <th>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="selectAll"
                    v-model="selectAll"
                    @change="toggleSelectAll"
                  />
                  <label class="form-check-label" for="selectAll">
                    Select All
                  </label>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in apps" :key="app.id">
              <td>{{ app.name }}</td>
              <td>{{ app.engineVersion }}</td>
              <td>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="'app-' + app.id"
                    v-model="selectedApps"
                    :value="app.id"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-3">
        <button 
          class="btn btn-primary"
          :disabled="!selectedApps.length"
          @click="exportSelected"
        >
          Export Selected
        </button>
      </div>
    </div>

    <!-- Import Tab Content -->
    <div v-if="activeTab === 'import'" class="tab-pane active">
      <div class="mb-4">
        <div class="d-flex align-items-center gap-3">
          <label 
            for="fileUpload" 
            class="btn btn-primary mb-0"
            style="cursor: pointer;"
          >
            Upload ZIP File
          </label>
          <span v-if="selectedFile" class="text-muted">
            {{ selectedFile.name }}
          </span>
          <input
            type="file"
            id="fileUpload"
            accept=".zip"
            class="d-none"
            @change="handleFileSelect"
          />
        </div>
      </div>
      <div class="alert alert-info">
        <h5 class="alert-heading">Important Notes:</h5>
        <p class="mb-2">Please ensure the folder structure matches the exported ZIP file.</p>
        <ul class="mb-0">
          <li>Older versions of the app will be automatically updated to the current version.</li>
          <li>Newer versions of the app cannot be imported into an older version.</li>
        </ul>
      </div>
      <div v-if="selectedFile" class="mt-3">
        <button 
          class="btn btn-primary"
          @click="importFile"
        >
          Import
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface App {
  id: number;
  name: string;
  engineVersion: string;
}

const activeTab = ref<'export' | 'import'>('export');
const selectedFile = ref<File | null>(null);
const selectedApps = ref<number[]>([]);
const selectAll = ref(false);

const apps = ref<App[]>([
  {
    id: 1,
    name: 'Customer Portal',
    engineVersion: '2.1.0'
  },
  {
    id: 2,
    name: 'Analytics Dashboard',
    engineVersion: '1.8.5'
  },
  {
    id: 3,
    name: 'Inventory Manager',
    engineVersion: '3.0.1'
  }
]);

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedApps.value = apps.value.map(app => app.id);
  } else {
    selectedApps.value = [];
  }
};

// Watch selectedApps to update selectAll state
computed(() => {
  selectAll.value = selectedApps.value.length === apps.value.length;
});

const exportSelected = () => {
  const selectedItems = apps.value.filter(app => selectedApps.value.includes(app.id));
  console.log('Exporting:', selectedItems);
  // Here you would implement the actual export functionality
  alert('Export started for selected apps');
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  }
};

const importFile = () => {
  if (!selectedFile.value) return;
  
  // Here you would implement the actual import functionality
  console.log('Importing file:', selectedFile.value.name);
  alert('Import started');
  
  // Reset file selection after import
  selectedFile.value = null;
  const input = document.getElementById('fileUpload') as HTMLInputElement;
  if (input) input.value = '';
};
</script>

<style scoped>
.nav-tabs .nav-link {
  cursor: pointer;
}

.alert ul {
  padding-left: 1.2rem;
}
</style>