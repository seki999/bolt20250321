import { defineStore } from 'pinia';

interface UserState {
  user: {
    username: string;
    email: string;
    company: string;
    role: string;
    lastLogin: string;
  } | null;
  currentWorkspace: string;
  currentTenantIdWorkspaceId: string;
  workspaces: string[];
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    currentWorkspace: '',
    currentTenantIdWorkspaceId: '',
    workspaces: []
  }),
  
  actions: {
    setUser(userData: UserState['user']) {
      this.user = userData;
    },
    setWorkspace(tenantIdWorkspaceId:string) {
      //alert(tenantIdWorkspaceId);
      this.currentTenantIdWorkspaceId = tenantIdWorkspaceId;
    },
    setWorkspaces(workspaces: string[]) {
      this.workspaces = workspaces;
    },
    logout() {
      this.user = null;
      this.currentWorkspace = '';
      this.currentTenantIdWorkspaceId
      this.workspaces = [];
      localStorage.removeItem('user');
    }
  }
});