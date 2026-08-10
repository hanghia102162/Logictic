<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import { apiService } from '@/services/api'
import type { AuthUser } from '@/types/auth'
import { LogIn, KeyRound, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-vue-next'

const emit = defineEmits<{
  'login-success': [user: AuthUser]
}>()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const user = await apiService.login(username.value, password.value)
    emit('login-success', user)
  } catch (err: any) {
    errorMessage.value = err.message || 'Tài khoản hoặc mật khẩu không chính xác!'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200/80 animate-fade-in relative overflow-hidden">
      <!-- Top Decorative Accent -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <!-- Header Icon & Title -->
      <div class="text-center space-y-2 mb-8">
        <div class="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-3">
          <ShieldCheck class="w-9 h-9" />
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Đăng Nhập Hệ Thống</h2>
        <p class="text-xs text-slate-500 font-medium">
          Quản lý Đơn hàng & Vận đơn mã QR - HoaHong Logistics
        </p>
      </div>

      <!-- Error alert -->
      <div v-if="errorMessage" class="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Standard Clean Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <User class="w-3.5 h-3.5 text-blue-600" /> Tên Đăng Nhập / Email
          </label>
          <Input
            v-model="username"
            placeholder="Nhập tên đăng nhập hoặc email..."
            class="h-11 bg-white"
            autocomplete="username"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <KeyRound class="w-3.5 h-3.5 text-blue-600" /> Mật Khẩu
          </label>
          <div class="relative">
            <Input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="••••••••"
              class="h-11 pr-10 bg-white"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              title="Ẩn/Hiện mật khẩu"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          class="w-full h-11 text-base font-bold shadow-md shadow-blue-500/20 mt-4"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            Đang xác thực...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <LogIn class="w-4 h-4" /> Đăng Nhập
          </span>
        </Button>
      </form>
    </div>
  </div>
</template>
