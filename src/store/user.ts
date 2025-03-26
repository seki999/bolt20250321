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
  workspaces: string[];
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    currentWorkspace: '',
    workspaces: []
  }),
  
  actions: {
    setUser(userData: UserState['user']) {
      this.user = userData;
    },
    setWorkspace(workspace: string) {
      this.currentWorkspace = workspace;
    },
    setWorkspaces(workspaces: string[]) {
      this.workspaces = workspaces;
    },
    logout() {
      this.user = null;
      this.currentWorkspace = '';
      this.workspaces = [];
      localStorage.removeItem('user');
    }
  }
});