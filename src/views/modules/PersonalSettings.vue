<template>
  <div class="container">
    <!-- Profile Tag -->
    <div class="mb-3">
      <h5 class="text-muted">プロフィール</h5>
    </div>

    <!-- Basic Info Tag -->
    <div class="mb-3">
      <h6 class="text-muted">基本情報</h6>
    </div>

    <!-- User Info Box -->
    <div class="card mb-4">
      <div class="card-body">
        <!-- Username and Email Row -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <label class="form-label mb-1">ユーザー名</label>
                <div>{{ user?.username }}</div>
              </div>
              <button class="btn btn-outline-primary btn-sm" @click="showUsernameModal = true">
                変更
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <label class="form-label mb-1">メールアドレス</label>
                <div>{{ user?.email }}</div>
              </div>
              <button class="btn btn-outline-primary btn-sm" @click="showEmailModal = true">
                変更
              </button>
            </div>
          </div>
        </div>

        <!-- Last Login Row -->
        <div class="row">
          <div class="col">
            <label class="form-label mb-1">最終ログイン日時</label>
            <div>{{ formatDate(user?.lastLogin) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Button -->
    <button class="btn btn-primary" @click="showPasswordModal = true">
      パスワード変更
    </button>

    <!-- Username Change Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showUsernameModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">ユーザー名変更</h5>
            <button type="button" class="btn-close" @click="closeUsernameModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleUsernameChange">
              <div class="mb-3">
                <label class="form-label">新しいユーザー名</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="newUsername"
                  required
                />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeUsernameModal">
                  キャンセル
                </button>
                <button type="submit" class="btn btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Change Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showEmailModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">メールアドレス変更</h5>
            <button type="button" class="btn-close" @click="closeEmailModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleEmailChange">
              <div class="mb-3">
                <label class="form-label">新しいメールアドレス</label>
                <input 
                  type="email" 
                  class="form-control"
                  v-model="newEmail"
                  required
                />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeEmailModal">
                  キャンセル
                </button>
                <button type="submit" class="btn btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showPasswordModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">パスワード変更</h5>
            <button type="button" class="btn-close" @click="closePasswordModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handlePasswordChange">
              <div class="mb-3">
                <label class="form-label">現在のパスワード</label>
                <input 
                  type="password" 
                  class="form-control"
                  v-model="currentPassword"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">新しいパスワード</label>
                <input 
                  type="password" 
                  class="form-control"
                  v-model="newPassword"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">パスワード確認</label>
                <input 
                  type="password" 
                  class="form-control"
                  v-model="confirmPassword"
                  required
                />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closePasswordModal">
                  キャンセル
                </button>
                <button type="submit" class="btn btn-primary">
                  保存
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
      v-if="showUsernameModal || showEmailModal || showPasswordModal"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../store/user';
import axios from 'axios';

const userStore = useUserStore();
const user = ref<any>(null);

// Modal states
const showUsernameModal = ref(false);
const showEmailModal = ref(false);
const showPasswordModal = ref(false);

// Form fields
const newUsername = ref('');
const newEmail = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const loadUser = async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const response = await axios.get('http://localhost:3001/users');
      const users = response.data;
      user.value = users.find((u: any) => u.email === userData.email);
    }
  } catch (error) {
    console.error('Error loading user:', error);
  }
};

onMounted(() => {
  loadUser();
});

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

const closeUsernameModal = () => {
  showUsernameModal.value = false;
  newUsername.value = '';
};

const closeEmailModal = () => {
  showEmailModal.value = false;
  newEmail.value = '';
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
};

const handleUsernameChange = async () => {
  try {
    if (user.value) {
      await axios.patch(`http://localhost:3001/users/${user.value.id}`, {
        username: newUsername.value
      });
      
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.username = newUsername.value;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      // Update store
      userStore.setUser(storedUser);
      
      await loadUser();
      closeUsernameModal();
    }
  } catch (error) {
    console.error('Error updating username:', error);
  }
};

const handleEmailChange = async () => {
  try {
    if (user.value) {
      await axios.patch(`http://localhost:3001/users/${user.value.id}`, {
        email: newEmail.value
      });
      
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.email = newEmail.value;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      // Update store
      userStore.setUser(storedUser);
      
      await loadUser();
      closeEmailModal();
    }
  } catch (error) {
    console.error('Error updating email:', error);
  }
};

const handlePasswordChange = async () => {
  try {
    if (user.value) {
      // First verify current password
      if (currentPassword.value !== user.value.password) {
        alert('現在のパスワードが正しくありません。');
        return;
      }

      // Check if new password is same as current password
      if (newPassword.value === currentPassword.value) {
        alert('新しいパスワードは現在のパスワードと異なる必要があります。');
        return;
      }

      // Then check if new password and confirmation match
      if (newPassword.value !== confirmPassword.value) {
        alert('新しいパスワードが一致しません。');
        return;
      }

      // If all validations pass, update the password
      await axios.patch(`http://localhost:3001/users/${user.value.id}`, {
        password: newPassword.value
      });
      closePasswordModal();
    }
  } catch (error) {
    console.error('Error updating password:', error);
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.card {
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.form-label {
  color: #6c757d;
  font-size: 0.875rem;
}
</style>