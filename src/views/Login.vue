<template>
  <div class="container">
    <div class="row justify-content-center align-items-center min-vh-100">
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-body">
            <h2 class="text-center mb-4">ログイン</h2>
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">メールアドレス</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="username"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">パスワード</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                />
              </div>
              <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>
              <button type="submit" class="btn btn-primary w-100">
                ログイン
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import axios from 'axios';
import bcrypt from 'bcryptjs';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const error = ref('');

const handleLogin = async () => {
  try {
    error.value = '';
    
    // Get users from the mock API
    const response = await axios.get('http://localhost:3001/users');
    const users = response.data;
    
    // Find user by email
    const user = users.find((u: { email: string; }) => u.email === username.value);
    
    // Check if user exists and verify password
    if (user && user.password === password.value) {
    //if (user && await bcrypt.compare(password.value, user.password)) {
      const userData = {
        username: user.username,
        email: user.email,
        company: user.company,
        role: user.role,
        lastLogin: new Date().toISOString()
      };
      
      userStore.setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update last login time
      await axios.patch(`http://localhost:3001/users/${user.id}`, {
        lastLogin: new Date().toISOString()
      });
      
      router.push('/mypage');
    } else {
      error.value = 'メールアドレスまたはパスワードが正しくありません。';
    }
  } catch (err) {
    console.error('Login failed:', err);
    error.value = 'ログインに失敗しました。もう一度お試しください。';
  }
};
</script>

<style scoped>
.alert {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
</style>