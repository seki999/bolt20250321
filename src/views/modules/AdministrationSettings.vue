<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>管理設定</h2>
      <button class="btn btn-primary" @click="showAddModal = true">Add New User</button>
    </div>

    <!-- Search Bar and Role Filter -->
    <div class="mb-4 d-flex justify-content-end align-items-center gap-3">
      <select 
        class="form-select" 
        style="width: 200px;"
        v-model="selectedRole"
      >
        <option value="">全ての管理者分類</option>
        <option value="システム管理者">システム管理者</option>
        <option value="業務管理者">業務管理者</option>
      </select>
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
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="getStatusBadgeClass(user.status)">
                {{ user.status }}
              </span>
            </td>
            <td>{{ formatDate(user.lastLogin) }}</td>
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

    <!-- Pagination Controls -->
    <div class="d-flex justify-content-end align-items-center mt-3 gap-4">
      <div class="text-muted">
        総計 {{ filteredUsers.length }}件
      </div>
      <div class="d-flex align-items-center gap-2">
        <button 
          class="btn btn-sm btn-outline-primary" 
          @click="currentPage--"
          :disabled="currentPage === 1"
        >
          前へ
        </button>
        <span class="mx-2">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          class="btn btn-sm btn-outline-primary" 
          @click="currentPage++"
          :disabled="currentPage === totalPages"
        >
          次へ
        </button>
        <span class="ms-3">表示件数:</span>
        <select 
          class="form-select form-select-sm" 
          style="width: 80px"
          v-model="pageSize"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
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
                    <option value="システム管理者">システム管理者</option>
                    <option value="業務管理者">業務管理者</option>
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
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const users = ref<User[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const currentUser = ref<Partial<User>>({});
const searchQuery = ref('');
const selectedRole = ref('');

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [10, 20, 30, 40, 50];

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
  let filtered = users.value;
  
  // Filter by role if selected
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value);
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

// Pagination computed properties
const totalPages = computed(() => 
  Math.ceil(filteredUsers.value.length / pageSize.value)
);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

// Watch for changes that should reset pagination
watch([searchQuery, selectedRole, pageSize], () => {
  currentPage.value = 1;
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
  selectedRole.value = '';
  currentPage.value = 1;
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
      
      // Reset to first page if current page is now empty
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value || 1;
      }
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

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>