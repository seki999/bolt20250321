<template>
  <div class="container">
    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'tenant' }"
          href="#"
          @click.prevent="activeTab = 'tenant'"
        >
          Tenant Management
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'workspace' }"
          href="#"
          @click.prevent="activeTab = 'workspace'"
        >
          Workspace Management
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'user' }"
          href="#"
          @click.prevent="activeTab = 'user'"
        >
          User Management
        </a>
      </li>
    </ul>

    <!-- Tenant Management Tab -->
    <div v-if="activeTab === 'tenant'" class="tab-pane active">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Tenant Management</h2>
        <button class="btn btn-primary" @click="showAddModal = true">Add New Tenant</button>
      </div>

      <!-- Tenants List -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th>Tenant Name</th>
              <th>Company Name</th>
              <th>Created Date</th>
              <th>Created By</th>
              <th>Workspaces</th>
              <th>Users</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="tenant in tenants" :key="tenant.id">
              <tr>
                <td>
                  <button 
                    class="btn btn-sm btn-link"
                    @click="toggleExpand(tenant.id)"
                  >
                    <i 
                      class="bi"
                      :class="expanded.includes(tenant.id) ? 'bi-chevron-down' : 'bi-chevron-right'"
                    ></i>
                  </button>
                </td>
                <td>{{ tenant.tenantName }}</td>
                <td>{{ tenant.companyName }}</td>
                <td>{{ formatDate(tenant.createdDate) }}</td>
                <td>{{ tenant.createdBy }}</td>
                <td>
                  {{ tenant.workspaceCount }} / {{ tenant.workspaceLimit }}
                </td>
                <td>
                  {{ tenant.userCount }} / {{ tenant.userLimit }}
                </td>
                <td>
                  <span :class="getStatusBadgeClass(tenant.status)">
                    {{ tenant.status }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-warning me-2"
                    @click="toggleTenantStatus(tenant)"
                    :title="tenant.status === 'Active' ? 'Stop' : 'Start'"
                  >
                    {{ tenant.status === 'Active' ? 'Stop' : 'Start' }}
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="editTenant(tenant)"
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteTenant(tenant.id)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <!-- Logical Workspaces Sub-list -->
              <tr v-if="expanded.includes(tenant.id)">
                <td colspan="9" class="p-0">
                  <div class="bg-light p-3">
                    <table class="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Logical Workspace Name</th>
                          <th>Type</th>
                          <th>Created Date</th>
                          <th>Created By</th>
                          <th>Max Simultaneous Apps</th>
                          <th>Running Apps Count</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="workspace in tenant.logicalWorkspaces" :key="workspace.id">
                          <td>{{ workspace.name }}</td>
                          <td>{{ workspace.type }}</td>
                          <td>{{ formatDate(workspace.createdDate) }}</td>
                          <td>{{ workspace.createdBy }}</td>
                          <td>{{ workspace.maxSimultaneousApps }}</td>
                          <td>{{ workspace.runningAppsCount }}</td>
                          <td>
                            <span :class="getStatusBadgeClass(workspace.status)">
                              {{ workspace.status }}
                            </span>
                          </td>
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

    <!-- Workspace Management Tab -->
    <div v-if="activeTab === 'workspace'" class="tab-pane active">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Physical Workspace Management</h2>
        <button class="btn btn-primary" @click="showAddWorkspaceModal = true">
          Add Physical Workspace
        </button>
      </div>

      <!-- Physical Workspaces List -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th>Physical Workspace Name</th>
              <th>Created Date</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="workspace in physicalWorkspaces" :key="workspace.id">
              <tr>
                <td>
                  <button 
                    class="btn btn-sm btn-link"
                    @click="toggleWorkspaceExpand(workspace.id)"
                  >
                    <i 
                      class="bi"
                      :class="expandedWorkspaces.includes(workspace.id) ? 'bi-chevron-down' : 'bi-chevron-right'"
                    ></i>
                  </button>
                </td>
                <td>{{ workspace.name }}</td>
                <td>{{ formatDate(workspace.createdDate) }}</td>
                <td>{{ workspace.createdBy }}</td>
                <td>
                  <span :class="getStatusBadgeClass(workspace.status)">
                    {{ workspace.status }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="editWorkspace(workspace)"
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteWorkspace(workspace.id)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <!-- Logical Workspaces Sub-list -->
              <tr v-if="expandedWorkspaces.includes(workspace.id)">
                <td colspan="6" class="p-0">
                  <div class="bg-light p-3">
                    <div class="d-flex justify-content-between mb-3">
                      <h6 class="mb-0">Logical Workspaces</h6>
                      <button 
                        class="btn btn-sm btn-outline-primary"
                        @click="addLogicalWorkspace(workspace.id)"
                      >
                        Add Logical Workspace
                      </button>
                    </div>
                    <table class="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Logical Workspace Name</th>
                          <th>Belonging Tenant</th>
                          <th>Created Date</th>
                          <th>Created By</th>
                          <th>Max Simultaneous Apps</th>
                          <th>Running Apps Count</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="logical in workspace.logicalWorkspaces" :key="logical.id">
                          <td>{{ logical.name }}</td>
                          <td>{{ logical.belongingTenant }}</td>
                          <td>{{ formatDate(logical.createdDate) }}</td>
                          <td>{{ logical.createdBy }}</td>
                          <td>{{ logical.maxSimultaneousApps }}</td>
                          <td>{{ logical.runningAppsCount }}</td>
                          <td>
                            <span :class="getStatusBadgeClass(logical.status)">
                              {{ logical.status }}
                            </span>
                          </td>
                          <td>
                            <button 
                              class="btn btn-sm btn-outline-primary me-1"
                              @click="editLogicalWorkspace(workspace.id, logical)"
                            >
                              Edit
                            </button>
                            <button 
                              class="btn btn-sm btn-outline-danger"
                              @click="deleteLogicalWorkspace(workspace.id, logical.id)"
                            >
                              Delete
                            </button>
                          </td>
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

    <!-- User Management Tab -->
    <div v-if="activeTab === 'user'" class="tab-pane active">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
      </div>

      <!-- Users List -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email Address</th>
              <th>Number of Tenants</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.tenantCount }}</td>
              <td>
                <span :class="getStatusBadgeClass(user.status)">
                  {{ user.status }}
                </span>
              </td>
              <td>{{ formatDate(user.lastLogin) }}</td>
              <td>
                <button 
                  class="btn btn-sm btn-outline-primary me-2"
                  @click="reissueUserCredentials(user.id)"
                >
                  Reissue
                </button>
                <button 
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteUser(user.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Physical Workspace Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddWorkspaceModal || showEditWorkspaceModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ showEditWorkspaceModal ? 'Edit Physical Workspace' : 'Add Physical Workspace' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeWorkspaceModals"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleWorkspaceSubmit">
              <div class="mb-3">
                <label class="form-label">Physical Workspace Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="currentWorkspace.name"
                  required
                />
              </div>
              <div class="modal-footer">
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  @click="closeWorkspaceModals"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                >
                  {{ showEditWorkspaceModal ? 'Save Changes' : 'Add Workspace' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Logical Workspace Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddLogicalModal || showEditLogicalModal }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ showEditLogicalModal ? 'Edit Logical Workspace' : 'Add Logical Workspace' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeLogicalModals"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleLogicalWorkspaceSubmit">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Logical Workspace Name</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="currentLogicalWorkspace.name"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Belonging Tenant</label>
                  <select 
                    class="form-select"
                    v-model="currentLogicalWorkspace.belongingTenant"
                    required
                  >
                    <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.tenantName">
                      {{ tenant.tenantName }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Max Simultaneous Apps</label>
                  <input 
                    type="number" 
                    class="form-control"
                    v-model="currentLogicalWorkspace.maxSimultaneousApps"
                    min="1"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Status</label>
                  <select 
                    class="form-select"
                    v-model="currentLogicalWorkspace.status"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  @click="closeLogicalModals"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                >
                  {{ showEditLogicalModal ? 'Save Changes' : 'Add Logical Workspace' }}
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
      v-if="showAddModal || showEditModal || showAddWorkspaceModal || showEditWorkspaceModal || showAddLogicalModal || showEditLogicalModal"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  tenantCount: number;
  status: string;
  lastLogin: string;
}

interface Tenant {
  id: number;
  tenantName: string;
  companyName: string;
  createdDate: string;
  createdBy: string;
  workspaceCount: number;
  workspaceLimit: number;
  userCount: number;
  userLimit: number;
  status: string;
  logicalWorkspaces: LogicalWorkspace[];
}

interface LogicalWorkspace {
  id: number;
  name: string;
  belongingTenant: string;
  createdDate: string;
  createdBy: string;
  maxSimultaneousApps: number;
  runningAppsCount: number;
  status: string;
}

interface PhysicalWorkspace {
  id: number;
  name: string;
  createdDate: string;
  createdBy: string;
  status: string;
  logicalWorkspaces: LogicalWorkspace[];
}

const activeTab = ref<'tenant' | 'workspace' | 'user'>('tenant');
const users = ref<User[]>([]);
const tenants = ref<Tenant[]>([]);
const physicalWorkspaces = ref<PhysicalWorkspace[]>([]);
const expanded = ref<number[]>([]);
const expandedWorkspaces = ref<number[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showAddWorkspaceModal = ref(false);
const showEditWorkspaceModal = ref(false);
const showAddLogicalModal = ref(false);
const showEditLogicalModal = ref(false);
const currentWorkspace = ref<Partial<PhysicalWorkspace>>({});
const currentLogicalWorkspace = ref<Partial<LogicalWorkspace>>({});
const selectedPhysicalWorkspaceId = ref<number | null>(null);

const loadUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3001/users');
    users.value = response.data;
  } catch (error) {
    console.error('Error loading users:', error);
  }
};

const loadTenants = async () => {
  try {
    const response = await axios.get('http://localhost:3001/tenants');
    tenants.value = response.data;
  } catch (error) {
    console.error('Error loading tenants:', error);
  }
};

const loadWorkspaces = async () => {
  try {
    const response = await axios.get('http://localhost:3001/physicalWorkspaces');
    physicalWorkspaces.value = response.data;
  } catch (error) {
    console.error('Error loading workspaces:', error);
  }
};

onMounted(() => {
  loadUsers();
  loadTenants();
  loadWorkspaces();
});

const toggleExpand = (id: number) => {
  const index = expanded.value.indexOf(id);
  if (index === -1) {
    expanded.value.push(id);
  } else {
    expanded.value.splice(index, 1);
  }
};

const toggleWorkspaceExpand = (id: number) => {
  const index = expandedWorkspaces.value.indexOf(id);
  if (index === -1) {
    expandedWorkspaces.value.push(id);
  } else {
    expandedWorkspaces.value.splice(index, 1);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    Active: 'badge bg-success',
    Inactive: 'badge bg-secondary',
    Suspended: 'badge bg-warning text-dark'
  };
  return classes[status as keyof typeof classes] || 'badge bg-secondary';
};

const closeWorkspaceModals = () => {
  showAddWorkspaceModal.value = false;
  showEditWorkspaceModal.value = false;
  currentWorkspace.value = {};
};

const closeLogicalModals = () => {
  showAddLogicalModal.value = false;
  showEditLogicalModal.value = false;
  currentLogicalWorkspace.value = {};
  selectedPhysicalWorkspaceId.value = null;
};

const editWorkspace = (workspace: PhysicalWorkspace) => {
  currentWorkspace.value = { ...workspace };
  showEditWorkspaceModal.value = true;
};

const deleteWorkspace = async (id: number) => {
  if (confirm('Are you sure you want to delete this physical workspace?')) {
    try {
      await axios.delete(`http://localhost:3001/physicalWorkspaces/${id}`);
      await loadWorkspaces();
    } catch (error) {
      console.error('Error deleting workspace:', error);
    }
  }
};

const deleteUser = async (id: number) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await axios.delete(`http://localhost:3001/users/${id}`);
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
};

const reissueUserCredentials = async (id: number) => {
  try {
    // Simulate reissuing credentials
    alert('New credentials have been sent to the user\'s email address.');
  } catch (error) {
    console.error('Error reissuing credentials:', error);
  }
};

const addLogicalWorkspace = (physicalWorkspaceId: number) => {
  selectedPhysicalWorkspaceId.value = physicalWorkspaceId;
  currentLogicalWorkspace.value = {
    maxSimultaneousApps: 1,
    runningAppsCount: 0,
    status: 'Active'
  };
  showAddLogicalModal.value = true;
};

const editLogicalWorkspace = (physicalWorkspaceId: number, logical: LogicalWorkspace) => {
  selectedPhysicalWorkspaceId.value = physicalWorkspaceId;
  currentLogicalWorkspace.value = { ...logical };
  showEditLogicalModal.value = true;
};

const deleteLogicalWorkspace = async (physicalWorkspaceId: number, logicalWorkspaceId: number) => {
  if (confirm('Are you sure you want to delete this logical workspace?')) {
    try {
      const workspace = physicalWorkspaces.value.find(w => w.id === physicalWorkspaceId);
      if (workspace) {
        workspace.logicalWorkspaces = workspace.logicalWorkspaces.filter(l => l.id !== logicalWorkspaceId);
        await axios.put(`http://localhost:3001/physicalWorkspaces/${physicalWorkspaceId}`, workspace);
        await loadWorkspaces();
      }
    } catch (error) {
      console.error('Error deleting logical workspace:', error);
    }
  }
};

const handleWorkspaceSubmit = async () => {
  try {
    if (showEditWorkspaceModal.value) {
      await axios.put(`http://localhost:3001/physicalWorkspaces/${currentWorkspace.value.id}`, currentWorkspace.value);
    } else {
      await axios.post('http://localhost:3001/physicalWorkspaces', {
        ...currentWorkspace.value,
        createdDate: new Date().toISOString(),
        createdBy: 'admin',
        status: 'Active',
        logicalWorkspaces: []
      });
    }
    await loadWorkspaces();
    closeWorkspaceModals();
  } catch (error) {
    console.error('Error saving workspace:', error);
  }
};

const handleLogicalWorkspaceSubmit = async () => {
  try {
    const workspace = physicalWorkspaces.value.find(w => w.id === selectedPhysicalWorkspaceId.value);
    if (workspace) {
      if (showEditLogicalModal.value) {
        const index = workspace.logicalWorkspaces.findIndex(l => l.id === currentLogicalWorkspace.value.id);
        if (index !== -1) {
          workspace.logicalWorkspaces[index] = {
            ...currentLogicalWorkspace.value as LogicalWorkspace
          };
        }
      } else {
        workspace.logicalWorkspaces.push({
          id: Math.max(0, ...workspace.logicalWorkspaces.map(l => l.id)) + 1,
          name: currentLogicalWorkspace.value.name!,
          belongingTenant: currentLogicalWorkspace.value.belongingTenant!,
          createdDate: new Date().toISOString(),
          createdBy: 'admin',
          maxSimultaneousApps: currentLogicalWorkspace.value.maxSimultaneousApps!,
          runningAppsCount: 0,
          status: currentLogicalWorkspace.value.status!
        });
      }
      await axios.put(`http://localhost:3001/physicalWorkspaces/${workspace.id}`, workspace);
      await loadWorkspaces();
      closeLogicalModals();
    }
  } catch (error) {
    console.error('Error saving logical workspace:', error);
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.badge {
  font-size: 0.875em;
}

.btn-link {
  padding: 0;
  color: inherit;
}

.table-sm td {
  padding: 0.3rem;
}

.nav-tabs .nav-link {
  cursor: pointer;
}
</style>