<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>アプリ管理</h2>
      <button class="btn btn-primary" @click="showAddModal = true">新規アプリ</button>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>アプリ名</th>
            <th>更新日時</th>
            <th>更新者</th>
            <th>エンジンバージョン</th>
            <th>パフォーマンス</th>
            <th>ステータス</th>
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

    <!-- Pagination Controls -->
    <div class="d-flex justify-content-end align-items-center mt-3 gap-4">
      <div class="text-muted">
        総計 {{ apps.length }}件
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

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [10, 20, 30, 40, 50];

const totalPages = computed(() => 
  Math.ceil(apps.value.length / pageSize.value)
);

const paginatedApps = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return apps.value.slice(start, end);
});

// Watch for changes that should reset pagination
watch(pageSize, () => {
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
</style>