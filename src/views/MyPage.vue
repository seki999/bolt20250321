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
              @click="showDropdown = !showDropdown"
            >
              {{ currentWorkspaceLabel }}
            </button>
            <ul
              class="dropdown-menu"
              :class="{ show: showDropdown }"
              aria-labelledby="workspaceDropdown"
              style="max-height:300px;overflow:auto;"
            >
              <li v-for="tenant in tenants" :key="tenant.tenantName">
                <h6 class="dropdown-header">{{ tenant.tenantName }}</h6>
                <ul class="list-unstyled mb-1">
                  <li
                    v-for="ws in tenant.logicalWorkspaces"
                    :key="ws.workspaceId"
                  >
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="selectWorkspace(tenant.tenantName, ws.workspaceName,tenant.tenantId, ws.workspaceId)"
                    >
                      {{ ws.workspaceName }}
                    </a>
                  </li>
                </ul>
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
        <h5>{{ user?.username }}</h5>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import axios from 'axios';

const router = useRouter();
const userStore = useUserStore();

const showUserInfo = ref(false);
const user = computed(() => userStore.user);

const menuItems = [
  { name: 'App', path: '/mypage/app' },
  { name: 'Table', path: '/mypage/table' },
  { name: 'Endpoint', path: '/mypage/endpoint' },
  { name: 'MessageBlocker', path: '/mypage/message-blocker' },
  { name: 'API Key', path: '/mypage/api-key' },
  { name: 'File Management', path: '/mypage/file-management' },
  { name: 'Migration', path: '/mypage/migration' }
];

// tenantName -> logicalWorkspaces
const tenants = ref<
  {
    tenantId: number,
    tenantName: string,
    logicalWorkspaces: {
      workspaceId: number,
      workspaceName: string,
    }[]
  }[]
>([]);
const selectedWorkspace = ref('');
const showDropdown = ref(false);

const currentWorkspaceLabel = computed(() => {
  if (!selectedWorkspace.value) return 'ワークスペースを選択';
  const [tenantName, wsName] = selectedWorkspace.value.split('::');
  return `${tenantName} / ${wsName}`;
});

onMounted(async () => {
  const res = await axios.get('http://localhost:3003/tenants');
  tenants.value = res.data.map((tenant: any) => ({
    tenantId: tenant.tenantId,
    tenantName: tenant.tenantName,
    logicalWorkspaces: tenant.logicalWorkspaces.map((ws: any) => ({
      workspaceId: ws.workspaceId,
      workspaceName: ws.workspaceName
    }))
  }));

  const workspaceList = tenants.value.flatMap((tenant: any) =>
  tenant.logicalWorkspaces.map((ws: any) => ({
    tenantsId: tenant.id,
    tenantName: tenant.tenantName,
    logicalWorkspaceId: ws.id,
    name: ws.name
  }))
);
//console.log(JSON.stringify(workspaceList, null, '\t'));
userStore.setWorkspaces(workspaceList);
//userStore.setWorkspace()

  if (
    workspaceList.length > 0 &&
    workspaceList[0].logicalWorkspaces &&
    workspaceList[0].logicalWorkspaces.length > 0
  ) {
    const tenantId = workspaceList[0].id; // 或 workspaceList[0].tenantsId
    const workspaceId = workspaceList[0].logicalWorkspaces[0].id; // 或 logicalWorkspaceId
    userStore.currentTenantIdWorkspaceId = `${tenantId}::${workspaceId}`;
  }
});

watch(selectedWorkspace, (val) => {
  //alert("watch selectedWorkspace is  "+ val)
  userStore.currentWorkspace = val;
});

const toggleUserInfo = () => {
  showUserInfo.value = !showUserInfo.value;
};

const selectWorkspace = (tenantName: string, workspaceName: string,tenantId: number, workspaceId: number) => {
  selectedWorkspace.value = `${tenantName}::${workspaceName}`;
  userStore.currentTenantIdWorkspaceId = `${tenantId}::${workspaceId}`;
  //alert("selectWorkspace currentTenantIdWorkspaceId is  "+ userStore.currentTenantIdWorkspaceId)
  showDropdown.value = false;
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