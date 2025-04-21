<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>管理設定</h2>
      <button class="btn btn-primary" @click="showAddModal = true">Add New User</button>
    </div>

    <!-- Users List -->
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>ユーザー名</th>
            <th>メールアドレス</th>
            <th>管理者分類</th>
            <th>ワークスペース</th>
            <th>ステータス</th>
            <th>最終ログイン</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span class="badge bg-info me-1" v-for="workspace in user.workspaces" :key="workspace">
                {{ workspace }}
              </span>
            </td>
            <td>
              <span :class="getStatusBadgeClass(user.status)">
                {{ user.status }}
              </span>
            </td>
            <td><p>{{ formatDate(user?.lastLogin) }}</p></td>
            <td>
              <button 
                class="btn btn-sm btn-outline-primary me-2"
                @click="editUser(user)"
              >
                Edit
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

    <!-- Add/Edit Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal || showEditModal }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showEditModal ? 'Edit User' : 'Add New User' }}</h5>
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
                  <label class="form-label">ユーザー名</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="currentUser.username"
                    required
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">メールアドレス</label>
                  <input 
                    type="email" 
                    class="form-control"
                    v-model="currentUser.email"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">管理者分類</label>
                  <select 
                    class="form-select"
                    v-model="currentUser.role"
                    required
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="User">User</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">ステータス</label>
                <select 
                  class="form-select"
                  v-model="currentUser.status"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
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
                  {{ showEditModal ? 'Save Changes' : 'Add User' }}
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

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  workspaces: string[];
  status: string;
  lastLogin?:string;
}

const users = ref<User[]>([
  {
    id: 1,
    username: 'admin',
    email: 'john@example.com',
    role: 'Administrator',
    workspaces: ['Workspace 1', 'Workspace 2', 'Workspace 3'],
    status: 'Active',
    lastLogin: "2025-04-21T09:43:12.118Z"
  },
  {
    id: 2,
    username: 'manager1',
    email: 'jane@example.com',
    role: 'Manager',
    workspaces: ['Workspace 1', 'Workspace 2'],
    status: 'Active',
    lastLogin: "2025-04-21T09:43:12.118Z"
  }
]);

const showAddModal = ref(false);
const showEditModal = ref(false);
const currentUser = ref<Partial<User>>({
  workspaces: []
});

const getStatusBadgeClass = (status: string) => {
  const classes = {
    Active: 'badge bg-success',
    Inactive: 'badge bg-secondary',
    Pending: 'badge bg-warning text-dark'
  };
  return classes[status as keyof typeof classes] || 'badge bg-secondary';
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  currentUser.value = { workspaces: [] };
};

const editUser = (user: User) => {
  currentUser.value = { ...user };
  showEditModal.value = true;
};

const deleteUser = (id: number) => {
  if (confirm('Are you sure you want to delete this user?')) {
    users.value = users.value.filter(user => user.id !== id);
  }
};

const handleSubmit = () => {
  if (showEditModal.value) {
    const index = users.value.findIndex(u => u.id === currentUser.value.id);
    if (index !== -1) {
      users.value[index] = {
        ...currentUser.value as User
      };
    }
  } else {
    users.value.push({
      id: Math.max(0, ...users.value.map(u => u.id)) + 1,
      username: currentUser.value.username!,
      email: currentUser.value.email!,
      role: currentUser.value.role!,
      workspaces: currentUser.value.workspaces || [],
      status: currentUser.value.status!
    });
  }
  closeModals();
};
const formatDate = (date: string | undefined) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>