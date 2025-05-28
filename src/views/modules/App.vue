<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>アプリ管理</h2>
      <div class="d-flex gap-3">
        <div class="input-group" style="width: 300px;">
          <input 
            type="text" 
            class="form-control" 
            v-model="searchQuery"
            placeholder="アプリ名または更新者で検索..."
          />
          <button 
            class="btn btn-outline-secondary" 
            type="button"
            @click="clearSearch"
          >
            クリア
          </button>
        </div>
        <button 
          class="btn btn-outline-secondary" 
          @click="toggleView"
          title="表示切り替え"
        >
          <i class="bi" :class="viewMode === 'list' ? 'bi-grid' : 'bi-list'"></i>
        </button>
        <button class="btn btn-primary" @click="showAddModal = true">新規アプリ</button>
      </div>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th @click="sortBy('name')" style="cursor: pointer">
              アプリ名
              <i v-if="sortKey === 'name'" :class="getSortIcon()"></i>
            </th>
            <th @click="sortBy('updatedAt')" style="cursor: pointer">
              更新日時
              <i v-if="sortKey === 'updatedAt'" :class="getSortIcon()"></i>
            </th>
            <th @click="sortBy('updatedBy')" style="cursor: pointer">
              更新者
              <i v-if="sortKey === 'updatedBy'" :class="getSortIcon()"></i>
            </th>
            <th @click="sortBy('engineVersion')" style="cursor: pointer">
              エンジンバージョン
              <i v-if="sortKey === 'engineVersion'" :class="getSortIcon()"></i>
            </th>
            <th @click="sortBy('performance')" style="cursor: pointer">
              パフォーマンス
              <i v-if="sortKey === 'performance'" :class="getSortIcon()"></i>
            </th>
            <th @click="sortBy('status')" style="cursor: pointer">
              ステータス
              <i v-if="sortKey === 'status'" :class="getSortIcon()"></i>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in paginatedApps" :key="app.id">
            <td>{{ app.name }}</td>
            <td>{{ formatDate(app.updatedAt) }}</td>
            <td>{{ app.updatedBy }}</td>
            <td>{{ app.engineVersion }}</td>
            <td>
              <span :class="getPerformanceBadgeClass(app.performance)">
                {{ app.performance }}
              </span>
            </td>
            <td>
              <span :class="getStatusBadgeClass(app.status)">
                {{ app.status }}
              </span>
            </td>
            <td>
              <button 
                class="btn btn-sm btn-outline-primary me-2"
                @click="editApp(app)"
              >
                変更
              </button>
              <button 
                class="btn btn-sm btn-outline-danger"
                @click="deleteApp(app.id)"
              >
                削除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Grid View -->
    <div v-else class="row g-4">
      <div v-for="app in paginatedApps" :key="app.id" class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title mb-3">{{ app.name }}</h5>
            <div class="card-text">
              <div class="mb-2">
                <small class="text-muted">更新日時:</small> {{ formatDate(app.updatedAt) }}<br>
                <small class="text-muted">更新者:</small> {{ app.updatedBy }}<br>
                <span :class="getStatusBadgeClass(app.status)" class="me-2">
                  {{ app.status }}
                </span>
              </div>
              <div>
                <small class="text-muted">エンジンバージョン:</small> {{ app.engineVersion }}<br>
                <small class="text-muted">パフォーマンス:</small>
                <span :class="getPerformanceBadgeClass(app.performance)" class="ms-1">
                  {{ app.performance }}
                </span>
              </div>
            </div>
            <div class="mt-3">
              <button 
                class="btn btn-sm btn-outline-primary me-2"
                @click="editApp(app)"
              >
                変更
              </button>
              <button 
                class="btn btn-sm btn-outline-danger"
                @click="deleteApp(app.id)"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="d-flex justify-content-end align-items-center mt-3 gap-4">
      <div class="text-muted">
        総計 {{ filteredApps.length }}件
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface App {
  id: number;
  name: string;
  updatedAt: string;
  updatedBy: string;
  engineVersion: string;
  performance: 'ON' | 'OFF';
  status: '実行中' | '停止済み' | '異常停止';
}

const viewMode = ref<'list' | 'grid'>('list');
const apps = ref<App[]>([
  {
    id: 1,
    name: 'サンプルアプリ1',
    updatedAt: '2024-03-20T10:30:00Z',
    updatedBy: '山田太郎',
    engineVersion: '1.1.0',
    performance: 'ON',
    status: '実行中'
  },
  {
    id: 2,
    name: 'サンプルアプリ2',
    updatedAt: '2024-03-19T15:45:00Z',
    updatedBy: '鈴木一郎',
    engineVersion: '1.0.0',
    performance: 'OFF',
    status: '停止済み'
  },
  {
    id: 3,
    name: 'サンプルアプリ3',
    updatedAt: '2024-03-18T08:15:00Z',
    updatedBy: '佐藤花子',
    engineVersion: '1.1.0',
    performance: 'ON',
    status: '異常停止'
  },
  // Add more sample data for pagination testing
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 4,
    name: `サンプルアプリ${i + 4}`,
    updatedAt: new Date().toISOString(),
    updatedBy: '山田太郎',
    engineVersion: '1.1.0',
    performance: i % 2 === 0 ? 'ON' : 'OFF' as 'ON' | 'OFF',
    status: '実行中' as '実行中' | '停止済み' | '異常停止'
  }))
]);

// Sorting
const sortKey = ref<keyof App | ''>('');
const sortOrder = ref<'asc' | 'desc'>('asc');

const sortBy = (key: keyof App) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const getSortIcon = () => {
  return sortOrder.value === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill';
};

// Search functionality
const searchQuery = ref('');

const filteredApps = computed(() => {
  let result = [...apps.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(app => 
      app.name.toLowerCase().includes(query) ||
      app.updatedBy.toLowerCase().includes(query)
    );
  }
  
  // Apply sorting
  if (sortKey.value) {
    result.sort((a, b) => {
      const aValue = a[sortKey.value as keyof App];
      const bValue = b[sortKey.value as keyof App];
      
      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  return result;
});

const clearSearch = () => {
  searchQuery.value = '';
};

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [10, 20, 30, 40, 50];

const totalPages = computed(() => 
  Math.ceil(filteredApps.value.length / pageSize.value)
);

const paginatedApps = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredApps.value.slice(start, end);
});

// Watch for changes that should reset pagination
watch([pageSize, searchQuery, sortKey, sortOrder], () => {
  currentPage.value = 1;
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('ja-JP');
};

const getPerformanceBadgeClass = (performance: string) => {
  return performance === 'ON' 
    ? 'badge bg-success' 
    : 'badge bg-secondary';
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    '実行中': 'badge bg-success',
    '停止済み': 'badge bg-secondary',
    '異常停止': 'badge bg-danger'
  };
  return classes[status as keyof typeof classes];
};

const toggleView = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list';
};

const editApp = (app: App) => {
  console.log('Edit app:', app);
  // Implement edit functionality
};

const deleteApp = (id: number) => {
  if (confirm('このアプリを削除してもよろしいですか？')) {
    apps.value = apps.value.filter(app => app.id !== id);
  }
};
</script>

<style scoped>
.badge {
  font-size: 0.875em;
}

th {
  white-space: nowrap;
}

th i {
  margin-left: 0.5rem;
  font-size: 0.75rem;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.card-title {
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card .badge {
  display: inline-block;
  margin-top: 0.25rem;
}
</style>