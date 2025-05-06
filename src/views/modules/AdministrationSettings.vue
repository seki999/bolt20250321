<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>管理設定</h2>
      <button class="btn btn-primary" @click="showAddModal = true">Add New User</button>
    </div>

    <!-- Search Bar -->
    <div class="mb-4 d-flex justify-content-end">
      <div class="input-group" style="width: 33.33%;">
        <input 
          type="text" 
          class="form-control" 
          v-model="searchQuery"
          placeholder="ユーザー名またはメールアドレスで検索..."
        />
        <button 
          class="btn btn-outline-secondary" 
          type="button"
          @click="clearSearch"
        >
          クリア
        </button>
      </div>
    </div>

    <!-- Users List -->
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>ユーザー名</th>
            <th>メールアドレス</th>
            <th>管理者分類</th>
            <th>ステータス</th>
            <th>最終ログイン</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
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
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string;
}

const users = ref<User[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const currentUser = ref<Partial<User>>({});
const searchQuery = ref('');

const loadUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3001/users');
    users.value = response.data;
  } catch (error) {
    console.error('Error loading users:', error);
  }
};

onMounted(() => {
  loadUsers();
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
});

const getStatusBadgeClass = (status: string) => {
  const classes = {
    Active: 'badge bg-success',
    Inactive: 'badge bg-secondary',
    Pending: 'badge bg-warning text-dark'
  };
  return classes[status as keyof typeof classes] || 'badge bg-secondary';
};

const clearSearch = () => {
  searchQuery.value = '';
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  currentUser.value = {};
};

const editUser = (user: User) => {
  currentUser.value = { ...user };
  showEditModal.value = true;
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

const handleSubmit = async () => {
  try {
    if (showEditModal.value) {
      await axios.put(`http://localhost:3001/users/${currentUser.value.id}`, currentUser.value);
    } else {
      await axios.post('http://localhost:3001/users', {
        ...currentUser.value,
        lastLogin: new Date().toISOString()
      });
    }
    await loadUsers();
    closeModals();
  } catch (error) {
    console.error('Error saving user:', error);
  }
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