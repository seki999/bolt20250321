<template>
  <div class="container">
    <h2>MQTT Blocker Settings</h2>
    
    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'access' }"
          href="#"
          @click.prevent="activeTab = 'access'"
        >
          Access Control
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'server' }"
          href="#"
          @click.prevent="activeTab = 'server'"
        >
          Server Info
        </a>
      </li>
    </ul>

    <!-- Access Control Tab -->
    <div v-if="activeTab === 'access'" class="tab-pane active">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="h5 mb-0">Access Control List</h3>
        <button class="btn btn-primary" @click="showAddModal = true">
          New MQTT Blocker
        </button>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th>Username</th>
              <th>Password</th>
              <th>IP Whitelist</th>
              <th>Description</th>
              <th>Number of Topics</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="blocker in messageBlockers" :key="blocker.id">
              <tr>
                <td>
                  <button 
                    class="btn btn-sm btn-link"
                    @click="toggleExpand(blocker.id)"
                  >
                    <i 
                      class="bi"
                      :class="expanded.includes(blocker.id) ? 'bi-chevron-down' : 'bi-chevron-right'"
                    ></i>
                  </button>
                </td>
                <td>{{ blocker.username }}</td>
                <td>•••••••••</td>
                <td>{{ blocker.ipWhitelist }}</td>
                <td>{{ blocker.description }}</td>
                <td>{{ blocker.numberOfTopics }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="editBlocker(blocker)"
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteBlocker(blocker.id)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <!-- Topics Sub-list -->
              <tr v-if="expanded.includes(blocker.id)">
                <td colspan="7" class="p-0">
                  <div class="bg-light p-3">
                    <table class="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Topic</th>
                          <th>Description</th>
                          <th>Permissions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="topic in blocker.topics" :key="topic.id">
                          <td>{{ topic.name }}</td>
                          <td>{{ topic.description }}</td>
                          <td>{{ topic.permissions }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Server Info Tab -->
    <div v-if="activeTab === 'server'" class="tab-pane active">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Server Configuration Information</th>
              <th>Configuration Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="config in serverConfigs" :key="config.id">
              <td>{{ config.name }}</td>
              <td>{{ config.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal || showEditModal }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showEditModal ? 'Edit MQTT Blocker' : 'New MQTT Blocker' }}</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Username</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="currentBlocker.username"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control"
                    v-model="currentBlocker.password"
                    required
                  />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">IP Whitelist</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="currentBlocker.ipWhitelist"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea 
                  class="form-control"
                  v-model="currentBlocker.description"
                  rows="2"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Number of Topics</label>
                <input 
                  type="number" 
                  class="form-control"
                  v-model="currentBlocker.numberOfTopics"
                  min="1"
                  required
                />
              </div>

              <!-- Topics Section -->
              <div class="mb-3">
                <label class="form-label">Topics</label>
                <div v-for="(topic, index) in currentBlocker.topics" :key="index" class="border rounded p-3 mb-3">
                  <div class="mb-3">
                    <label class="form-label">Topic Name</label>
                    <input 
                      type="text" 
                      class="form-control"
                      v-model="topic.name"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description</label>
                    <input 
                      type="text" 
                      class="form-control"
                      v-model="topic.description"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Permissions</label>
                    <select 
                      class="form-select"
                      v-model="topic.permissions"
                      required
                    >
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                      <option value="read,write">Read/Write</option>
                    </select>
                  </div>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-danger"
                    @click="removeTopic(index)"
                  >
                    Remove Topic
                  </button>
                </div>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-primary"
                  @click="addTopic"
                >
                  Add Topic
                </button>
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
                  {{ showEditModal ? 'Save Changes' : 'Create' }}
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
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface Topic {
  id?: number;
  name: string;
  description: string;
  permissions: string;
}

interface MessageBlocker {
  id: number;
  username: string;
  password: string;
  ipWhitelist: string;
  description: string;
  numberOfTopics: number;
  topics: Topic[];
}

interface ServerConfig {
  id: number;
  name: string;
  value: string;
}

const activeTab = ref<'access' | 'server'>('access');
const expanded = ref<number[]>([]);
const messageBlockers = ref<MessageBlocker[]>([]);
const serverConfigs = ref<ServerConfig[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const currentBlocker = ref<Partial<MessageBlocker>>({
  topics: []
});

const loadData = async () => {
  try {
    const [blockersResponse, configsResponse] = await Promise.all([
      axios.get('http://localhost:3005/messageBlockers'),
      axios.get('http://localhost:3005/serverConfigs')
    ]);
    messageBlockers.value = blockersResponse.data;
    serverConfigs.value = configsResponse.data;
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

onMounted(() => {
  loadData();
});

const toggleExpand = (id: number) => {
  const index = expanded.value.indexOf(id);
  if (index === -1) {
    expanded.value.push(id);
  } else {
    expanded.value.splice(index, 1);
  }
};

const addTopic = () => {
  if (!currentBlocker.value.topics) {
    currentBlocker.value.topics = [];
  }
  currentBlocker.value.topics.push({
    name: '',
    description: '',
    permissions: 'read'
  });
};

const removeTopic = (index: number) => {
  if (currentBlocker.value.topics) {
    currentBlocker.value.topics.splice(index, 1);
  }
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  currentBlocker.value = {
    topics: []
  };
};

const editBlocker = (blocker: MessageBlocker) => {
  currentBlocker.value = { ...blocker };
  showEditModal.value = true;
};

const deleteBlocker = async (id: number) => {
  if (confirm('Are you sure you want to delete this MQTT blocker?')) {
    try {
      await axios.delete(`http://localhost:3005/messageBlockers/${id}`);
      await loadData();
    } catch (error) {
      console.error('Error deleting blocker:', error);
    }
  }
};

const handleSubmit = async () => {
  try {
    if (showEditModal.value) {
      await axios.put(`http://localhost:3005/messageBlockers/${currentBlocker.value.id}`, currentBlocker.value);
    } else {
      await axios.post('http://localhost:3005/messageBlockers', {
        ...currentBlocker.value,
        numberOfTopics: currentBlocker.value.topics?.length || 0
      });
    }
    await loadData();
    closeModals();
  } catch (error) {
    console.error('Error saving blocker:', error);
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.nav-tabs .nav-link {
  cursor: pointer;
}

.btn-link {
  padding: 0;
  color: inherit;
}

.table-sm td {
  padding: 0.3rem;
}
</style>