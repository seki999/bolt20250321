<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <nav class="sidebar d-flex flex-column">
      <div>
        <div class="workspace-selector">
          <div class="dropdown">
            <button
              class="btn btn-secondary dropdown-toggle"
              type="button"
              id="workspaceDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {{ currentWorkspace || 'Select Workspace' }}
            </button>
            <ul class="dropdown-menu" aria-labelledby="workspaceDropdown">
              <li v-for="workspace in workspaces" :key="workspace">
                <a
                  class="dropdown-item"
                  href="#"
                  @click="selectWorkspace(workspace)"
                >
                  {{ workspace }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Navigation Menu -->
        <ul class="nav flex-column">
          <li class="nav-item" v-for="item in menuItems" :key="item.path">
            <router-link
              :to="item.path"
              class="nav-link"
              active-class="active"
            >
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- User Info Button - Moved to bottom -->
      <div class="mt-auto pt-3">
        <button
          class="btn btn-outline-light w-100"
          @click="toggleUserInfo"
        >
          User Info
        </button>
      </div>
    </nav>

    <!-- User Info Popup -->
    <div v-if="showUserInfo" class="user-info-popup">
      <div class="user-details">
        <h5>{{ user?.name }}</h5>
        <p>{{ user?.email }}</p>
        <p>{{ user?.company }}</p>
        <p>{{ user?.role }}</p>
        <p>{{ formatDate(user?.lastLogin) }}</p>
      </div>
      <div class="d-flex flex-column gap-2">
        <button class="btn btn-sm btn-outline-secondary" @click="goToPersonalSettings">
          個人設定
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="goToResourceManagement">
          リソース管理
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="goToAdministrationSettings">
          管理設定
        </button>
        <button class="btn btn-sm btn-danger" @click="handleLogout">
          ログアウト
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const showUserInfo = ref(false);
const user = computed(() => userStore.user);
const currentWorkspace = computed(() => userStore.currentWorkspace);
const workspaces = computed(() => userStore.workspaces);

// Sample workspaces - replace with API call
userStore.setWorkspaces(['Workspace 1', 'Workspace 2', 'Workspace 3']);

const menuItems = [
  { name: 'App', path: '/mypage/app' },
  { name: 'Table', path: '/mypage/table' },
  { name: 'Endpoint', path: '/mypage/endpoint' },
  { name: 'MessageBlocker', path: '/mypage/message-blocker' },
  { name: 'API Key', path: '/mypage/api-key' },
  { name: 'File Management', path: '/mypage/file-management' },
  { name: 'Migration', path: '/mypage/migration' }
];

const toggleUserInfo = () => {
  showUserInfo.value = !showUserInfo.value;
};

const selectWorkspace = (workspace: string) => {
  userStore.setWorkspace(workspace);
};

const formatDate = (date: string | undefined) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

const goToPersonalSettings = () => {
  router.push('/mypage/personal-settings');
  showUserInfo.value = false;
};

const goToResourceManagement = () => {
  router.push('/mypage/resource-management');
  showUserInfo.value = false;
};

const goToAdministrationSettings = () => {
  router.push('/mypage/administration-settings');
  showUserInfo.value = false;
};
</script>